import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import React from "https://esm.sh/react@18.2.0";
import { ImageResponse } from "https://deno.land/x/og_edge@0.0.6/mod.ts";

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

    console.log('Generating PNG image for plan:', planId, 'state:', state);

    // Build options list elements
    const optionElements = !plan.locked && options ? options.slice(0, 3).map((opt, i) =>
      React.createElement('div', {
        key: i,
        style: {
          fontSize: '20px',
          color: '#334155',
          fontWeight: 500,
        }
      }, `${i + 1}. ${opt.name}`)
    ) : [];

    const content = React.createElement('div', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFF8F2',
        fontFamily: 'Inter, Arial, sans-serif',
        position: 'relative',
      }
    },
      // Top gradient stripe
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: 'linear-gradient(90deg, #119DA4 0%, #6EE28E 60%, #B7F464 100%)',
        }
      }),
      // Logo mark
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: '30px',
          left: '30px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#119DA4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }, React.createElement('div', {
        style: {
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#FFF8F2',
        }
      })),
      // State badge
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: '80px',
          left: '80px',
          padding: '12px 24px',
          borderRadius: '24px',
          background: '#0C4A5A',
          color: '#FFFFFF',
          fontSize: '20px',
          fontWeight: 600,
        }
      }, state),
      // Main content
      React.createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
          textAlign: 'center',
        }
      },
        React.createElement('h1', {
          style: {
            fontSize: '48px',
            fontWeight: 700,
            color: '#0C4A5A',
            margin: '20px 0',
            fontFamily: 'Poppins, Arial, sans-serif',
          }
        }, titleText),
        React.createElement('p', {
          style: {
            fontSize: '24px',
            color: '#334155',
            margin: '10px 0',
          }
        }, bodyText),
        countdownChip ? React.createElement('div', {
          style: {
            marginTop: '20px',
            padding: '8px 16px',
            borderRadius: '18px',
            background: 'rgba(229, 57, 53, 0.1)',
            color: '#E53935',
            fontSize: '18px',
            fontWeight: 600,
          }
        }, countdownChip) : null,
        // Options list or calendar prompt
        optionElements.length > 0 ? React.createElement('div', {
          style: {
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }
        }, ...optionElements) : null,
        plan.locked ? React.createElement('div', {
          style: {
            marginTop: '40px',
            fontSize: '28px',
            color: '#119DA4',
            fontWeight: 600,
          }
        }, '📅 Add to Calendar') : null
      ),
      // Footer CTA
      React.createElement('div', {
        style: {
          position: 'absolute',
          bottom: '60px',
          fontSize: '22px',
          color: '#334155',
          opacity: 0.8,
        }
      }, plan.locked ? 'Tap to see details' : 'Vote now to lock in your plans'),
      // Bottom accent line
      React.createElement('div', {
        style: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: 'linear-gradient(90deg, #119DA4 0%, #6EE28E 60%, #B7F464 100%)',
        }
      })
    );

    return new ImageResponse(content, {
      width: 1200,
      height: 630,
      headers: {
        ...corsHeaders,
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
