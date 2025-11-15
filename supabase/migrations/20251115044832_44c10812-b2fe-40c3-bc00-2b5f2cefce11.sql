-- Create ranked_votes table for small group (2-3 person) ranked voting
CREATE TABLE public.ranked_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  voter_hash text NOT NULL,
  rankings jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(plan_id, voter_hash)
);

-- Enable RLS
ALTER TABLE public.ranked_votes ENABLE ROW LEVEL SECURITY;

-- Public can view ranked votes for non-canceled plans
CREATE POLICY "Public can view ranked votes"
ON public.ranked_votes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.plans
    WHERE plans.id = ranked_votes.plan_id
    AND plans.canceled = false
  )
);

-- Service role can manage ranked votes
CREATE POLICY "Service role can manage ranked votes"
ON public.ranked_votes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create decision_history table to track turn fairness for 2-person groups
CREATE TABLE public.decision_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  winner_voter_hash text NOT NULL,
  participant_hashes jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.decision_history ENABLE ROW LEVEL SECURITY;

-- Service role can manage decision_history
CREATE POLICY "Service role can manage decision_history"
ON public.decision_history
FOR ALL
USING (true)
WITH CHECK (true);

-- Add columns to plans table for small group decision tracking
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS tie_breaker_used text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS computed_scores jsonb;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS winner_option_id uuid REFERENCES public.options(id);

-- Create index for faster lookups
CREATE INDEX idx_ranked_votes_plan ON public.ranked_votes(plan_id);
CREATE INDEX idx_decision_history_plan ON public.decision_history(plan_id);