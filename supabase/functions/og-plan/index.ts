import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const planId = url.searchParams.get('id');

    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get plan
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('canceled', false)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get options (top 3)
    const { data: options } = await supabaseClient
      .from('options')
      .select('name, address, rank')
      .eq('plan_id', planId)
      .order('rank', { ascending: true })
      .limit(3);

    // Get vote counts
    const { data: votes } = await supabaseClient
      .from('votes')
      .select('option_id')
      .eq('plan_id', planId);

    const voteCount = votes?.length || 0;
    const threshold = plan.threshold || Math.min(4, plan.headcount);

    // Determine state
    const now = new Date();
    const dateStart = new Date(plan.date_start);
    const decisionDeadline = new Date(plan.decision_deadline);
    const isTonight = dateStart.toDateString() === now.toDateString();
    const daysUntil = Math.ceil((dateStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const hoursUntilDeadline = Math.ceil((decisionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60));

    let state = '';
    let titleText = '';
    let bodyText = '';

    if (plan.locked) {
      state = 'Locked';
      const lockedOption = options?.[0];
      const startTime = dateStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      titleText = lockedOption ? `${lockedOption.name}` : `Locked`;
      bodyText = lockedOption ? `${startTime} • ${lockedOption.address}` : `${plan.daypart} in ${plan.neighborhood}`;
    } else if (voteCount >= threshold - 1 && voteCount < threshold) {
      state = 'Near-Lock';
      titleText = `${voteCount}/${threshold} voted — one more to lock`;
      bodyText = `${plan.daypart} • ${plan.neighborhood} • ${plan.budget_band}`;
    } else {
      state = 'Vote Now';
      if (isTonight) {
        titleText = 'Vote on tonight\'s plan';
      } else if (daysUntil <= 7) {
        const weekday = dateStart.toLocaleDateString('en-US', { weekday: 'long' });
        titleText = `Vote for ${weekday} night`;
      } else {
        titleText = `Vote on ${plan.daypart} plans`;
      }
      bodyText = `${plan.daypart} • ${plan.neighborhood} • ${plan.budget_band}`;
    }

    // Build countdown chip if scheduled
    let countdownChip = '';
    if (!plan.locked && hoursUntilDeadline > 0 && hoursUntilDeadline < 72) {
      if (hoursUntilDeadline < 24) {
        countdownChip = `Locks in ${hoursUntilDeadline}h`;
      } else {
        const daysLeft = Math.ceil(hoursUntilDeadline / 24);
        countdownChip = `Locks in ${daysLeft}d`;
      }
    }

    // Create options list with proper escaping
    const optionsList = options?.slice(0, 3).map((opt, i) => {
      const escapedName = opt.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      return `<text x="600" y="${340 + (i * 50)}" font-family="Inter, Arial, sans-serif" font-size="24" fill="#334155" text-anchor="middle" font-weight="500">${i + 1}. ${escapedName}</text>`;
    }).join('') || '';

    // Generate SVG (we'll use SVG as it's simpler than PNG generation in Deno)
    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#FFF8F2"/>
  
  <!-- Brand gradient stripe (top) -->
  <defs>
    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#119DA4;stop-opacity:1" />
      <stop offset="60%" style="stop-color:#6EE28E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B7F464;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="8" fill="url(#brandGradient)"/>
  
  <!-- Logo mark (top-left) -->
  <circle cx="50" cy="50" r="20" fill="#119DA4"/>
  <circle cx="50" cy="50" r="12" fill="#FFF8F2"/>
  
  <!-- State badge -->
  <rect x="80" y="80" width="${state.length * 16 + 40}" height="48" rx="24" fill="#0C4A5A"/>
  <text x="${80 + (state.length * 16 + 40) / 2}" y="110" font-family="Inter, Arial, sans-serif" font-size="20" fill="#FFFFFF" text-anchor="middle" font-weight="600">${state}</text>
  
  <!-- Title -->
  <text x="600" y="200" font-family="Poppins, Arial, sans-serif" font-size="48" fill="#0C4A5A" text-anchor="middle" font-weight="700">${titleText}</text>
  
  <!-- Body line -->
  <text x="600" y="250" font-family="Inter, Arial, sans-serif" font-size="24" fill="#334155" text-anchor="middle" font-weight="400">${bodyText}</text>
  
  ${countdownChip ? `
  <!-- Countdown chip -->
  <rect x="${600 - (countdownChip.length * 8)}" y="270" width="${countdownChip.length * 16}" height="36" rx="18" fill="#E53935" opacity="0.1"/>
  <text x="600" y="295" font-family="Inter, Arial, sans-serif" font-size="18" fill="#E53935" text-anchor="middle" font-weight="600">${countdownChip}</text>
  ` : ''}
  
  ${!plan.locked ? `
  <!-- Options list -->
  ${optionsList}
  ` : ''}
  
  ${plan.locked ? `
  <!-- Add to Calendar label -->
  <text x="600" y="360" font-family="Inter, Arial, sans-serif" font-size="28" fill="#119DA4" text-anchor="middle" font-weight="600">📅 Add to Calendar</text>
  ` : ''}
  
  <!-- Footer CTA -->
  <text x="600" y="${plan.locked ? 520 : 540}" font-family="Inter, Arial, sans-serif" font-size="22" fill="#334155" text-anchor="middle" opacity="0.8">${plan.locked ? 'Tap to see details' : 'Vote now to lock in your plans'}</text>
  
  <!-- Bottom accent line -->
  <rect y="622" width="1200" height="8" fill="url(#brandGradient)"/>
</svg>`;

    console.log('OG image generated for plan:', planId, 'state:', state);

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
        'ETag': `"${planId}-${plan.locked ? 'locked' : voteCount}"`,
      },
    });
  } catch (error) {
    console.error('Error in og-plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
