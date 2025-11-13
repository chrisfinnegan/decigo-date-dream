import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SMS_RECIPIENTS_CAP = 8;
const MESSAGES_PER_PERSON_CAP = 3;
const QUIET_HOURS_START = 22;
const QUIET_HOURS_END = 8;

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

    if (planError || !plan || plan.canceled) {
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
      .eq('stopped', false);

    if (invitesError) {
      console.error('Error fetching invites:', invitesError);
      return new Response(
        JSON.stringify({ error: invitesError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!invites || invites.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No invites to send' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check SMS recipients cap
    const smsInvites = invites.filter(i => i.channel === 'sms');
    if (smsInvites.length > SMS_RECIPIENTS_CAP) {
      return new Response(
        JSON.stringify({ error: `SMS recipients exceed cap of ${SMS_RECIPIENTS_CAP}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check quiet hours (simplified - assumes UTC)
    const currentHour = new Date().getUTCHours();
    const isQuietHours = currentHour >= QUIET_HOURS_START || currentHour < QUIET_HOURS_END;

    if (isQuietHours) {
      return new Response(
        JSON.stringify({ 
          queued: invites.length, 
          message: 'Quiet hours - messages queued for later' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    const baseUrl = Deno.env.get('BASE_URL') || 'https://your-app.lovable.app';

    for (const invite of invites) {
      // Check per-person message cap
      if (invite.sent_count >= MESSAGES_PER_PERSON_CAP) {
        results.push({
          inviteId: invite.id,
          status: 'skipped',
          reason: 'Message cap reached'
        });
        continue;
      }

      // Skip if already sent initial invite
      if (invite.sent_count > 0) {
        results.push({
          inviteId: invite.id,
          status: 'skipped',
          reason: 'Already sent'
        });
        continue;
      }

      const shareUrl = `${baseUrl}/p/${planId}`;
      
      if (invite.channel === 'sms') {
        // Send SMS via Twilio
        try {
          const twilioResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': 'Basic ' + btoa(`${Deno.env.get('TWILIO_ACCOUNT_SID')}:${Deno.env.get('TWILIO_AUTH_TOKEN')}`),
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                To: invite.value,
                From: Deno.env.get('TWILIO_MESSAGING_SID') || '',
                Body: `You're invited to vote on plans! ${shareUrl}`,
              }),
            }
          );

          if (twilioResponse.ok) {
            await supabaseClient
              .from('invites')
              .update({ sent_count: invite.sent_count + 1 })
              .eq('id', invite.id);

            results.push({
              inviteId: invite.id,
              status: 'sent',
              channel: 'sms'
            });
          } else {
            const error = await twilioResponse.text();
            results.push({
              inviteId: invite.id,
              status: 'failed',
              error: error
            });
          }
        } catch (error) {
          results.push({
            inviteId: invite.id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      } else if (invite.channel === 'email') {
        // Send email via Resend
        try {
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Decigo <invites@resend.dev>',
              to: [invite.value],
              subject: 'Vote on our plans!',
              html: `<p>You're invited to vote on plans!</p><p><a href="${shareUrl}">Vote now</a></p>`,
            }),
          });

          if (resendResponse.ok) {
            await supabaseClient
              .from('invites')
              .update({ sent_count: invite.sent_count + 1 })
              .eq('id', invite.id);

            results.push({
              inviteId: invite.id,
              status: 'sent',
              channel: 'email'
            });
          } else {
            const error = await resendResponse.text();
            results.push({
              inviteId: invite.id,
              status: 'failed',
              error: error
            });
          }
        } catch (error) {
          results.push({
            inviteId: invite.id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    console.log('Invites sent:', sentCount, 'Total results:', results.length);

    return new Response(
      JSON.stringify({ 
        sent: sentCount,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in invites-send:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
