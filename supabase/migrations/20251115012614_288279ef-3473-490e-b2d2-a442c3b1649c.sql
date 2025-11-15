-- Add performance indexes for M1 experiment
-- These indexes support efficient queries during high-traffic plan lifecycle

-- Index for plan queries by creation time and status
CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans (created_at);
CREATE INDEX IF NOT EXISTS idx_plans_locked_canceled ON plans (locked, canceled);

-- Index for options lookup by plan
CREATE INDEX IF NOT EXISTS idx_options_plan_id ON options (plan_id);

-- Index for vote aggregation queries
CREATE INDEX IF NOT EXISTS idx_votes_plan_option ON votes (plan_id, option_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_hash ON votes (voter_hash);