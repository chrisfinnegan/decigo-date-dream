import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: Get or set cache
async function getCache(supabase: any, key: string) {
  const { data } = await supabase
    .from('places_cache')
    .select('data')
    .eq('cache_key', key)
    .gt('expires_at', new Date().toISOString())
    .single();
  return data?.data || null;
}

async function setCache(supabase: any, key: string, type: string, data: any, ttlHours: number) {
  const expires_at = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  await supabase.from('places_cache').upsert({
    cache_key: key,
    cache_type: type,
    data,
    expires_at,
  }, { onConflict: 'cache_key' });
  console.log(`Cache set: ${key} (${type}, TTL ${ttlHours}h)`);
}

// Fetch candidates from Google Places
async function fetchGooglePlacesCandidates(
  apiKey: string,
  lat: number,
  lng: number,
  daypart: string,
  budget: string,
  chips: string[]
) {
  const priceMap: Record<string, string> = { '$': '0,1', '$$': '1,2', '$$$': '2,3,4' };
  const priceLevels = priceMap[budget] || '1,2';
  
  const typeMap: Record<string, string> = {
    breakfast: 'restaurant,cafe',
    brunch: 'restaurant,cafe',
    lunch: 'restaurant,cafe',
    dinner: 'restaurant',
    drinks: 'bar,night_club'
  };
  const includedTypes = typeMap[daypart] || 'restaurant';

  const body: any = {
    includedTypes: includedTypes.split(','),
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 2000.0
      }
    },
    rankPreference: 'POPULARITY'
  };

  // Add price filter if available
  if (priceLevels) {
    body.minRating = 3.5;
  }

  const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.priceLevel,places.rating,places.currentOpeningHours,places.photos'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Places API error:', response.status, errorText);
    throw new Error(`Places API error: ${response.status}`);
  }

  const result = await response.json();
  console.log(`Google Places returned ${result.places?.length || 0} candidates`);
  
  return (result.places || []).map((place: any, idx: number) => ({
    place_id: place.id,
    name: place.displayName?.text || 'Unknown',
    address: place.formattedAddress || '',
    lat: place.location?.latitude || lat,
    lng: place.location?.longitude || lng,
    price_level: place.priceLevel || 'PRICE_LEVEL_UNSPECIFIED',
    rating: place.rating || null,
    open_now: place.currentOpeningHours?.openNow || null,
    photo_ref: place.photos?.[0]?.name || null,
    rank: idx + 1
  }));
}

