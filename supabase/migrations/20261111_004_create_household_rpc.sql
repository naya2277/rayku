-- Create a household atomically, avoiding INSERT ... RETURNING RLS visibility timing.
-- Apply after migrations 001-003.
begin;
create or replace function public.rayku_create_household(p_name text)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_name text := trim(p_name);
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if v_name is null or length(v_name) < 1 or length(v_name) > 100 then
    raise exception 'Household name must be between 1 and 100 characters';
  end if;
  insert into public.households(name, created_by)
  values(v_name, auth.uid())
  returning id into v_id;
  -- The existing AFTER INSERT trigger creates the owner's membership.
  if not public.rayku_is_household_member(v_id, auth.uid()) then
    raise exception 'Household membership could not be established';
  end if;
  return v_id;
end;
$$;
revoke all on function public.rayku_create_household(text) from public;
grant execute on function public.rayku_create_household(text) to authenticated;
-- Creation must go through the authenticated RPC, not direct table insertion.
revoke insert on public.households from authenticated;
commit;
