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
    // Support both POST (from supabase.functions.invoke) and GET
    let q: string | null = null;
    let sessionToken: string | null = null;
    let lat: string | null = null;
    let lng: string | null = null;

    if (req.method === 'POST') {
      const body = await req.json();
      q = body.q;
      sessionToken = body.sessionToken || crypto.randomUUID();
      lat = body.lat;
      lng = body.lng;
    } else {
      const url = new URL(req.url);
      q = url.searchParams.get('q');
      sessionToken = url.searchParams.get('sessionToken') || crypto.randomUUID();
      lat = url.searchParams.get('lat');
      lng = url.searchParams.get('lng');
    }

    console.log('Places autocomplete request:', { q, sessionToken, lat, lng });

    if (!q || q.length < 2) {
      console.log('Query too short, returning empty');
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

    console.log('API Key present:', apiKey.substring(0, 10) + '...');

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
      throw new Error(`Google Places API error: ${response.status}`);
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
              'X-Goog-FieldMask': 'id,location',
            },
          }
        );

        if (detailsResponse.ok) {
          const details = await detailsResponse.json();
          detailLat = details.location?.latitude;
          detailLng = details.location?.longitude;
          console.log(`Got coordinates: ${detailLat}, ${detailLng}`);
        } else {
          console.error('Details fetch failed:', detailsResponse.status);
        }
      } catch (err) {
        console.error('Error fetching place details:', err);
      }

      predictions.push({
        id: placeId,
        name,
        types,
        lat: detailLat,
        lng: detailLng,
      });
    }

    console.log('Returning predictions:', predictions.length);

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
