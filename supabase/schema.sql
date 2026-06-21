-- =============================================================================
-- CHED MED — Phase 1 Database Schema (Supabase / PostgreSQL)
-- Tables: profiles, orders  |  Security: Row-Level Security (RLS)
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- -----------------------------------------------------------------------------
-- PostGIS gives us a real geographic point type. We store delivery coordinates
-- as geography(Point) so later phases can do native distance / clustering
-- (ST_Distance, ST_DWithin, ST_ClusterDBSCAN) without manual lat/lng math.
create extension if not exists postgis;

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------
-- App-level roles. Kept minimal for Phase 1 (extend later if needed).
do $$ begin
  create type user_role as enum ('admin', 'driver');
exception when duplicate_object then null;
end $$;

-- Order lifecycle states. Drives the driver's guided workflow + admin dashboard.
do $$ begin
  create type order_status as enum (
    'pending',     -- created, not yet assigned to a driver
    'assigned',    -- assigned to a driver, not yet started
    'picked_up',   -- driver has collected the package
    'in_transit',  -- on the way to the customer
    'delivered',   -- completed successfully (POD captured)
    'failed',      -- attempted but could not be delivered
    'cancelled'    -- cancelled by admin
  );
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- 2. PROFILES
-- -----------------------------------------------------------------------------
-- One row per authenticated user. The PK is the auth.users id, so a profile is
-- a 1:1 extension of the Supabase Auth user (where email/password live).
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       user_role   not null default 'driver',
  name       text        not null default '',
  created_at timestamptz not null default now()
);

comment on table  public.profiles is 'App user profile, 1:1 with auth.users.';
comment on column public.profiles.role is 'admin = dispatcher/command center; driver = field execution.';

-- -----------------------------------------------------------------------------
-- 3. ORDERS
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  status             order_status not null default 'pending',
  assigned_driver_id uuid references public.profiles (id) on delete set null,
  coordinates        geography(Point, 4326),  -- drop-off location (WGS84 lon/lat)
  created_at         timestamptz not null default now()
);

comment on table  public.orders is 'Delivery orders. assigned_driver_id null = unassigned.';
comment on column public.orders.coordinates is 'Drop-off point as PostGIS geography (SRID 4326).';

-- Indexes: fast "my tasks" lookups for drivers, and spatial queries for clustering.
create index if not exists orders_assigned_driver_id_idx on public.orders (assigned_driver_id);
create index if not exists orders_status_idx             on public.orders (status);
create index if not exists orders_coordinates_gix        on public.orders using gist (coordinates);

-- -----------------------------------------------------------------------------
-- 4. ROLE HELPER (avoids RLS recursion)
-- -----------------------------------------------------------------------------
-- Reading profiles.role inside a profiles RLS policy would recurse. A
-- SECURITY DEFINER function bypasses RLS to safely fetch the caller's role.
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

comment on function public.current_user_role is 'Returns the role of the calling user; SECURITY DEFINER to avoid RLS recursion.';

-- -----------------------------------------------------------------------------
-- 5. ENABLE RLS
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.orders   enable row level security;

-- -----------------------------------------------------------------------------
-- 6. RLS POLICIES — PROFILES
-- -----------------------------------------------------------------------------
-- A user can always read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

-- Admins can read every profile (fleet/user management).
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.current_user_role() = 'admin');

-- A user can update their own profile, but cannot change their own role
-- (role escalation guard: new role must equal the existing role).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_user_role());

-- Admins can update any profile (including changing roles).
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- -----------------------------------------------------------------------------
-- 7. RLS POLICIES — ORDERS
-- -----------------------------------------------------------------------------
-- Admin: full access (read/insert/update/delete) via FOR ALL.
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all"
  on public.orders for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Driver: read only the orders assigned to them.
drop policy if exists "orders_driver_select_own" on public.orders;
create policy "orders_driver_select_own"
  on public.orders for select
  using (assigned_driver_id = auth.uid());

-- Driver: update only their own orders (e.g. advance status), and the order
-- must remain assigned to them after the update (cannot reassign to others).
drop policy if exists "orders_driver_update_own" on public.orders;
create policy "orders_driver_update_own"
  on public.orders for update
  using (assigned_driver_id = auth.uid())
  with check (assigned_driver_id = auth.uid());

-- NOTE: Drivers have no INSERT or DELETE policy on orders, so those are denied
-- by default. Only admins can create or remove orders.

-- -----------------------------------------------------------------------------
-- 8. AUTO-CREATE PROFILE ON SIGNUP
-- -----------------------------------------------------------------------------
-- When a new auth user is created, automatically insert a matching profile.
-- Role/name can be passed via the signUp options.data (raw_user_meta_data).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'driver'),
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- End of Phase 1 schema.
-- =============================================================================
