import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UpdateSchema = z.object({
  planId: z.string().uuid(),
  token: z.string().min(1).max(100),
  updates: z.record(z.any()),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = await req.json();
    const { planId, token, updates } = UpdateSchema.parse(body);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify magic token and update plan
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .update(updates)
      .eq('id', planId)
      .eq('magic_token', token)
      .eq('locked', false) // Only allow updates if plan is not locked
      .eq('canceled', false) // Only allow updates if plan is not canceled
      .select()
      .single();

    if (planError || !plan) {
      console.error('Plan update failed:', planError);
      return new Response(
        JSON.stringify({ error: 'Unable to update plan. Invalid credentials or plan is locked/canceled.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Plan updated:', planId);

    return new Response(
      JSON.stringify({ plan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in plans-update:', error);
    const errorMessage = error instanceof z.ZodError 
      ? 'Invalid request data'
      : 'An unexpected error occurred. Please try again.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
