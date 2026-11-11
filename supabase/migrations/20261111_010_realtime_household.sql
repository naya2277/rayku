-- Applied 2026-11-11: enable secure Postgres Changes for two-person shared home.
-- Requires RLS on both tables; existing policies restrict access to household members.
do $$
begin
  if not exists (select 1 from pg_publication_tables
     where pubname='supabase_realtime' and schemaname='public' and tablename='workspace_records') then
    alter publication supabase_realtime add table public.workspace_records;
  end if;
  if not exists (select 1 from pg_publication_tables
     where pubname='supabase_realtime' and schemaname='public' and tablename='rayku_food_profiles') then
    alter publication supabase_realtime add table public.rayku_food_profiles;
  end if;
end $$;
