import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ImageResponse } from "https://deno.land/x/og_edge@0.0.6/mod.ts";
import React from "https://esm.sh/react@18.2.0";

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
      bodyText = `${plan.daypart} • ${plan.neighborhood}`;
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
      bodyText = `${plan.daypart} • ${plan.neighborhood}`;
    }

    console.log('Generating PNG image for plan:', planId, 'state:', state);

    // Generate PNG using ImageResponse with simplified design
    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #0C4A5A 0%, #119DA4 100%)',
            padding: '60px',
            fontFamily: 'system-ui, sans-serif',
          }
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '60px',
            }
          },
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }
            },
            React.createElement('div', {
              style: {
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#6EE28E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }
            }),
            React.createElement('span', {
              style: {
                fontSize: '32px',
                fontWeight: '700',
                color: '#FFFFFF',
              }
            }, 'decigo')
          ),
          React.createElement(
            'div',
            {
              style: {
                padding: '16px 32px',
                borderRadius: '32px',
                background: plan.locked ? '#6EE28E' : 'rgba(255, 255, 255, 0.2)',
                fontSize: '20px',
                fontWeight: '700',
                color: plan.locked ? '#0C4A5A' : '#FFFFFF',
              }
            },
            state.toUpperCase()
          )
        ),
        React.createElement('div', {
          style: {
            fontSize: '64px',
            fontWeight: '900',
            color: '#FFFFFF',
            marginBottom: '20px',
            lineHeight: 1.1,
          }
        }, titleText.length > 30 ? titleText.substring(0, 30) + '...' : titleText),
        React.createElement('div', {
          style: {
            fontSize: '28px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
          }
        }, bodyText),
        !plan.locked && options && options.length > 0 ? React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '40px',
            }
          },
          ...options.slice(0, 2).map((opt, i) => 
            React.createElement(
              'div',
              {
                key: i,
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '30px',
                  padding: '24px 30px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.15)',
                }
              },
              React.createElement('span', {
                style: {
                  fontSize: '36px',
                  fontWeight: '900',
                  color: '#6EE28E',
                }
              }, String(i + 1)),
              React.createElement('span', {
                style: {
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                }
              }, opt.name.length > 50 ? opt.name.substring(0, 50) + '...' : opt.name)
            )
          )
        ) : null,
        React.createElement(
          'div',
          {
            style: {
              marginTop: 'auto',
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              fontSize: '24px',
              fontWeight: '600',
              color: '#FFFFFF',
            }
          },
          plan.locked ? '👆 Tap to see details' : '🗳️ Vote now to lock in your plans'
        )
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error in og-plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
