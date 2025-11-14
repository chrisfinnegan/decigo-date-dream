import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 photo requests per minute per IP

const PhotoSchema = z.object({
  photoRef: z.string().min(1).max(500),
  maxwidth: z.string().regex(/^\d+$/).optional(),
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

    const url = new URL(req.url);
    const validated = PhotoSchema.parse({
      photoRef: url.searchParams.get('photoRef'),
      maxwidth: url.searchParams.get('maxwidth') || '640',
    });

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct Place Photo URL
    const photoUrl = `https://places.googleapis.com/v1/${validated.photoRef}/media?maxWidthPx=${validated.maxwidth}&key=${apiKey}`;

    console.log('Fetching photo:', validated.photoRef);

    // Fetch the photo (handles redirect automatically)
    const photoResponse = await fetch(photoUrl);

    if (!photoResponse.ok) {
      console.error('Photo fetch error:', photoResponse.status);
      return new Response(
        JSON.stringify({ error: 'Unable to load photo' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBuffer = await photoResponse.arrayBuffer();
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';

    // Return with cache headers and rate limit info
    return new Response(imageBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24 hours
        'X-RateLimit-Remaining': String(rateCheck.remaining),
      },
    });
  } catch (error) {
    console.error('Error in places-photo:', error);
    const errorMessage = error instanceof z.ZodError 
      ? 'Invalid photo request'
      : 'An unexpected error occurred. Please try again.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
