-- Add feature flag for Google Places
INSERT INTO flags (key, value) VALUES ('use_google_places', 'true'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = 'true'::jsonb;

-- Add cache table for Google Places results
CREATE TABLE IF NOT EXISTS places_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  cache_type text NOT NULL, -- 'candidates' or 'details'
  data jsonb NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_places_cache_key ON places_cache(cache_key);
CREATE INDEX idx_places_cache_expires ON places_cache(expires_at);

-- Enable RLS
ALTER TABLE places_cache ENABLE ROW LEVEL SECURITY;

-- Service role can manage cache
CREATE POLICY "Service role can manage places_cache" ON places_cache
FOR ALL USING (true) WITH CHECK (true);

-- Add neighborhood metadata to plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS neighborhood_place_id text;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS neighborhood_lat double precision;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS neighborhood_lng double precision;

-- Add photo_ref to options
ALTER TABLE options ADD COLUMN IF NOT EXISTS photo_ref text;