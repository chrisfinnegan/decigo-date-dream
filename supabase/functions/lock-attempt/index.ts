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
    const { planId } = await req.json();

    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'planId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get plan details
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

    // Check if already locked
    if (plan.locked) {
      return new Response(
        JSON.stringify({ locked: true, alreadyLocked: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate threshold
    const threshold = plan.threshold || Math.min(4, plan.headcount);

    // Get votes by option
    const { data: votes } = await supabaseClient
      .from('votes')
      .select('option_id')
      .eq('plan_id', planId);

    const votesByOption = votes?.reduce((acc: Record<string, number>, vote) => {
      acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
      return acc;
    }, {}) || {};

    // Find option with most votes
    let winningOptionId: string | null = null;
    let maxVotes = 0;
    for (const [optionId, count] of Object.entries(votesByOption)) {
      if (count > maxVotes) {
        maxVotes = count;
        winningOptionId = optionId;
      }
    }

    // Check if we should lock
    const now = new Date();
    const deadline = new Date(plan.decision_deadline);
    const shouldLock = (maxVotes >= threshold) || (now >= deadline && winningOptionId);

    if (shouldLock && winningOptionId) {
      // Lock the plan
      await supabaseClient
        .from('plans')
        .update({ 
          locked: true, 
          locked_at: now.toISOString()
        })
        .eq('id', planId);

      console.log('Plan locked:', planId, 'Option:', winningOptionId);

      return new Response(
        JSON.stringify({ locked: true, optionId: winningOptionId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        locked: false, 
        currentVotes: maxVotes, 
        threshold,
        timeRemaining: deadline.getTime() - now.getTime()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in lock-attempt:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
