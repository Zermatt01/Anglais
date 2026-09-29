-- Review of phase 2 (D-069): a refusal (rate limit or monthly cap) is no
-- longer written to ai_calls. Refused requests cost nothing and did not reach
-- the model, and logging each of them let an allowed account make the table
-- grow without bound: the rate limit applies to calls, not to refusals. They
-- stay visible in the logs of the Edge Function (event "ai_refused").
--
-- Same signature: the privileges of the function are kept. The statuses
-- refused_budget and refused_rate stay allowed by the table, for rows that
-- an earlier version may have written.

create or replace function public.ai_reserve_call(
  p_user_id uuid,
  p_request_id uuid,
  p_attempt integer,
  p_task text,
  p_model text,
  p_prompt_version text,
  p_reserved_cost_usd numeric,
  p_monthly_budget_usd numeric,
  p_rate_limit_per_minute integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_used numeric;
  v_recent integer;
  v_call_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended('ai_calls:' || p_user_id::text, 0));

  if p_attempt = 1 and exists (
    select 1 from public.ai_calls as c
    where c.user_id = p_user_id and c.request_id = p_request_id
  ) then
    return jsonb_build_object('outcome', 'duplicate');
  end if;

  v_used := public.ai_spent_usd(p_user_id, public.ai_month_start());

  if p_attempt = 1 then
    select count(*) into v_recent
    from public.ai_calls as c
    where c.user_id = p_user_id
      and c.created_at > now() - interval '1 minute'
      and c.status not in ('refused_budget', 'refused_rate');
    if v_recent >= p_rate_limit_per_minute then
      return jsonb_build_object('outcome', 'rate_limited', 'month_used_usd', v_used);
    end if;
  end if;

  if v_used + p_reserved_cost_usd > p_monthly_budget_usd then
    return jsonb_build_object('outcome', 'budget_exceeded', 'month_used_usd', v_used);
  end if;

  insert into public.ai_calls (
    user_id, request_id, attempt, task, model, prompt_version, status, reserved_cost_usd
  )
  values (
    p_user_id, p_request_id, p_attempt, p_task, p_model, p_prompt_version, 'reserved',
    p_reserved_cost_usd
  )
  returning id into v_call_id;

  return jsonb_build_object('outcome', 'reserved', 'call_id', v_call_id, 'month_used_usd', v_used);
end;
$$;
