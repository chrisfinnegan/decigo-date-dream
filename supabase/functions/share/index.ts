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
    const planId = url.searchParams.get('id');
    const alt = url.searchParams.get('alt') === 'true';

    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    let baseUrl = Deno.env.get('BASE_URL') ?? '';
    
    // Ensure HTTPS for production URLs
    if (baseUrl && !baseUrl.startsWith('http://localhost') && baseUrl.startsWith('http://')) {
      baseUrl = baseUrl.replace('http://', 'https://');
    }

    // Get plan
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('canceled', false)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get options (top 3)
    const { data: options } = await supabaseClient
      .from('options')
      .select('name, rank')
      .eq('plan_id', planId)
      .order('rank', { ascending: true })
      .limit(3);

    // Get vote counts
    const { data: votes } = await supabaseClient
      .from('votes')
      .select('option_id')
      .eq('plan_id', planId);

    const voteCount = votes?.length || 0;
    const threshold = plan.threshold || Math.min(4, plan.headcount);

    // Determine state and content
    let title = '';
    let description = '';
    let state = 'created';

    const now = new Date();
    const dateStart = new Date(plan.date_start);
    const decisionDeadline = new Date(plan.decision_deadline);
    const isTonight = dateStart.toDateString() === now.toDateString();
    const daysUntil = Math.ceil((dateStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (plan.locked) {
      state = 'locked';
      const lockedOption = options?.[0];
      const startTime = dateStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      title = lockedOption ? `${lockedOption.name} — ${startTime}` : `Locked for ${plan.daypart}`;
      description = `${plan.neighborhood}. Add to Calendar.`;
    } else if (voteCount >= threshold - 1 && voteCount < threshold) {
      state = 'nearlock';
      title = alt ? 'Almost there!' : `${voteCount}/${threshold} voted — one more to lock`;
      description = alt 
        ? 'One more vote locks your plans tonight.'
        : 'Tap to cast your vote. We\'ll lock it instantly.';
    } else {
      // Created state
      if (isTonight) {
        title = alt ? 'Meet here tonight?' : 'Vote on tonight\'s plan';
        description = alt
          ? 'Tap to vote on three nearby picks. We\'ll lock it once enough friends say yes.'
          : `Three AI-picked options near ${plan.neighborhood}. Locking at ${threshold} votes.`;
      } else if (daysUntil <= 7) {
        const weekday = dateStart.toLocaleDateString('en-US', { weekday: 'long' });
        const timeWindow = `${dateStart.toLocaleTimeString('en-US', { hour: 'numeric' })}–${new Date(plan.date_end).toLocaleTimeString('en-US', { hour: 'numeric' })}`;
        const deadlineDay = decisionDeadline.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric' });
        title = `Vote for ${weekday} night`;
        description = `Three options for ${weekday}, ${timeWindow}. Locking at ${threshold} votes or ${deadlineDay}—whichever comes first.`;
      } else {
        title = `Vote on ${plan.daypart} plans`;
        description = `Three AI-picked options near ${plan.neighborhood}. Locking at ${threshold} votes.`;
      }
    }

    // Track sharecard impression (server-side)
    const userAgent = req.headers.get('user-agent') || '';
    const redirectUrl = `${baseUrl}/p/${planId}?src=sc`;
    
    console.log('Share redirect:', {
      planId,
      state,
      baseUrl,
      redirectUrl,
      userAgent: userAgent.substring(0, 100),
    });

    // Always redirect - no HTML rendering
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in share:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
