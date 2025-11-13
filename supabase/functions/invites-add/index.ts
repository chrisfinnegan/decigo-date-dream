import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Contact {
  name?: string;
  channel: 'sms' | 'email';
  value: string;
  consentAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, token, contacts } = await req.json() as { 
      planId: string; 
      token: string; 
      contacts: Contact[] 
    };

    if (!planId || !token || !contacts || !Array.isArray(contacts)) {
      return new Response(
        JSON.stringify({ error: 'planId, token, and contacts array are required' }),
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

    // Upsert invites
    const inviteRecords = contacts.map(contact => ({
      plan_id: planId,
      name: contact.name || null,
      channel: contact.channel,
      value: contact.value,
      consent_at: contact.consentAt,
      sent_count: 0,
      stopped: false
    }));

    const { data: invites, error: invitesError } = await supabaseClient
      .from('invites')
      .upsert(inviteRecords, { 
        onConflict: 'plan_id,channel,value',
        ignoreDuplicates: false 
      })
      .select();

    if (invitesError) {
      console.error('Error upserting invites:', invitesError);
      return new Response(
        JSON.stringify({ error: invitesError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Invites added:', invites?.length || 0);

    return new Response(
      JSON.stringify({ 
        added: invites?.length || 0,
        invites: invites
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in invites-add:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
