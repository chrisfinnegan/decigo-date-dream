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
    const { planId, token } = await req.json();

    if (!planId || !token) {
      return new Response(
        JSON.stringify({ error: 'planId and token are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify magic token
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('id, magic_token, canceled')
      .eq('id', planId)
      .eq('magic_token', token)
      .single();

    if (planError || !plan || plan.canceled) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan or token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already rerolled
    const { data: existingOptions } = await supabaseClient
      .from('options')
      .select('id')
      .eq('plan_id', planId);

    if (existingOptions && existingOptions.length > 3) {
      return new Response(
        JSON.stringify({ error: 'Reroll already used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current option IDs to avoid duplicates
    const currentOptionIds = existingOptions?.map(o => o.id) || [];

    // TODO: In production, generate new options via AI/Places API
    // For now, return placeholder message
    console.log('Reroll requested for plan:', planId);
    console.log('Current options to avoid:', currentOptionIds);

    return new Response(
      JSON.stringify({ 
        message: 'Reroll functionality requires AI/Places API integration',
        currentOptions: existingOptions?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in plans-reroll:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
