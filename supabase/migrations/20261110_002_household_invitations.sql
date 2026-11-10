-- Apply after 20261109_001_workspaces.sql. Invitations require explicit acceptance.
begin;
create table if not exists public.household_invitations (
 id uuid primary key default gen_random_uuid(),
 household_id uuid not null references public.households(id) on delete cascade,
 invited_email text not null,
 token_hash text not null unique,
 invited_by uuid not null references auth.users(id),
 expires_at timestamptz not null default (now() + interval '7 days'),
 accepted_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists household_invitations_household_idx on public.household_invitations(household_id);
alter table public.household_invitations enable row level security;
-- Invitation records are never directly accessible from the client.
create or replace function public.rayku_create_household_invitation(p_household uuid,p_email text)
returns text language plpgsql security definer set search_path = ''
as $$
declare v_token text; v_email text := lower(trim(p_email));
begin
 if auth.uid() is null or not public.rayku_is_household_owner(p_household,auth.uid()) then raise exception 'Not authorized'; end if;
 if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Invalid email'; end if;
 v_token := gen_random_uuid()::text || '-' || gen_random_uuid()::text;
 insert into public.household_invitations(household_id,invited_email,token_hash,invited_by)
 values(p_household,v_email,encode(extensions.digest(v_token,'sha256'),'hex'),auth.uid());
 return v_token;
end;
$$;
create or replace function public.rayku_accept_household_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_inv public.household_invitations%rowtype; v_email text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select lower(email) into v_email from auth.users where id=auth.uid();
 select * into v_inv from public.household_invitations
 where token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
 and accepted_at is null and expires_at>now() for update;
 if not found then raise exception 'Invitation invalid or expired'; end if;
 if v_email is distinct from v_inv.invited_email then raise exception 'Invitation belongs to another email'; end if;
 insert into public.household_members(household_id,user_id,role)
 values(v_inv.household_id,auth.uid(),'member')
 on conflict(household_id,user_id) do nothing;
 update public.household_invitations set accepted_at=now() where id=v_inv.id;
 return v_inv.household_id;
end;
$$;
revoke all on function public.rayku_create_household_invitation(uuid,text) from public;
revoke all on function public.rayku_accept_household_invitation(text) from public;
grant execute on function public.rayku_create_household_invitation(uuid,text) to authenticated;
grant execute on function public.rayku_accept_household_invitation(text) to authenticated;
-- No owner may add another account without its explicit acceptance.
drop function if exists public.rayku_invite_household_member(uuid,uuid);
commit;
