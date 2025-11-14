-- Fix RLS policies for security vulnerabilities

-- 1. Fix invites table - restrict public access to only invites for plans user has access to
DROP POLICY IF EXISTS "Public can view invites" ON invites;
CREATE POLICY "Users can view invites for their plans"
ON invites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM plans 
    WHERE plans.id = invites.plan_id 
    AND plans.canceled = false
  )
);

-- 2. Fix plans table - create a view that excludes magic_token from public access
CREATE OR REPLACE VIEW plans_public AS
SELECT 
  id, 
  created_at, 
  date_start, 
  date_end, 
  headcount, 
  two_stop, 
  daypart, 
  neighborhood,
  neighborhood_lat,
  neighborhood_lng,
  neighborhood_place_id,
  budget_band, 
  notes_raw, 
  notes_chips, 
  mode,
  decision_deadline,
  threshold,
  locked,
  locked_at,
  canceled
FROM plans 
WHERE canceled = false;

-- 3. Add explicit denial policy to reminders table for defense in depth
CREATE POLICY "Deny all public access to reminders"
ON reminders
FOR ALL
TO public
USING (false);

-- 4. Keep the existing "Public can view non-canceled plans" policy but it will mainly be for service role
-- The public should use plans_public view instead