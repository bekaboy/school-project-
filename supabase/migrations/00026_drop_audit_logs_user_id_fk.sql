-- Drop FK constraint on audit_logs.user_id because seed user UUIDs
-- don't match auth.users UUIDs (created via GoTrue / Supabase dashboard).
-- The user_id column still stores the auth user's UUID as a reference,
-- but the join to public.users may return null for seed users.
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
