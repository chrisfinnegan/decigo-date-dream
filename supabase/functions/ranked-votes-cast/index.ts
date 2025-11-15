import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RankedVoteSchema = z.object({
  planId: z.string().uuid(),
  rankings: z.record(z.string().uuid(), z.number().min(1).max(3)),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const validated = RankedVoteSchema.parse(body);
    const { planId, rankings } = validated;
    
    // Generate voter hash from IP and User-Agent
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const voterIdentity = `${clientIp}:${userAgent}:${planId}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(voterIdentity);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const voterHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check if plan is locked or canceled
    const { data: plan } = await supabaseClient
      .from('plans')
      .select('locked, canceled, headcount')
      .eq('id', planId)
      .single();

    if (plan?.locked || plan?.canceled) {
      console.log('Vote blocked - plan locked or canceled:', planId);
      return new Response(
        JSON.stringify({ error: 'Unable to vote. Plan is no longer accepting votes.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify all 3 options are ranked
    const rankValues = Object.values(rankings);
    if (rankValues.length !== 3 || !rankValues.includes(1) || !rankValues.includes(2) || !rankValues.includes(3)) {
      return new Response(
        JSON.stringify({ error: 'You must rank all 3 options (1st, 2nd, 3rd)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if voter has already submitted rankings
    const { data: existingVote } = await supabaseClient
      .from('ranked_votes')
      .select('id')
      .eq('plan_id', planId)
      .eq('voter_hash', voterHash)
      .maybeSingle();

    if (existingVote) {
      // Update existing vote
      const { error } = await supabaseClient
        .from('ranked_votes')
        .update({ rankings, created_at: new Date().toISOString() })
        .eq('id', existingVote.id);

      if (error) {
        console.error('Error updating ranked vote:', error);
        return new Response(
          JSON.stringify({ error: 'Unable to update vote. Please try again.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Ranked vote updated:', existingVote.id);
    } else {
      // Create new vote
      const { data: vote, error } = await supabaseClient
        .from('ranked_votes')
        .insert({ plan_id: planId, voter_hash: voterHash, rankings })
        .select()
        .single();

      if (error) {
        console.error('Error casting ranked vote:', error);
        return new Response(
          JSON.stringify({ error: 'Unable to cast vote. Please try again.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Ranked vote cast:', vote.id);
    }

    // Check if all participants have voted
    const { count } = await supabaseClient
      .from('ranked_votes')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', planId);

    const allVotesIn = count === plan?.headcount;

    return new Response(
      JSON.stringify({ 
        success: true, 
        allVotesIn,
        votesReceived: count,
        totalExpected: plan?.headcount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ranked-votes-cast:', error);
    const errorMessage = error instanceof z.ZodError 
      ? 'Invalid request data'
      : 'An unexpected error occurred. Please try again.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
