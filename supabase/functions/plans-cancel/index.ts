import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CancelSchema = z.object({
  planId: z.string().uuid(),
  token: z.string().min(1).max(100),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = await req.json();
    const { planId, token } = CancelSchema.parse(body);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify magic token and cancel plan
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .update({ canceled: true })
      .eq('id', planId)
      .eq('magic_token', token)
      .select()
      .single();

    if (planError || !plan) {
      console.error('Plan cancel failed:', planError);
      return new Response(
        JSON.stringify({ error: 'Unable to cancel plan. Invalid credentials.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Plan canceled:', planId);

    return new Response(
      JSON.stringify({ canceled: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in plans-cancel:', error);
    const errorMessage = error instanceof z.ZodError 
      ? 'Invalid request data'
      : 'An unexpected error occurred. Please try again.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
