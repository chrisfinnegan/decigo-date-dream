-- Create storage bucket for illustrations
INSERT INTO storage.buckets (id, name, public)
VALUES ('illustrations', 'illustrations', true);

-- Create RLS policies for illustrations bucket
CREATE POLICY "Public can view illustrations"
ON storage.objects FOR SELECT
USING (bucket_id = 'illustrations');

CREATE POLICY "Service role can manage illustrations"
ON storage.objects FOR ALL
USING (bucket_id = 'illustrations')
WITH CHECK (bucket_id = 'illustrations');

-- Create table to track generated illustrations
CREATE TABLE public.illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.illustrations ENABLE ROW LEVEL SECURITY;

-- Create policies for illustrations table
CREATE POLICY "Public can view illustrations"
ON public.illustrations FOR SELECT
USING (true);

CREATE POLICY "Service role can manage illustrations"
ON public.illustrations FOR ALL
USING (true)
WITH CHECK (true);