-- Quotas only: no submitted messages, original IPs, credentials or scan histories.
create table public.phishguard_rate_limits (
  key text primary key,
  window_id bigint not null,
  count integer not null check (count >= 0),
  expires_at timestamptz not null
);
create index phishguard_quota_expiry on public.phishguard_rate_limits(expires_at);
alter table public.phishguard_rate_limits enable row level security;
revoke all on public.phishguard_rate_limits from public, anon, authenticated, service_role;

create function public.consume_analysis_quota(p_client_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_minute bigint := floor(extract(epoch from v_now) / 60);
  v_hour bigint := floor(extract(epoch from v_now) / 3600);
  v_keys text[] := array['client-' || p_client_hash, 'global-minute', 'global-hour'];
  v_windows bigint[] := array[v_minute, v_minute, v_hour];
  v_ceilings integer[] := array[5, 30, 300];
  v_counts integer[] := array[0, 0, 0];
  v_count integer;
  i integer;
begin
  if p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid client identifier';
  end if;
  -- Serialises all increments so concurrent Edge instances cannot overspend the quota.
  perform pg_catalog.pg_advisory_xact_lock(718234910);
  delete from public.phishguard_rate_limits where expires_at < v_now;
  for i in 1..3 loop
    select count into v_count from public.phishguard_rate_limits
      where key = v_keys[i] and window_id = v_windows[i];
    v_counts[i] := coalesce(v_count, 0);
    if v_counts[i] >= v_ceilings[i] then return false; end if;
  end loop;
  for i in 1..3 loop
    insert into public.phishguard_rate_limits(key, window_id, count, expires_at)
    values (v_keys[i], v_windows[i], v_counts[i] + 1, v_now + interval '1 day')
    on conflict (key) do update set window_id = excluded.window_id,
      count = excluded.count, expires_at = excluded.expires_at;
  end loop;
  return true;
end;
$$;
revoke all on function public.consume_analysis_quota(text) from public, anon, authenticated;
grant execute on function public.consume_analysis_quota(text) to service_role;
