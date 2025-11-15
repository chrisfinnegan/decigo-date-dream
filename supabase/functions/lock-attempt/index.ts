import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LockAttemptSchema = z.object({
  planId: z.string().uuid(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = await req.json();
    const { planId } = LockAttemptSchema.parse(body);

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
      console.error('Plan not found:', planError);
      return new Response(
        JSON.stringify({ error: 'Plan not found or has been canceled' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already locked (idempotent response)
    if (plan.locked) {
      // Get the locked option
      const { data: votes } = await supabaseClient
        .from('votes')
        .select('option_id')
        .eq('plan_id', planId);

      const votesByOption = votes?.reduce((acc: Record<string, number>, vote) => {
        acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
        return acc;
      }, {}) || {};

      let winningOptionId: string | null = null;
      let maxVotes = 0;
      for (const [optionId, count] of Object.entries(votesByOption)) {
        if (count > maxVotes) {
          maxVotes = count;
          winningOptionId = optionId;
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          locked: true, 
          alreadyLocked: true,
          locked_at: plan.locked_at,
          chosen_option_id: winningOptionId,
          total_votes: maxVotes
        }),
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
      // Lock the plan (with idempotency check)
      const { error: lockError } = await supabaseClient
        .from('plans')
        .update({ 
          locked: true, 
          locked_at: now.toISOString()
        })
        .eq('id', planId)
        .eq('locked', false); // Only lock if not already locked

      if (lockError) {
        console.error('Error locking plan:', lockError);
      }

      console.log('Plan locked:', planId, 'Option:', winningOptionId, 'Votes:', maxVotes);

      return new Response(
        JSON.stringify({ 
          success: true,
          locked: true, 
          locked_at: now.toISOString(),
          chosen_option_id: winningOptionId,
          total_votes: maxVotes
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        locked: false, 
        currentVotes: maxVotes, 
        threshold,
        timeRemaining: deadline.getTime() - now.getTime()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in lock-attempt:', error);
    const errorMessage = error instanceof z.ZodError 
      ? 'Invalid request data'
      : 'An unexpected error occurred. Please try again.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
