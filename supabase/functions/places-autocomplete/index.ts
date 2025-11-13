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
    const q = url.searchParams.get('q');
    const sessionToken = url.searchParams.get('sessionToken') || crypto.randomUUID();
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');

    if (!q || q.length < 2) {
      return new Response(
        JSON.stringify({ sessionToken, predictions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Build request body for Places Autocomplete (New)
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

    console.log('Calling Google Places Autocomplete:', { input: q, sessionToken });

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', response.status, errorText);
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform to simplified format
    const predictions = (data.suggestions || []).map((suggestion: any) => ({
      id: suggestion.placePrediction?.placeId || crypto.randomUUID(),
      name: suggestion.placePrediction?.text?.text || '',
      types: suggestion.placePrediction?.types || [],
    }));

    console.log('Autocomplete results:', predictions.length);

    return new Response(
      JSON.stringify({ sessionToken, predictions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in places-autocomplete:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
