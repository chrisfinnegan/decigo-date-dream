import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify Resend webhook signature (Svix format)
async function verifyResendSignature(
  secret: string,
  msgId: string,
  msgTimestamp: string,
  signature: string,
  payload: string
): Promise<boolean> {
  // Check timestamp (must be within 5 minutes)
  const timestamp = parseInt(msgTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    console.error('Webhook timestamp too old');
    return false;
  }

  // Create signed content
  const signedContent = `${msgId}.${msgTimestamp}.${payload}`;
  
  // Extract signatures from header (format: "v1,signature1 v1,signature2")
  const signatures = signature.split(' ').map(s => s.split(',')[1]);
  
  // Get secret (remove whsec_ prefix if present)
  const secretBytes = secret.startsWith('whsec_') 
    ? atob(secret.substring(6))
    : secret;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretBytes);
  const msgData = encoder.encode(signedContent);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const hmac = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(hmac)));
  
  // Check if any signature matches
  return signatures.some(sig => sig === expectedSignature);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Resend webhook signature (using svix format)
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');
    const resendSigningSecret = Deno.env.get('RESEND_SIGNING_SECRET');

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing webhook signature headers');
      return new Response(
        JSON.stringify({ error: 'Missing signature headers' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.json();
    const payloadString = JSON.stringify(payload);

    // Verify signature if signing secret is configured
    if (resendSigningSecret) {
      const isValid = await verifyResendSignature(
        resendSigningSecret,
        svixId,
        svixTimestamp,
        svixSignature,
        payloadString
      );

      if (!isValid) {
        console.error('Invalid Resend webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Resend webhook signature verified');
    } else {
      console.warn('RESEND_SIGNING_SECRET not configured - webhook verification disabled');
    }

    console.log('Email webhook received:', payload);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle Resend webhook events
    const eventType = payload.type;
    const email = payload.data?.email || payload.data?.to;

    if (eventType === 'email.bounced' || eventType === 'email.complained') {
      // Mark email as stopped
      if (email) {
        await supabaseClient
          .from('invites')
          .update({ stopped: true })
          .eq('channel', 'email')
          .eq('value', email);

        console.log('Email marked as stopped:', email, 'Reason:', eventType);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in webhooks-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
