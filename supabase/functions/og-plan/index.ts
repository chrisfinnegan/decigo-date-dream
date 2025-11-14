import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import satori from "https://esm.sh/satori@0.10.9";
import { Resvg } from "https://esm.sh/@resvg/resvg-js@2.6.0";
import { h } from "https://esm.sh/preact@10.11.3";

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

    // Get options (top 2)
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
    const decisionDeadline = new Date(plan.decision_deadline);
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

    console.log('Generating PNG image for plan:', planId, 'state:', state);

    // Build options list
    const optionsList = !plan.locked && options && options.length > 0 
      ? options.map((opt, i) =>
          h('div', {
            key: `opt-${i}`,
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px 24px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }
          }, [
            h('div', {
              style: {
                fontSize: '40px',
                fontWeight: 900,
                color: '#6EE28E',
                minWidth: '50px',
              }
            }, `${i + 1}`),
            h('div', {
              style: {
                fontSize: '28px',
                fontWeight: 600,
                color: '#FFFFFF',
                lineHeight: '1.3',
              }
            }, opt.name.length > 40 ? opt.name.substring(0, 40) + '...' : opt.name)
          ])
        )
      : [];

    const svg = await satori(
      h('div', {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0C4A5A 0%, #119DA4 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '60px',
        }
      }, [
        // Gradient overlay
        h('div', {
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(110, 226, 142, 0.2) 0%, transparent 50%)',
          }
        }),
        // Main content
        h('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            position: 'relative',
            zIndex: 1,
          }
        }, [
          // Header
          h('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }
          }, [
            // Logo and badge
            h('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }
            }, [
              // Logo
              h('div', {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }
              }, [
                h('div', {
                  style: {
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#6EE28E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                }, [
                  h('div', {
                    style: {
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#0C4A5A',
                    }
                  })
                ]),
                h('div', {
                  style: {
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.5px',
                  }
                }, 'decigo')
              ]),
              // State badge
              h('div', {
                style: {
                  padding: '16px 32px',
                  borderRadius: '30px',
                  background: plan.locked ? '#6EE28E' : 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }
              }, [
                h('div', {
                  style: {
                    fontSize: '24px',
                    fontWeight: 700,
                    color: plan.locked ? '#0C4A5A' : '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }
                }, state)
              ])
            ]),
            // Title section
            h('div', {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '20px',
              }
            }, [
              h('h1', {
                style: {
                  fontSize: '72px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: '1.1',
                  letterSpacing: '-2px',
                  margin: 0,
                }
              }, titleText),
              h('p', {
                style: {
                  fontSize: '32px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  margin: 0,
                  lineHeight: '1.4',
                }
              }, bodyText)
            ])
          ]),
          // Middle section - Options
          optionsList.length > 0 ? h('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: '40px',
            }
          }, optionsList) : null,
          // Footer
          h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 32px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              marginTop: '20px',
            }
          }, [
            h('div', {
              style: {
                fontSize: '28px',
                fontWeight: 600,
                color: '#FFFFFF',
                letterSpacing: '0.5px',
              }
            }, plan.locked ? '👆 Tap to see details' : '🗳️ Vote now to lock in your plans')
          ])
        ])
      ]),
      {
        width: 1200,
        height: 630,
      }
    );

    // Convert SVG to PNG using Resvg
    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
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
