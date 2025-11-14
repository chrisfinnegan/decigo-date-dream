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
    const isCrawler = /bot|crawler|spider|whatsapp|facebook|twitter|slack|discord|telegram|facebookexternalhit|twitterbot|linkedinbot|slackbot|skypeuripreview|line/i.test(userAgent);
    
    // Use static PNG for OG image - must be absolute HTTPS URL
    const ogImageUrl = `${baseUrl}/og-default.png`;
    const shareUrl = `${supabaseUrl}/functions/v1/share?id=${planId}`;
    const redirectUrl = `${baseUrl}/p/${planId}?src=sc`;
    
    console.log('Share request:', {
      planId,
      state,
      isCrawler,
      redirectUrl,
      ogImageUrl,
      userAgent: userAgent.substring(0, 100),
    });

    // For crawlers, return HTML with Open Graph meta tags
    if (isCrawler) {
      const html = `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Essential Open Graph tags -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:site_name" content="Decigo">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:secure_url" content="${ogImageUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${title}">
  
  <!-- Twitter Card tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@decigo">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImageUrl}">
  <meta name="twitter:image:alt" content="${title}">
  
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #FFF8F2;
      color: #0C4A5A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .container {
      max-width: 400px;
    }
    h1 {
      color: #0C4A5A;
      margin-bottom: 16px;
    }
    p {
      color: #334155;
      margin-bottom: 24px;
    }
    a {
      display: inline-block;
      background: #0C4A5A;
      color: white;
      padding: 12px 24px;
      border-radius: 16px;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover {
      background: #119DA4;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="${redirectUrl}">Vote now</a>
  </div>
</body>
</html>`;

      return new Response(html, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }
    
    // For regular users, redirect immediately

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
