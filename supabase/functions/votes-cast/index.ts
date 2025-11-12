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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { planId, optionId, voterHash } = await req.json();

    if (!planId || !optionId || !voterHash) {
      return new Response(
        JSON.stringify({ error: 'planId, optionId, and voterHash are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if plan is locked or canceled
    const { data: plan } = await supabaseClient
      .from('plans')
      .select('locked, canceled')
      .eq('id', planId)
      .single();

    if (plan?.locked || plan?.canceled) {
      return new Response(
        JSON.stringify({ error: 'Plan is locked or canceled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if voter has already voted for this option
    const { data: existingVote } = await supabaseClient
      .from('votes')
      .select('id')
      .eq('plan_id', planId)
      .eq('option_id', optionId)
      .eq('voter_hash', voterHash)
      .maybeSingle();

    if (existingVote) {
      return new Response(
        JSON.stringify({ error: 'Already voted for this option' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cast the vote
    const { data: vote, error } = await supabaseClient
      .from('votes')
      .insert({ plan_id: planId, option_id: optionId, voter_hash: voterHash })
      .select()
      .single();

    if (error) {
      console.error('Error casting vote:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Vote cast:', vote.id);

    return new Response(
      JSON.stringify({ success: true, voteId: vote.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in votes-cast:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
