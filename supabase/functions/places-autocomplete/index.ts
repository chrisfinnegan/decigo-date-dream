import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP

const AutocompleteSchema = z.object({
  q: z.string().min(2).max(200),
  sessionToken: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
});

function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimiter.get(clientIp);

  if (!record || now > record.resetAt) {
    rateLimiter.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check rate limit
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateCheck = checkRateLimit(clientIp);

    if (!rateCheck.allowed) {
      console.warn('Rate limit exceeded:', clientIp);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(RATE_LIMIT_WINDOW / 1000))
          } 
        }
      );
    }

    // Support both POST and GET
    let q: string | null = null;
    let sessionToken: string | null = null;
    let lat: string | null = null;
    let lng: string | null = null;

    if (req.method === 'POST') {
      const body = await req.json();
      const validated = AutocompleteSchema.parse(body);
      q = validated.q;
      sessionToken = validated.sessionToken || crypto.randomUUID();
      lat = validated.lat || null;
      lng = validated.lng || null;
    } else {
      const url = new URL(req.url);
      const validated = AutocompleteSchema.parse({
        q: url.searchParams.get('q'),
        sessionToken: url.searchParams.get('sessionToken'),
        lat: url.searchParams.get('lat'),
        lng: url.searchParams.get('lng'),
      });
      q = validated.q;
      sessionToken = validated.sessionToken || crypto.randomUUID();
      lat = validated.lat || null;
      lng = validated.lng || null;
    }

    console.log('Places autocomplete request:', { q, sessionToken, lat, lng });

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('API Key present:', apiKey.substring(0, 10) + '...');

    // Build request body for Places Autocomplete
    const requestBody: any = {
      input: q,
      sessionToken,
      includedPrimaryTypes: ['neighborhood', 'locality', 'sublocality'],
      languageCode: 'en',
    };

    // Add location bias if provided
    if (lat && lng) {
      requestBody.locationBias = {
        circle: {
          center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          radius: 50000, // 50km radius
        },
      };
    }

    console.log('Calling Google Places Autocomplete');

    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('Google API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Unable to search locations. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Google API returned suggestions:', data.suggestions?.length || 0);
    
    // For each prediction, fetch basic geometry to get lat/lng
    const predictions = [];
    const suggestions = data.suggestions || [];

    for (const suggestion of suggestions) {
      const placeId = suggestion.placePrediction?.placeId;
      const name = suggestion.placePrediction?.text?.text || '';
      const types = suggestion.placePrediction?.types || [];

      if (!placeId) continue;

      console.log(`Fetching details for ${name}`);

      // Fetch Place Details to get coordinates
      let detailLat, detailLng;
      try {
        const detailsResponse = await fetch(
          `https://places.googleapis.com/v1/places/${placeId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'location',
            },
          }
        );

        if (detailsResponse.ok) {
          const details = await detailsResponse.json();
          detailLat = details.location?.latitude;
          detailLng = details.location?.longitude;
        }
      } catch (err) {
        console.error(`Error fetching details for ${placeId}:`, err);
      }

      predictions.push({
        id: placeId,
        name: name,
        description: name,
        place_id: placeId,
        types,
        lat: detailLat,
        lng: detailLng,
      });
    }

    return new Response(
      JSON.stringify({ sessionToken, predictions }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateCheck.remaining)
        } 
      }
    );
  } catch (error) {
    console.error('Error in places-autocomplete:', error);
    const errorMessage = error instanceof z.ZodError 
      ? 'Invalid search query'
      : 'An unexpected error occurred. Please try again.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
