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
        background: 'linear-gradient(135deg, #0C4A5A 0%, #119DA4 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        padding: '60px',
      }
    },
      // Gradient overlay for depth
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(110, 226, 142, 0.2) 0%, transparent 50%)',
        }
      }),
      
      // Content container
      React.createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          position: 'relative',
          zIndex: 1,
        }
      },
        // Header section
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }
        },
          // Logo and state badge
          React.createElement('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }
          },
            // Logo
            React.createElement('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
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
              }, React.createElement('div', {
                style: {
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#0C4A5A',
                }
              })),
              React.createElement('div', {
                style: {
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.5px',
                }
              }, 'decigo')
            ),
            // State badge
            React.createElement('div', {
              style: {
                padding: '16px 32px',
                borderRadius: '30px',
                background: plan.locked ? '#6EE28E' : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }
            }, React.createElement('div', {
              style: {
                fontSize: '24px',
                fontWeight: 700,
                color: plan.locked ? '#0C4A5A' : '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }
            }, state))
          ),
          
          // Main title
          React.createElement('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: '20px',
            }
          },
            React.createElement('h1', {
              style: {
                fontSize: '72px',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: '1.1',
                letterSpacing: '-2px',
                margin: 0,
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }
            }, titleText),
            React.createElement('p', {
              style: {
                fontSize: '32px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                margin: 0,
                lineHeight: '1.4',
              }
            }, bodyText)
          )
        ),
        
        // Middle section - Options or countdown
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: '40px',
          }
        },
          countdownChip ? React.createElement('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px 32px',
              borderRadius: '20px',
              background: 'rgba(229, 57, 53, 0.2)',
              border: '2px solid #E53935',
              backdropFilter: 'blur(10px)',
            }
          },
            React.createElement('div', {
              style: {
                fontSize: '40px',
              }
            }, '⏰'),
            React.createElement('div', {
              style: {
                fontSize: '32px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.5px',
              }
            }, countdownChip)
          ) : null,
          
          // Options list (only show top 2 for space)
          !plan.locked && options && options.length > 0 ? React.createElement('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }
          }, ...options.slice(0, 2).map((opt, i) =>
            React.createElement('div', {
              key: i,
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px 24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }
            },
              React.createElement('div', {
                style: {
                  fontSize: '40px',
                  fontWeight: 900,
                  color: '#6EE28E',
                  minWidth: '50px',
                }
              }, `${i + 1}`),
              React.createElement('div', {
                style: {
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: '1.3',
                }
              }, opt.name.length > 40 ? opt.name.substring(0, 40) + '...' : opt.name)
            )
          )) : null,
          
          // Calendar icon for locked plans
          plan.locked ? React.createElement('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '28px 36px',
              borderRadius: '20px',
              background: 'rgba(110, 226, 142, 0.2)',
              border: '3px solid #6EE28E',
              backdropFilter: 'blur(10px)',
            }
          },
            React.createElement('div', {
              style: {
                fontSize: '48px',
              }
            }, '📅'),
            React.createElement('div', {
              style: {
                fontSize: '36px',
                fontWeight: 700,
                color: '#6EE28E',
              }
            }, 'Add to Calendar')
          ) : null
        ),
        
        // Footer CTA
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 32px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            marginTop: '20px',
          }
        }, React.createElement('div', {
          style: {
            fontSize: '28px',
            fontWeight: 600,
            color: '#FFFFFF',
            letterSpacing: '0.5px',
          }
        }, plan.locked ? '👆 Tap to see details' : '🗳️ Vote now to lock in your plans'))
      )
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
