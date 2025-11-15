import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ComputeWinnerSchema = z.object({
  planId: z.string().uuid(),
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
    const validated = ComputeWinnerSchema.parse(body);
    const { planId } = validated;

    // Fetch plan and votes
    const { data: plan } = await supabaseClient
      .from('plans')
      .select('headcount, locked')
      .eq('id', planId)
      .single();

    if (!plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (plan.locked) {
      return new Response(
        JSON.stringify({ error: 'Plan already locked' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all ranked votes
    const { data: votes } = await supabaseClient
      .from('ranked_votes')
      .select('*')
      .eq('plan_id', planId);

    if (!votes || votes.length !== plan.headcount) {
      return new Response(
        JSON.stringify({ error: 'Not all participants have voted yet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compute scores: 1st place = 3 points, 2nd = 2 points, 3rd = 1 point
    const scores: Record<string, number> = {};
    const firstPlaceVotes: Record<string, number> = {};
    
    votes.forEach(vote => {
      const rankings = vote.rankings as Record<string, number>;
      Object.entries(rankings).forEach(([optionId, rank]) => {
        const points = 4 - rank; // 1st=3pts, 2nd=2pts, 3rd=1pt
        scores[optionId] = (scores[optionId] || 0) + points;
        
        if (rank === 1) {
          firstPlaceVotes[optionId] = (firstPlaceVotes[optionId] || 0) + 1;
        }
      });
    });

    console.log('Computed scores:', scores);
    console.log('First place votes:', firstPlaceVotes);

    // Find options with max score
    const maxScore = Math.max(...Object.values(scores));
    const tiedOptions = Object.entries(scores)
      .filter(([_, score]) => score === maxScore)
      .map(([optionId]) => optionId);

    let winnerId: string;
    let tieBreakerUsed = 'none';

    if (tiedOptions.length === 1) {
      // Clear winner
      winnerId = tiedOptions[0];
    } else {
      console.log('Tie detected between options:', tiedOptions);
      
      // Tie-breaker 1: Most first-place votes
      const maxFirstPlace = Math.max(...tiedOptions.map(id => firstPlaceVotes[id] || 0));
      const tiedAfterFirstPlace = tiedOptions.filter(id => (firstPlaceVotes[id] || 0) === maxFirstPlace);
      
      if (tiedAfterFirstPlace.length === 1) {
        winnerId = tiedAfterFirstPlace[0];
        tieBreakerUsed = 'top_rank_presence';
        console.log('Winner by first-place votes:', winnerId);
      } else if (plan.headcount === 2) {
        // For 2-person groups: check turn fairness
        const participantHashes = votes.map(v => v.voter_hash).sort();
        const hashKey = participantHashes.join(':');
        
        // Look for previous decisions between these two participants
        const { data: history } = await supabaseClient
          .from('decision_history')
          .select('*')
          .contains('participant_hashes', participantHashes)
          .order('created_at', { ascending: false })
          .limit(1);

        if (history && history.length > 0) {
          // Find who got their top choice last time
          const lastWinnerHash = history[0].winner_voter_hash;
          const otherParticipant = participantHashes.find(h => h !== lastWinnerHash);
          
          if (otherParticipant) {
            // Give this person's top choice priority
            const otherVote = votes.find(v => v.voter_hash === otherParticipant);
            if (otherVote) {
              const otherTopChoice = Object.entries(otherVote.rankings as Record<string, number>)
                .find(([_, rank]) => rank === 1)?.[0];
              
              if (otherTopChoice && tiedAfterFirstPlace.includes(otherTopChoice)) {
                winnerId = otherTopChoice;
                tieBreakerUsed = 'turn_fairness';
                console.log('Winner by turn fairness (other person\'s turn):', winnerId);
              }
            }
          }
        }
        
        if (!winnerId!) {
          // Random choice among tied options
          winnerId = tiedAfterFirstPlace[Math.floor(Math.random() * tiedAfterFirstPlace.length)];
          tieBreakerUsed = 'random';
          console.log('Winner by random selection:', winnerId);
        }
      } else {
        // For 3-person groups: would need lightning runoff, but for now use random
        // TODO: Implement lightning runoff for 3-person ties
        winnerId = tiedAfterFirstPlace[Math.floor(Math.random() * tiedAfterFirstPlace.length)];
        tieBreakerUsed = 'random';
        console.log('Winner by random selection (3-person):', winnerId);
      }
    }

    // Find winner's voter hash (who got their top choice)
    let winnerVoterHash = '';
    for (const vote of votes) {
      const rankings = vote.rankings as Record<string, number>;
      if (rankings[winnerId] === 1) {
        winnerVoterHash = vote.voter_hash;
        break;
      }
    }

    // Update plan with winner
    const { error: updateError } = await supabaseClient
      .from('plans')
      .update({
        winner_option_id: winnerId,
        computed_scores: scores,
        tie_breaker_used: tieBreakerUsed,
        locked: true,
        locked_at: new Date().toISOString(),
      })
      .eq('id', planId);

    if (updateError) {
      console.error('Error updating plan:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to lock plan with winner' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record decision history for turn fairness
    if (plan.headcount === 2 && winnerVoterHash) {
      const participantHashes = votes.map(v => v.voter_hash).sort();
      await supabaseClient
        .from('decision_history')
        .insert({
          plan_id: planId,
          winner_voter_hash: winnerVoterHash,
          participant_hashes: participantHashes,
        });
    }

    console.log('Winner computed and plan locked:', { winnerId, tieBreakerUsed });

    return new Response(
      JSON.stringify({
        success: true,
        winnerId,
        scores,
        tieBreakerUsed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ranked-votes-compute-winner:', error);
    const errorMessage = error instanceof z.ZodError 
      ? 'Invalid request data'
      : 'An unexpected error occurred. Please try again.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
