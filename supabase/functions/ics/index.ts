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
    const url = new URL(req.url);
    const planId = url.searchParams.get('planId');

    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'planId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
    );

    // Get locked plan
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('locked', true)
      .eq('canceled', false)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Locked plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the winning option (first option for now - should be determined by lock-attempt)
    const { data: options, error: optionsError } = await supabaseClient
      .from('options')
      .select('*')
      .eq('plan_id', planId)
      .order('rank', { ascending: true })
      .limit(1);

    if (optionsError || !options || options.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No options found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const option = options[0];

    // Format dates for ICS
    const formatICSDate = (date: string) => {
      return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = formatICSDate(plan.date_start);
    const endDate = formatICSDate(plan.date_end);
    const now = formatICSDate(new Date().toISOString());

    // Generate ICS content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Decigo//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${planId}@decigo.app
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${option.name}
LOCATION:${option.address}
DESCRIPTION:${option.why_it_fits || 'Your locked plan from Decigo'}
ORGANIZER;CN=Decigo:mailto:noreply@decigo.app
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    console.log('ICS generated for plan:', planId);

    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="decigo-plan.ics"',
      },
    });
  } catch (error) {
    console.error('Error in ics:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
