import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate Twilio signature using HMAC-SHA1
async function validateTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, any>
): Promise<boolean> {
  // Sort parameters alphabetically and concatenate
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  // Create HMAC-SHA1 hash
  const encoder = new TextEncoder();
  const keyData = encoder.encode(authToken);
  const msgData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const hmac = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(hmac)));
  
  return expectedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    // Verify Twilio signature
    const twilioSignature = req.headers.get('X-Twilio-Signature');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    if (!twilioSignature || !authToken) {
      console.error('Missing Twilio signature or auth token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate webhook signature
    const url = new URL(req.url);
    const params = Object.fromEntries(formData);
    const isValid = await validateTwilioSignature(
      authToken,
      twilioSignature,
      url.toString(),
      params
    );

    if (!isValid) {
      console.error('Invalid Twilio signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messageStatus = body.MessageStatus as string;
    const from = body.From as string;
    const bodyText = (body.Body as string || '').trim().toUpperCase();

    console.log('Twilio webhook verified:', { messageStatus, from, bodyText });

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
