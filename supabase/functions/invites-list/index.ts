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
      .select('*')
      .eq('id', planId)
      .eq('magic_token', token)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan or token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all invites for this plan
    const { data: invites, error: invitesError } = await supabaseClient
      .from('invites')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false });

    if (invitesError) {
      throw invitesError;
    }

    console.log(`Retrieved ${invites?.length || 0} invites for plan ${planId}`);

    return new Response(
      JSON.stringify({ invites: invites || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in invites-list:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
