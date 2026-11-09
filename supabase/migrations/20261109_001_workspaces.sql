-- Rayku 2.0: additive schema. Do not drop or modify public.rayku_data.
-- REVIEW BEFORE EXECUTING in Supabase SQL Editor.
begin;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.workspace_records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  kind text not null check (kind in ('recipes','inventory','planning','shopping_list')),
  payload jsonb not null default '{}'::jsonb,
  version bigint not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id),
  constraint workspace_one_owner check (
    (owner_user_id is not null) <> (household_id is not null)
  ),
  constraint workspace_personal_unique unique (owner_user_id, kind),
  constraint workspace_household_unique unique (household_id, kind)
);

create index if not exists household_members_user_idx on public.household_members(user_id);
create index if not exists workspace_records_household_idx on public.workspace_records(household_id);

-- SECURITY DEFINER helpers avoid recursive membership RLS checks.
create or replace function public.rayku_is_household_member(p_household uuid, p_user uuid)
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = p_household and m.user_id = p_user
  );
$$;

create or replace function public.rayku_is_household_owner(p_household uuid, p_user uuid)
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.households h
    where h.id = p_household and h.created_by = p_user
  );
$$;

revoke all on function public.rayku_is_household_member(uuid,uuid) from public;
revoke all on function public.rayku_is_household_owner(uuid,uuid) from public;
grant execute on function public.rayku_is_household_member(uuid,uuid) to authenticated;
grant execute on function public.rayku_is_household_owner(uuid,uuid) to authenticated;

create or replace function public.rayku_add_household_owner()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.household_members(household_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

drop trigger if exists rayku_household_owner_created on public.households;
create trigger rayku_household_owner_created
after insert on public.households
for each row execute function public.rayku_add_household_owner();

-- The owner explicitly adds an existing authenticated user by UUID.
create or replace function public.rayku_invite_household_member(
  p_household uuid, p_user uuid
) returns void language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.rayku_is_household_owner(p_household, auth.uid()) then
    raise exception 'Not authorized';
  end if;
  if p_user = auth.uid() then
    raise exception 'Owner is already a member';
  end if;
  insert into public.household_members(household_id, user_id, role)
  values (p_household, p_user, 'member')
  on conflict (household_id, user_id) do nothing;
end;
$$;

revoke all on function public.rayku_invite_household_member(uuid,uuid) from public;
grant execute on function public.rayku_invite_household_member(uuid,uuid) to authenticated;

-- Record metadata is assigned server-side, not trusted from clients.
create or replace function public.rayku_stamp_workspace_record()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    if new.owner_user_id is distinct from old.owner_user_id
       or new.household_id is distinct from old.household_id
       or new.kind is distinct from old.kind then
      raise exception 'Cannot move or change the kind of a record';
    end if;
    new.version := old.version + 1;
  else
    new.version := 1;
  end if;
  return new;
end;
$$;

drop trigger if exists rayku_workspace_stamp on public.workspace_records;
create trigger rayku_workspace_stamp
before insert or update on public.workspace_records
for each row execute function public.rayku_stamp_workspace_record();

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.workspace_records enable row level security;

create policy "households_read_members" on public.households for select to authenticated
using (public.rayku_is_household_member(id, auth.uid()));
create policy "households_create_self" on public.households for insert to authenticated
with check (created_by = auth.uid());
create policy "households_update_owner" on public.households for update to authenticated
using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "members_read_household" on public.household_members for select to authenticated
using (public.rayku_is_household_member(household_id, auth.uid()));
create policy "members_leave" on public.household_members for delete to authenticated
using (user_id = auth.uid() and role = 'member');

create policy "workspace_read" on public.workspace_records for select to authenticated
using (
  owner_user_id = auth.uid() or
  (household_id is not null and public.rayku_is_household_member(household_id, auth.uid()))
);
create policy "workspace_insert" on public.workspace_records for insert to authenticated
with check (
  owner_user_id = auth.uid() or
  (household_id is not null and public.rayku_is_household_member(household_id, auth.uid()))
);
create policy "workspace_update" on public.workspace_records for update to authenticated
using (
  owner_user_id = auth.uid() or
  (household_id is not null and public.rayku_is_household_member(household_id, auth.uid()))
)
with check (
  owner_user_id = auth.uid() or
  (household_id is not null and public.rayku_is_household_member(household_id, auth.uid()))
);
-- No DELETE policy for records: accidental removal is disallowed in v1.

commit;
