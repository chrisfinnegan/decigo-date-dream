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
      .select('id, magic_token, canceled')
      .eq('id', planId)
      .eq('magic_token', token)
      .single();

    if (planError || !plan || plan.canceled) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan or token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current options
    const { data: existingOptions } = await supabaseClient
      .from('options')
      .select('id, source_id')
      .eq('plan_id', planId);

    if (existingOptions && existingOptions.length > 3) {
      return new Response(
        JSON.stringify({ error: 'Reroll already used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const usedPlaceIds = existingOptions?.map(o => o.source_id).filter(Boolean) || [];

    // Get cached candidates
    const candidateCacheKey = `plan:${planId}:candidates`;
    const { data: cacheData } = await supabaseClient
      .from('places_cache')
      .select('data')
      .eq('cache_key', candidateCacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!cacheData?.data) {
      return new Response(
        JSON.stringify({ error: 'Candidate cache expired. Please create a new plan.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const candidates = cacheData.data as any[];
    console.log(`Reroll: ${candidates.length} candidates available, ${usedPlaceIds.length} already used`);

    // Filter out used options and pick next 3
    const availableCandidates = candidates.filter(c => !usedPlaceIds.includes(c.place_id));
    
    if (availableCandidates.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Not enough new options available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newOptions = availableCandidates.slice(0, 3);

    // Get plan details for budget
    const { data: planData } = await supabaseClient
      .from('plans')
      .select('budget_band')
      .eq('id', planId)
      .single();

    // Enrich with Place Details if available
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    const optionsToInsert = [];
    
    for (let i = 0; i < newOptions.length; i++) {
      const candidate = newOptions[i];
      let optionData = { ...candidate };

      if (apiKey && candidate.place_id) {
        const detailsCacheKey = `details:${candidate.place_id}`;
        const { data: detailsCache } = await supabaseClient
          .from('places_cache')
          .select('data')
          .eq('cache_key', detailsCacheKey)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (detailsCache?.data) {
          console.log('Cache HIT: place details for reroll');
          optionData = { ...optionData, ...detailsCache.data };
        }
      }

      optionsToInsert.push({
        plan_id: planId,
        name: optionData.name,
        address: optionData.address,
        lat: optionData.lat,
        lng: optionData.lng,
        rank: (existingOptions?.length || 0) + i + 1,
        price_band: planData?.budget_band || '$$',
        why_it_fits: optionData.why_it_fits || null,
        tip: optionData.tip || null,
        source_id: optionData.place_id || null,
        photo_ref: optionData.photo_ref || null,
      });
    }

    const { error: insertError } = await supabaseClient
      .from('options')
      .insert(optionsToInsert);

    if (insertError) {
      console.error('Error inserting reroll options:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Reroll complete: added ${optionsToInsert.length} new options`);

    return new Response(
      JSON.stringify({ 
        success: true,
        newOptionsCount: optionsToInsert.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in plans-reroll:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
