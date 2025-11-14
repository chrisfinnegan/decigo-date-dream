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

    // Get plan to verify it exists
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

    console.log('Generating Decigo logo OG image');

    // Recreate the Decigo logo design
    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F5F3ED',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            },
          },
          // Infinity icon (simplified gradient version)
          React.createElement(
            'svg',
            {
              width: '120',
              height: '80',
              viewBox: '0 0 140 100',
              style: { flexShrink: 0 }
            },
            // Left arc (teal)
            React.createElement('path', {
              d: 'M 30,50 A 20,20 0 1,1 70,50',
              fill: 'none',
              stroke: '#4FADAD',
              strokeWidth: '18',
              strokeLinecap: 'round',
            }),
            // Right arc (lime green)
            React.createElement('path', {
              d: 'M 70,50 A 20,20 0 1,1 110,50',
              fill: 'none',
              stroke: '#A8D05D',
              strokeWidth: '18',
              strokeLinecap: 'round',
            })
          ),
          // Decigo text
          React.createElement('div', {
            style: {
              fontSize: '90px',
              fontWeight: '600',
              color: '#2D6E7E',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-2px',
            }
          }, 'decigo')
        )
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
