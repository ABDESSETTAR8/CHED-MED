-- =============================================================================
-- CHED MED — Phase 4 migration: Fleet map, Proof of Delivery, locations
-- Run AFTER 0002_orders_phase3.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROOF OF DELIVERY columns on orders
-- -----------------------------------------------------------------------------
alter table public.orders
  add column if not exists pod_photo_url     text,
  add column if not exists pod_signature_url text;

-- -----------------------------------------------------------------------------
-- 2. DRIVER LOCATIONS (live fleet tracking — latest ping per driver)
-- -----------------------------------------------------------------------------
create table if not exists public.driver_locations (
  driver_id  uuid primary key references public.profiles (id) on delete cascade,
  location   geography(Point, 4326) not null,
  updated_at timestamptz not null default now()
);

alter table public.driver_locations enable row level security;

-- A driver can upsert ONLY their own location.
drop policy if exists "loc_driver_upsert_own" on public.driver_locations;
create policy "loc_driver_upsert_own"
  on public.driver_locations for all
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

-- Admins can read every driver's location (fleet overview).
drop policy if exists "loc_admin_select" on public.driver_locations;
create policy "loc_admin_select"
  on public.driver_locations for select
  using (public.current_user_role() = 'admin');

-- Convenience RPC for a driver to push their current GPS fix.
create or replace function public.update_my_location(lng double precision, lat double precision)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.driver_locations (driver_id, location, updated_at)
  values (auth.uid(), st_setsrid(st_makepoint(lng, lat), 4326)::geography, now())
  on conflict (driver_id)
  do update set location = excluded.location, updated_at = now();
$$;

-- -----------------------------------------------------------------------------
-- 3. ORDERS MAP RPC — flattened lon/lat for the fleet map
-- -----------------------------------------------------------------------------
-- Returns geocoded orders the caller may see (admins: all; drivers: own — RLS
-- is bypassed by SECURITY DEFINER, so we re-apply the visibility rule here).
create or replace function public.orders_map()
returns table (
  id           uuid,
  status       order_status,
  customer_name text,
  neighborhood text,
  assigned_driver_id uuid,
  lon          double precision,
  lat          double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id, o.status, o.customer_name, o.neighborhood, o.assigned_driver_id,
    st_x(o.coordinates::geometry) as lon,
    st_y(o.coordinates::geometry) as lat
  from public.orders o
  where o.coordinates is not null
    and (
      public.current_user_role() = 'admin'
      or o.assigned_driver_id = auth.uid()   -- drivers: only their own
    );
$$;

-- -----------------------------------------------------------------------------
-- 4. STORAGE — Proof-of-Delivery bucket policies
-- -----------------------------------------------------------------------------
-- Create the bucket via Dashboard (Storage > New bucket > name: "pod",
-- Private) OR uncomment the insert below. Files are namespaced by order id:
--   pod/<order_id>/photo.jpg, pod/<order_id>/signature.png
insert into storage.buckets (id, name, public)
values ('pod', 'pod', false)
on conflict (id) do nothing;

-- Authenticated drivers may upload POD files for orders assigned to them.
drop policy if exists "pod_driver_insert" on storage.objects;
create policy "pod_driver_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'pod'
    and exists (
      select 1 from public.orders o
      where o.id = ((storage.foldername(name))[1])::uuid
        and o.assigned_driver_id = auth.uid()
    )
  );

-- Drivers can read their own orders' POD; admins can read all POD.
drop policy if exists "pod_read" on storage.objects;
create policy "pod_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'pod'
    and (
      public.current_user_role() = 'admin'
      or exists (
        select 1 from public.orders o
        where o.id = ((storage.foldername(name))[1])::uuid
          and o.assigned_driver_id = auth.uid()
      )
    )
  );

-- =============================================================================
-- End Phase 4 migration.
-- =============================================================================
