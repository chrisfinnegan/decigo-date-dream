import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VoteSchema = z.object({
  planId: z.string().uuid(),
  optionId: z.string().uuid(),
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

    // Validate input
    const body = await req.json();
    const validated = VoteSchema.parse(body);
    const { planId, optionId } = validated;
    
    // Generate server-side voter hash from IP and User-Agent for basic identity
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const voterIdentity = `${clientIp}:${userAgent}:${planId}`;
    
    // Create hash from identity
    const encoder = new TextEncoder();
    const data = encoder.encode(voterIdentity);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const voterHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check if plan is locked or canceled
    const { data: plan } = await supabaseClient
      .from('plans')
      .select('locked, canceled')
      .eq('id', planId)
      .single();

    if (plan?.locked || plan?.canceled) {
      console.log('Vote blocked - plan locked or canceled:', planId);
      return new Response(
        JSON.stringify({ error: 'Unable to vote. Plan is no longer accepting votes.' }),
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
      console.log('Duplicate vote blocked:', { planId, optionId, voterHash: voterHash.substring(0, 8) });
      return new Response(
        JSON.stringify({ error: 'You have already voted for this option' }),
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
        JSON.stringify({ error: 'Unable to cast vote. Please try again.' }),
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
    const errorMessage = error instanceof z.ZodError 
      ? 'Invalid request data'
      : 'An unexpected error occurred. Please try again.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
