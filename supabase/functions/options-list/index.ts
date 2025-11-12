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
    const url = new URL(req.url);
    const planId = url.searchParams.get('planId');
    const mode = url.searchParams.get('mode') || 'top3';

    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'planId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
    );

    // Get options based on mode
    const limit = mode === 'top3' ? 3 : 20;
    
    const { data: options, error } = await supabaseClient
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
