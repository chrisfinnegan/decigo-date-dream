-- Remove public SELECT access to invites table to prevent PII exposure
-- Only service role should be able to read contact information (phone numbers, emails)
DROP POLICY IF EXISTS "Users can view invites for their plans" ON public.invites;

-- Keep service role access
-- The existing "Service role can manage invites" policy remains active