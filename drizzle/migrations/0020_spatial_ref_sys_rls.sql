-- Supabase Security Advisor: public.spatial_ref_sys has RLS disabled.
--
-- This table is created by the PostGIS extension. It contains public spatial
-- reference metadata, but because it lives in the exposed public schema,
-- Supabase still reports it as API-accessible unless RLS is enabled.

ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
