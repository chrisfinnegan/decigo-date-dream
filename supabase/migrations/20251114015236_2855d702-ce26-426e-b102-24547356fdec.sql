-- Fix security definer view issue
DROP VIEW IF EXISTS plans_public;

CREATE VIEW plans_public 
WITH (security_invoker=true) AS
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