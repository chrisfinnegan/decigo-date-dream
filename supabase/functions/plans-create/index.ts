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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const {
      daypart,
      date_start,
      date_end,
      neighborhood,
      headcount,
      budget_band,
      two_stop = false,
      notes_raw,
      notes_chips = [],
    } = body;

    // Generate a unique magic token
    const magic_token = crypto.randomUUID();

    // Calculate decision deadline (default: 24 hours from now)
    const decision_deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    // Calculate threshold (min of 4 or group size)
    const threshold = Math.min(4, headcount);

    // Create the plan
    const { data: plan, error } = await supabaseClient
      .from('plans')
      .insert({
        daypart,
        date_start,
        date_end,
        neighborhood,
        headcount,
        budget_band,
        two_stop,
        notes_raw,
        notes_chips,
        mode: 'top3',
        decision_deadline,
        threshold,
        magic_token,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Plan created:', plan.id);

    return new Response(
      JSON.stringify({ planId: plan.id, magicToken: magic_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in plans-create:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
