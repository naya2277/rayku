-- Applied in Supabase on 2026-11-11. Restrict direct Data API privileges.
-- RLS stays enabled; shared writes are through version-checking RPC.
revoke all on table public.household_invitations from anon, authenticated;
revoke all on table public.household_members from anon;
revoke all on table public.households from anon;
revoke all on table public.workspace_records from anon, authenticated;
revoke all on table public.rayku_food_profiles from anon, authenticated;
revoke all on table public.household_members from authenticated;
revoke all on table public.households from authenticated;
grant select, delete on table public.household_members to authenticated;
grant select, update on table public.households to authenticated;
grant select on table public.workspace_records to authenticated;
grant select, insert, update on table public.rayku_food_profiles to authenticated;
