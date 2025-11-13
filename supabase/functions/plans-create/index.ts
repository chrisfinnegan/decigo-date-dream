import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock data generator - in production, replace with AI/API calls
function generateMockOptions(daypart: string, neighborhood: string, budget: string, count: number) {
  const venues = {
    drinks: ['Bar', 'Lounge', 'Wine Bar', 'Cocktail Bar', 'Pub', 'Rooftop Bar'],
    brunch: ['Cafe', 'Bistro', 'Brunch Spot', 'Restaurant'],
    lunch: ['Cafe', 'Bistro', 'Deli', 'Restaurant'],
    dinner: ['Restaurant', 'Bistro', 'Eatery', 'Trattoria'],
  };
  
  const tips = [
    'Ask for the daily special',
    'Try the signature dish',
    'Request a table by the window',
    'Happy hour runs 4-7pm',
    'Make a reservation for weekends',
    'The outdoor seating is great',
  ];

  const baseCoords = { lat: 40.7359, lng: -74.0014 }; // West Village center
  
  return Array.from({ length: count }, (_, i) => ({
    name: `${neighborhood} ${venues[daypart as keyof typeof venues]?.[i % 6] || 'Spot'} ${i + 1}`,
    address: `${100 + i * 10} ${neighborhood} St, New York, NY 10014`,
    lat: baseCoords.lat + (Math.random() - 0.5) * 0.01,
    lng: baseCoords.lng + (Math.random() - 0.5) * 0.01,
    why_it_fits: `Perfect for ${daypart} in ${neighborhood}. Matches your ${budget} budget and group size.`,
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
    const {
      daypart,
      date_start,
      date_end,
      neighborhood,
      headcount,
      budget_band,
      two_stop = false,
      notes_raw,
      notes_chips = [],
    } = body;

    // Generate a unique magic token
    const magic_token = crypto.randomUUID();

    // Calculate decision deadline (default: 24 hours from now)
    const decision_deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    // Calculate threshold (min of 4 or group size)
    const threshold = Math.min(4, headcount);

    // Create the plan
    const { data: plan, error } = await supabaseClient
      .from('plans')
      .insert({
        daypart,
        date_start,
        date_end,
        neighborhood,
        headcount,
        budget_band,
        two_stop,
        notes_raw,
        notes_chips,
        mode: 'top3',
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

    // Generate mock options for the plan
    // In production, this would call an AI service or venue API
    const mockOptions = generateMockOptions(daypart, neighborhood, budget_band, two_stop ? 6 : 20);
    
    const optionsToInsert = mockOptions.map((opt, index) => ({
      plan_id: plan.id,
      name: opt.name,
      address: opt.address,
      lat: opt.lat,
      lng: opt.lng,
      rank: index + 1,
      price_band: budget_band,
      why_it_fits: opt.why_it_fits,
      tip: opt.tip,
    }));

    const { error: optionsError } = await supabaseClient
      .from('options')
      .insert(optionsToInsert);

    if (optionsError) {
      console.error('Error creating options:', optionsError);
    } else {
      console.log(`Created ${optionsToInsert.length} options for plan ${plan.id}`);
    }

    return new Response(
      JSON.stringify({ planId: plan.id, magicToken: magic_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in plans-create:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
