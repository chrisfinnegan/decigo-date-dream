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

    console.log('OG image requested for plan:', planId);

    if (!planId) {
      console.error('No planId provided');
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
      console.error('Plan not found:', planError);
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Plan found, generating OG image for state:', plan.locked ? 'locked' : 'created');

    // Get options (top 2 for better readability)
    const { data: options } = await supabaseClient
      .from('options')
      .select('name, address, rank')
      .eq('plan_id', planId)
      .order('rank', { ascending: true })
      .limit(2);

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
    const isTonight = dateStart.toDateString() === now.toDateString();
    const daysUntil = Math.ceil((dateStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

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

    console.log('Generating SVG image for plan:', planId, 'state:', state);

    // Generate SVG (much faster and more reliable than ImageResponse)
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0C4A5A;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#119DA4;stop-opacity:1" />
          </linearGradient>
          <radialGradient id="overlay" cx="100%" cy="0%">
            <stop offset="0%" style="stop-color:#6EE28E;stop-opacity:0.2" />
            <stop offset="50%" style="stop-color:#6EE28E;stop-opacity:0" />
          </radialGradient>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)"/>
        <rect width="1200" height="630" fill="url(#overlay)"/>
        
        <!-- Logo circle -->
        <circle cx="84" cy="84" r="24" fill="#6EE28E"/>
        <circle cx="84" cy="84" r="14" fill="#0C4A5A"/>
        
        <!-- Logo text -->
        <text x="118" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF" letter-spacing="-0.5">decigo</text>
        
        <!-- State badge -->
        <rect x="${1200 - 200}" y="52" width="160" height="64" rx="32" fill="${plan.locked ? '#6EE28E' : 'rgba(255, 255, 255, 0.2)'}" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2"/>
        <text x="${1200 - 120}" y="92" font-family="system-ui" font-size="24" font-weight="700" fill="${plan.locked ? '#0C4A5A' : '#FFFFFF'}" text-anchor="middle" letter-spacing="1">${state.toUpperCase()}</text>
        
        <!-- Title -->
        <text x="60" y="210" font-family="system-ui" font-size="72" font-weight="900" fill="#FFFFFF" letter-spacing="-2">
          ${titleText.length > 25 ? titleText.substring(0, 25) + '...' : titleText}
        </text>
        
        <!-- Body text -->
        <text x="60" y="260" font-family="system-ui" font-size="32" font-weight="500" fill="rgba(255, 255, 255, 0.9)">
          ${bodyText}
        </text>
        
        <!-- Options -->
        ${!plan.locked && options && options.length > 0 ? options.map((opt, i) => `
          <g transform="translate(60, ${340 + (i * 100)})">
            <rect width="1080" height="80" rx="16" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2"/>
            <text x="30" y="50" font-family="system-ui" font-size="40" font-weight="900" fill="#6EE28E">${i + 1}</text>
            <text x="90" y="50" font-family="system-ui" font-size="28" font-weight="600" fill="#FFFFFF">
              ${opt.name.length > 45 ? opt.name.substring(0, 45) + '...' : opt.name}
            </text>
          </g>
        `).join('') : ''}
        
        <!-- Footer -->
        <rect x="60" y="${plan.locked || !options || options.length === 0 ? 340 : 560}" width="1080" height="80" rx="20" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2"/>
        <text x="600" y="${plan.locked || !options || options.length === 0 ? 390 : 610}" font-family="system-ui" font-size="28" font-weight="600" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">
          ${plan.locked ? '👆 Tap to see details' : '🗳️ Vote now to lock in your plans'}
        </text>
      </svg>
    `;

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
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
