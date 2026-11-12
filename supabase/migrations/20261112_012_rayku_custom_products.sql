-- Rayku 2.0: shared custom product shortcuts, favourites and usage counters.
-- Additive, no existing recipes, inventory or shopping records are modified.
create table if not exists public.rayku_custom_products (
 id uuid primary key default gen_random_uuid(),
 household_id uuid not null references public.households(id) on delete cascade,
 name text not null check (char_length(trim(name)) between 1 and 120),
 category text not null check (char_length(trim(category)) between 1 and 55),
 subcategory text not null check (char_length(trim(subcategory)) between 1 and 55),
 emoji text not null default '🛒' check (char_length(emoji) between 1 and 25),
 default_quantity text not null default '1 unidad' check (char_length(default_quantity) between 1 and 50),
 favorite boolean not null default false,
 use_count integer not null default 0 check(use_count >= 0),
 is_custom boolean not null default true,
 updated_by uuid not null references auth.users(id),
 updated_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create index if not exists rayku_custom_products_household on public.rayku_custom_products (household_id);
create unique index if not exists rayku_custom_products_natural_key
 on public.rayku_custom_products (household_id, lower(category), lower(subcategory), lower(name));
alter table public.rayku_custom_products enable row level security;
do $$
begin
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='rayku_custom_products' and policyname='rayku_custom_products_read') then
  create policy "rayku_custom_products_read" on public.rayku_custom_products
   for select to authenticated using (exists (
    select 1 from public.household_members m where
    m.household_id = rayku_custom_products.household_id and m.user_id = (select auth.uid())));
 end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='rayku_custom_products' and policyname='rayku_custom_products_insert') then
  create policy "rayku_custom_products_insert" on public.rayku_custom_products
   for insert to authenticated with check (
    updated_by=(select auth.uid()) and exists (
    select 1 from public.household_members m where
    m.household_id=rayku_custom_products.household_id and m.user_id=(select auth.uid())));
 end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='rayku_custom_products' and policyname='rayku_custom_products_update') then
  create policy "rayku_custom_products_update" on public.rayku_custom_products
   for update to authenticated using (exists (
    select 1 from public.household_members m where
    m.household_id=rayku_custom_products.household_id and m.user_id=(select auth.uid())))
   with check (updated_by=(select auth.uid()) and exists (
    select 1 from public.household_members m where
    m.household_id=rayku_custom_products.household_id and m.user_id=(select auth.uid())));
 end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='rayku_custom_products' and policyname='rayku_custom_products_delete') then
  create policy "rayku_custom_products_delete" on public.rayku_custom_products
   for delete to authenticated using (exists (
    select 1 from public.household_members m where
    m.household_id=rayku_custom_products.household_id and m.user_id=(select auth.uid())));
 end if;
end $$;
grant select,insert,update,delete on public.rayku_custom_products to authenticated;
do $$ begin
 if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='rayku_custom_products') then
  alter publication supabase_realtime add table public.rayku_custom_products;
 end if;
end $$;
