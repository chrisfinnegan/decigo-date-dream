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
    // Support both query params and body for flexibility
    let planId: string | null = null;
    let mode: string = 'top3';
    
    if (req.method === 'POST') {
      const body = await req.json();
      planId = body.planId;
      mode = body.mode || 'top3';
    } else {
      const url = new URL(req.url);
      planId = url.searchParams.get('planId');
      mode = url.searchParams.get('mode') || 'top3';
    }

    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'planId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get options based on mode
    const limit = mode === 'top3' ? 3 : 20;
    
    // Try to get options from database first
    const { data: existingOptions, error } = await supabaseClient
      .from('options')
      .select('*')
      .eq('plan_id', planId)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching options:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If options exist in database, return them
    // Google Places integration will be added in plans-create function
    const options = existingOptions || [];

    console.log('Options retrieved:', options.length);

    return new Response(
      JSON.stringify({ options }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in options-list:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
