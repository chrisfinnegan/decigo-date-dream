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
    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    const messageStatus = body.MessageStatus as string;
    const from = body.From as string;
    const bodyText = (body.Body as string || '').trim().toUpperCase();

    console.log('Twilio webhook:', { messageStatus, from, bodyText });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle STOP/HELP commands
    if (bodyText === 'STOP' || bodyText === 'UNSUBSCRIBE') {
      await supabaseClient
        .from('invites')
        .update({ stopped: true })
        .eq('channel', 'sms')
        .eq('value', from);

      console.log('User opted out:', from);

      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    if (bodyText === 'HELP') {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Reply STOP to unsubscribe</Message></Response>',
        { headers: { 'Content-Type': 'text/xml' } }
      );
    }

    // Handle delivery receipts
    if (messageStatus) {
      console.log('Delivery status update:', messageStatus, from);
      // Could log delivery status to a separate table if needed
    }

    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error in webhooks-twilio:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
