-- =============================================================================
-- CHED MED — Phase 3 migration: Order Management & Smart Dispatching
-- Run AFTER supabase/schema.sql, in the Supabase SQL Editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTEND ORDERS with delivery details + lifecycle timestamps
-- -----------------------------------------------------------------------------
alter table public.orders
  add column if not exists customer_name  text,
  add column if not exists customer_phone text,
  add column if not exists address        text,
  add column if not exists neighborhood   text,          -- batching key
  add column if not exists notes          text,
  add column if not exists assigned_at    timestamptz,
  add column if not exists delivered_at   timestamptz,
  add column if not exists updated_at      timestamptz not null default now();

-- Index the batching key for fast neighborhood grouping.
create index if not exists orders_neighborhood_idx on public.orders (neighborhood);

-- -----------------------------------------------------------------------------
-- 2. updated_at auto-touch
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- 3. STATUS-TRANSITION GUARD
-- -----------------------------------------------------------------------------
-- Enforces a legal status machine so a driver can't jump, e.g., pending->delivered.
-- Admins are exempt (they can override, cancel, reassign).
create or replace function public.enforce_order_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean := (public.current_user_role() = 'admin');
begin
  if tg_op <> 'UPDATE' or new.status = old.status then
    return new;
  end if;

  -- Stamp lifecycle timestamps.
  if new.status = 'delivered' and new.delivered_at is null then
    new.delivered_at := now();
  end if;

  if is_admin then
    return new;  -- admins may set any status
  end if;

  -- Allowed forward transitions for drivers.
  if (old.status = 'assigned'   and new.status in ('picked_up', 'failed'))
  or (old.status = 'picked_up'  and new.status in ('in_transit', 'failed'))
  or (old.status = 'in_transit' and new.status in ('delivered', 'failed')) then
    return new;
  end if;

  raise exception 'Illegal status transition: % -> %', old.status, new.status;
end;
$$;

drop trigger if exists orders_enforce_transition on public.orders;
create trigger orders_enforce_transition
  before update on public.orders
  for each row execute function public.enforce_order_transition();

-- -----------------------------------------------------------------------------
-- 4. SPATIAL CLUSTERING (admin smart-dispatch helper)
-- -----------------------------------------------------------------------------
-- Groups unassigned, geocoded, pending orders into spatial clusters using
-- DBSCAN. `eps_meters` = neighborhood radius; `min_points` = min orders/cluster.
-- SECURITY DEFINER + explicit admin check so only admins can call it.
create or replace function public.cluster_pending_orders(
  eps_meters double precision default 500,
  min_points integer default 1
)
returns table (
  cluster_id  integer,
  order_id    uuid,
  neighborhood text,
  address     text,
  lon         double precision,
  lat         double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    st_clusterdbscan(coordinates::geometry, eps := eps_meters, minpoints := min_points)
      over () as cluster_id,
    id as order_id,
    neighborhood,
    address,
    st_x(coordinates::geometry) as lon,
    st_y(coordinates::geometry) as lat
  from public.orders
  where public.current_user_role() = 'admin'   -- gate: admins only
    and status = 'pending'
    and assigned_driver_id is null
    and coordinates is not null;
$$;

-- -----------------------------------------------------------------------------
-- 5. BATCH ASSIGN (admin smart-dispatch action)
-- -----------------------------------------------------------------------------
-- Assigns a set of orders to one driver in a single call, moving them to
-- 'assigned' and stamping assigned_at. Admin-only.
create or replace function public.batch_assign_orders(
  order_ids uuid[],
  driver uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can assign orders';
  end if;

  -- Validate the target is actually a driver.
  if not exists (
    select 1 from public.profiles where id = driver and role = 'driver'
  ) then
    raise exception 'Target user is not a driver';
  end if;

  update public.orders
     set assigned_driver_id = driver,
         status = 'assigned',
         assigned_at = now()
   where id = any(order_ids)
     and status = 'pending';

  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- =============================================================================
-- End Phase 3 migration.
-- =============================================================================
