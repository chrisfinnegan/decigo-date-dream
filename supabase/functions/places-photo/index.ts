import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const photoRef = url.searchParams.get('photoRef');
    const maxwidth = url.searchParams.get('maxwidth') || '640';

    if (!photoRef) {
      return new Response(
        JSON.stringify({ error: 'photoRef is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct Place Photo URL
    const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=${maxwidth}&key=${apiKey}`;

    console.log('Fetching photo:', photoRef);

    // Fetch the photo (handles redirect automatically)
    const photoResponse = await fetch(photoUrl);

    if (!photoResponse.ok) {
      console.error('Photo fetch error:', photoResponse.status);
      throw new Error(`Photo fetch failed: ${photoResponse.status}`);
    }

    const imageBuffer = await photoResponse.arrayBuffer();
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';

    // Return with cache headers
    return new Response(imageBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24 hours
      },
    });
  } catch (error) {
    console.error('Error in places-photo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
