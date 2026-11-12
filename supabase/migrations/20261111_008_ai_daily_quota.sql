-- Daily quota for authenticated Chef Rayku requests. Applied in Supabase.
create table if not exists public.rayku_ai_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 usage_date date not null default (now() at time zone 'utc')::date,
 requests integer not null default 0 check (requests between 0 and 10000),
 updated_at timestamptz not null default now(),
 primary key (user_id,usage_date)
);
alter table public.rayku_ai_usage enable row level security;
revoke all on public.rayku_ai_usage from anon, authenticated;
create or replace function public.rayku_ai_rate_limit(p_max integer default 15)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_user uuid := auth.uid();
declare v_updated integer;
begin
 if v_user is null then return false; end if;
 if p_max < 1 or p_max > 30 then raise exception 'Límite inválido'; end if;
 insert into public.rayku_ai_usage(user_id,usage_date,requests,updated_at)
 values(v_user,(now() at time zone 'utc')::date,1,now())
 on conflict(user_id,usage_date)
 do update set requests=public.rayku_ai_usage.requests+1,updated_at=now()
 where public.rayku_ai_usage.requests < p_max;
 get diagnostics v_updated=row_count;
 return v_updated=1;
end;
$$;
revoke execute on function public.rayku_ai_rate_limit(integer) from public,anon;
grant execute on function public.rayku_ai_rate_limit(integer) to authenticated;