// Fetch Place Details
async function fetchPlaceDetails(apiKey: string, placeId: string) {
  // Google Places API v1 requires "places/" prefix
  const placeIdWithPrefix = placeId.startsWith('places/') ? placeId : `places/${placeId}`;
  
  const response = await fetch(`https://places.googleapis.com/v1/${placeIdWithPrefix}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,priceLevel,rating,currentOpeningHours,websiteUri,internationalPhoneNumber,photos,editorialSummary'
    }
  });

  if (!response.ok) {
    console.error('Place Details error:', response.status, placeId);
    return null;
  }

  const place = await response.json();
  return {
    place_id: place.id,
    name: place.displayName?.text,
    address: place.formattedAddress,
    lat: place.location?.latitude,
    lng: place.location?.longitude,
    price_level: place.priceLevel,
    rating: place.rating,
    open_now: place.currentOpeningHours?.openNow,
    website: place.websiteUri,
    phone: place.internationalPhoneNumber,
    photo_ref: place.photos?.[0]?.name,
    why_it_fits: place.editorialSummary?.text || null
  };
}

// Mock fallback with better why_it_fits generation
function generateMockOptions(daypart: string, neighborhood: string, budget: string, count: number) {
  const venues = {
    drinks: ['Bar', 'Lounge', 'Wine Bar', 'Cocktail Bar', 'Pub', 'Rooftop Bar'],
    brunch: ['Cafe', 'Bistro', 'Brunch Spot', 'Restaurant'],
    lunch: ['Cafe', 'Bistro', 'Deli', 'Restaurant'],
    dinner: ['Restaurant', 'Bistro', 'Eatery', 'Trattoria'],
    breakfast: ['Cafe', 'Diner', 'Bakery', 'Breakfast Spot']
  };
  
  const tips = [
    'Ask for the daily special',
    'Try the signature dish',
    'Request a table by the window',
    'Happy hour runs 4-7pm',
    'Make a reservation for weekends',
    'The outdoor seating is great',
  ];

  const whyItFitsTemplates = [
    `Perfect for ${daypart} in ${neighborhood}. Popular local spot with ${budget} pricing.`,
    `Great ${daypart} venue matching your ${budget} budget in ${neighborhood}. Highly rated.`,
    `Ideal for ${daypart}. Located in ${neighborhood} with ${budget} price range.`,
    `Top choice for ${daypart} in ${neighborhood}. Matches your ${budget} budget perfectly.`,
  ];

  const baseCoords = { lat: 40.7359, lng: -74.0014 };
  
  return Array.from({ length: count }, (_, i) => ({
    name: `${neighborhood} ${venues[daypart as keyof typeof venues]?.[i % 6] || 'Spot'} ${i + 1}`,
    address: `${100 + i * 10} ${neighborhood} St, New York, NY 10014`,
    lat: baseCoords.lat + (Math.random() - 0.5) * 0.01,
    lng: baseCoords.lng + (Math.random() - 0.5) * 0.01,
    why_it_fits: whyItFitsTemplates[i % whyItFitsTemplates.length],
    tip: tips[i % tips.length],
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    
    // Validate required fields
    const {
      daypart,
      date_start,
      date_end,
      neighborhood,
      neighborhood_place_id,
      neighborhood_lat,
      neighborhood_lng,
      headcount,
      budget_band,
      two_stop = false,
      notes_raw,
      notes_chips = [],
      mode = 'top3',
    } = body;

    if (!daypart || !date_start || !neighborhood || !headcount || !budget_band) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: 'daypart, date_start, neighborhood, headcount, and budget_band are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check feature flag
    const { data: flagData } = await supabaseClient
      .from('flags')
      .select('value')
      .eq('key', 'use_google_places')
      .single();
    
    const useGooglePlaces = flagData?.value === true;

    // Generate a unique magic token
    const magic_token = crypto.randomUUID();

    // Calculate decision deadline (default: 24 hours from now)
    const decision_deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    // Calculate threshold - ensure it's at least 1 vote
    const threshold = Math.max(1, Math.min(4, headcount));

    // Create the plan
    const { data: plan, error } = await supabaseClient
      .from('plans')
      .insert({
        daypart,
        date_start,
        date_end,
        neighborhood,
        neighborhood_place_id,
        neighborhood_lat,
        neighborhood_lng,
        headcount,
        budget_band,
        two_stop,
        notes_raw,
        notes_chips,
        mode,
        decision_deadline,
        threshold,
        magic_token,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Plan created:', plan.id);

    let candidates: any[] = [];
    let source = 'mock';

    // Fetch or generate candidates
    if (useGooglePlaces && neighborhood_lat && neighborhood_lng) {
      const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
      if (!apiKey) {
        console.warn('GOOGLE_MAPS_API_KEY not set, falling back to mock');
      } else {
        const cacheKey = `candidates:${neighborhood_place_id || `${neighborhood_lat},${neighborhood_lng}`}:${daypart}:${budget_band}`;
        
        // Try cache first
        let cached = await getCache(supabaseClient, cacheKey);
        if (cached) {
          console.log('Cache HIT: candidate list');
          candidates = cached;
        } else {
          console.log('Cache MISS: fetching from Google Places');
          try {
            candidates = await fetchGooglePlacesCandidates(
              apiKey,
              neighborhood_lat,
              neighborhood_lng,
              daypart,
              budget_band,
              notes_chips
            );
            
            if (candidates.length > 0) {
              await setCache(supabaseClient, cacheKey, 'candidates', candidates, 2);
              source = 'google_places';
            }
          } catch (error) {
            console.error('Google Places fetch error:', error);
          }
        }
      }
    }

    // Fallback to mock if needed
    if (candidates.length === 0) {
      const mockOptions = generateMockOptions(daypart, neighborhood, budget_band, 20);
      candidates = mockOptions.map((opt, idx) => ({
        name: opt.name,
        address: opt.address,
        lat: opt.lat,
        lng: opt.lng,
        why_it_fits: opt.why_it_fits,
        tip: opt.tip,
        rank: idx + 1
      }));
    }

    // Store candidate list in cache for reroll
    const candidateCacheKey = `plan:${plan.id}:candidates`;
    await setCache(supabaseClient, candidateCacheKey, 'candidates', candidates, 72);

    // Select options based on mode
    const count = mode === 'top3' ? 3 : Math.min(20, candidates.length);
    const selectedCandidates = candidates.slice(0, count);

    // For top3, enrich with Place Details
    const optionsToInsert = [];
    for (let i = 0; i < selectedCandidates.length; i++) {
      const candidate = selectedCandidates[i];
      let optionData = { ...candidate };

      // Always try to fetch details if we have a place_id (for both top3 and full20)
      if (useGooglePlaces && candidate.place_id) {
        const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
        if (apiKey) {
          const detailsCacheKey = `details:${candidate.place_id}`;
          let details = await getCache(supabaseClient, detailsCacheKey);
          
          if (!details) {
            console.log(`Fetching Place Details for ${candidate.place_id}`);
            details = await fetchPlaceDetails(apiKey, candidate.place_id);
            if (details) {
              await setCache(supabaseClient, detailsCacheKey, 'details', details, 48);
            }
          } else {
            console.log('Cache HIT: place details');
          }

          if (details) {
            optionData = { ...optionData, ...details };
          }
        }
      }

      // Generate fallback why_it_fits if missing
      if (!optionData.why_it_fits) {
        optionData.why_it_fits = `Great ${daypart} spot in ${neighborhood} matching your ${budget_band} budget.`;
      }

      optionsToInsert.push({
        plan_id: plan.id,
        name: optionData.name,
        address: optionData.address,
        lat: optionData.lat,
        lng: optionData.lng,
        rank: i + 1,
        price_band: budget_band,
        why_it_fits: optionData.why_it_fits || null,
        tip: optionData.tip || null,
        source_id: optionData.place_id || null,
        photo_ref: optionData.photo_ref || null,
      });
    }

    const { error: optionsError } = await supabaseClient
      .from('options')
      .insert(optionsToInsert);

    if (optionsError) {
      console.error('Error creating options:', optionsError);
    } else {
      console.log(`Created ${optionsToInsert.length} options for plan ${plan.id} (source: ${source})`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        planId: plan.id, 
        magicToken: magic_token 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in plans-create:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Unable to create plan',
        details: errorMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
