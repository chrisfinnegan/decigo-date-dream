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
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
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
      .select('name')
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
    let state = 'Created';
    if (plan.locked) {
      state = 'Locked';
    } else if (voteCount >= threshold - 1 && voteCount < threshold) {
      state = `Near-Lock (${voteCount}/${threshold} voted)`;
    }

    // Generate simple SVG (placeholder for actual image generation)
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#1a1a1a"/>
        <text x="600" y="150" font-family="Arial" font-size="48" fill="#ffffff" text-anchor="middle">${state}</text>
        <text x="600" y="220" font-family="Arial" font-size="24" fill="#888888" text-anchor="middle">${plan.daypart} • ${plan.neighborhood} • ${plan.budget_band}</text>
        ${options?.map((opt, i) => `
          <text x="600" y="${300 + (i * 60)}" font-family="Arial" font-size="32" fill="#cccccc" text-anchor="middle">${i + 1}. ${opt.name}</text>
        `).join('')}
        <text x="600" y="580" font-family="Arial" font-size="20" fill="#666666" text-anchor="middle">Vote now to lock in your plans</text>
      </svg>
    `;

    console.log('OG image generated for plan:', planId);

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
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
