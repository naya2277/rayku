-- Rayku: individual food preferences, visible only to fellow household members.
-- Run once in Supabase SQL Editor. Existing data is not removed.
begin;
create table if not exists public.rayku_food_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  allergies text[] not null default '{}',
  intolerances text[] not null default '{}',
  dislikes text[] not null default '{}',
  favorites text[] not null default '{}',
  diets text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.rayku_food_profiles enable row level security;
drop policy if exists rayku_food_profiles_read on public.rayku_food_profiles;
create policy rayku_food_profiles_read on public.rayku_food_profiles
for select to authenticated using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.household_members mine
    join public.household_members theirs on mine.household_id = theirs.household_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = rayku_food_profiles.user_id
  )
);
drop policy if exists rayku_food_profiles_insert on public.rayku_food_profiles;
create policy rayku_food_profiles_insert on public.rayku_food_profiles
for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists rayku_food_profiles_update on public.rayku_food_profiles;
create policy rayku_food_profiles_update on public.rayku_food_profiles
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create index if not exists rayku_food_profiles_updated_idx on public.rayku_food_profiles(updated_at);
commit;
