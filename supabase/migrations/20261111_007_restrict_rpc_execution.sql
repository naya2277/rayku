-- Limit remote procedure execution to signed-in Rayku users.
-- Already applied to the connected Supabase project on 2026-11-11.
-- All statements are idempotent.
revoke execute on function public.rayku_accept_household_invitation(text) from public, anon;
revoke execute on function public.rayku_create_household(text) from public, anon;
revoke execute on function public.rayku_create_household_invitation(uuid,text) from public, anon;
revoke execute on function public.rayku_is_household_member(uuid,uuid) from public, anon;
revoke execute on function public.rayku_is_household_owner(uuid,uuid) from public, anon;
revoke execute on function public.rayku_save_workspace_record(uuid,text,jsonb,bigint) from public, anon;
revoke execute on function public.rayku_add_household_owner() from public, anon, authenticated;
revoke execute on function public.rayku_stamp_workspace_record() from public, anon, authenticated;
grant execute on function public.rayku_accept_household_invitation(text) to authenticated;
grant execute on function public.rayku_create_household(text) to authenticated;
grant execute on function public.rayku_create_household_invitation(uuid,text) to authenticated;
grant execute on function public.rayku_is_household_member(uuid,uuid) to authenticated;
grant execute on function public.rayku_is_household_owner(uuid,uuid) to authenticated;
grant execute on function public.rayku_save_workspace_record(uuid,text,jsonb,bigint) to authenticated;
