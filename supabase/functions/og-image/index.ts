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
    const baseUrl = Deno.env.get('BASE_URL') ?? '';
    
    // Fetch the og-default.png from the base URL
    const imageUrl = `${baseUrl}/og-default.png`;
    console.log('Fetching OG image from:', imageUrl);
    
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status);
      return new Response('Image not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }
    
    const imageData = await imageResponse.arrayBuffer();
    
    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving OG image:', error);
    return new Response('Error loading image', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
