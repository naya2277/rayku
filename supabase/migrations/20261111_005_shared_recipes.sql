-- Allow authenticated household members to save shared recipes using
-- the existing optimistic concurrency RPC. Personal recipes are unchanged.
begin;
create or replace function public.rayku_save_workspace_record(
 p_household uuid, p_kind text, p_payload jsonb, p_expected_version bigint
) returns public.workspace_records language plpgsql security definer set search_path = ''
as $$
declare v_record public.workspace_records;
begin
 if auth.uid() is null or not public.rayku_is_household_member(p_household,auth.uid()) then
   raise exception 'Not authorized';
 end if;
 if p_kind not in ('recipes','planning','shopping_list','inventory') then
   raise exception 'Unsupported shared record kind';
 end if;
 if p_payload is null or jsonb_typeof(p_payload) not in ('array','object') then
   raise exception 'Invalid payload';
 end if;
 if p_kind in ('recipes','planning','inventory') and jsonb_typeof(p_payload) <> 'array' then
   raise exception 'Expected an array';
 end if;
 if p_kind = 'shopping_list' and jsonb_typeof(p_payload) <> 'object' then
   raise exception 'Expected an object';
 end if;
 if p_expected_version = 0 then
   insert into public.workspace_records(household_id,kind,payload,updated_by)
   values(p_household,p_kind,p_payload,auth.uid())
   on conflict (household_id,kind) do nothing
   returning * into v_record;
 else
   update public.workspace_records set payload=p_payload
   where household_id=p_household and kind=p_kind and version=p_expected_version
   returning * into v_record;
 end if;
 if v_record.id is null then raise exception 'Version conflict: reload before saving'; end if;
 return v_record;
end;
$$;
revoke all on function public.rayku_save_workspace_record(uuid,text,jsonb,bigint) from public;
grant execute on function public.rayku_save_workspace_record(uuid,text,jsonb,bigint) to authenticated;
commit;
