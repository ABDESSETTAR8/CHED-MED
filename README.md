# CHED MED

Intelligent last-mile delivery management — a Next.js 15 + Supabase PWA.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Supabase** (PostgreSQL, Auth, Row-Level Security)
- **Tailwind CSS** (+ shadcn/ui in a later phase)
- **next-pwa** (Workbox service worker, offline-first)

## Phase 1 — foundation

- SQL schema + RLS policies (`supabase/schema.sql`)
- TypeScript data models (`src/types/database.ts`)
- Supabase clients: browser, server, middleware (`src/lib/supabase/`)
- Role-based routing middleware (`src/middleware.ts`)
- PWA manifest + service worker config (`public/manifest.webmanifest`, `next.config.ts`)
- Route stubs: `/login`, `/admin/dashboard`, `/driver/tasks`

## Phase 2 — authentication & authorization

- Email/password sign-in via server actions (`src/app/login/actions.ts`)
- Client login form with inline errors (`src/components/shared/LoginForm.tsx`)
- Auth callback for email confirmation / OAuth (`src/app/auth/callback/route.ts`)
- Server-side auth helpers: `getCurrentProfile`, `requireRole` (`src/lib/auth.ts`)
- Authenticated `/admin` and `/driver` layouts with role guards + sign-out (`AppHeader`)
- Shared UI primitives: `Button`, `Input` (`src/components/shared/`)

**Defence in depth:** RLS (database) → middleware (routing) → layout `requireRole` (server render). Auth UI only; order management arrives in Phase 3.

## Phase 3 — order management & smart dispatching

- DB migration `supabase/migrations/0002_orders_phase3.sql`: extra order columns
  (customer/address/neighborhood/timestamps), `updated_at` trigger, a
  **status-transition guard**, plus two admin RPCs — `cluster_pending_orders`
  (PostGIS DBSCAN) and `batch_assign_orders`.
- Order data layer (`src/lib/orders.ts`) — typed, RLS-backed.
- Admin `/admin/orders`: create orders, **smart dispatch** (pending orders
  grouped by neighborhood, batch-assign to a driver), and a full order table.
- Driver `/driver/tasks`: guided, card-based workflow
  (`assigned → picked_up → in_transit → delivered`, or `failed`), one-tap
  Google Maps navigation, and a history section.
- Header navigation per role (`AppHeader`).

> Run the Phase 3 migration in the SQL editor **after** `schema.sql`.

**Migration order:** `schema.sql` → `migrations/0002_orders_phase3.sql`.

## Phase 4 — fleet map, analytics & proof of delivery

- DB migration `supabase/migrations/0003_fleet_pod_phase4.sql`: POD columns,
  `driver_locations` table + RLS, `update_my_location` / `orders_map` RPCs, and
  **Storage policies** for a private `pod` bucket.
- **Proof of Delivery** (`/driver/tasks`): the final `in_transit → delivered`
  step captures a package photo + canvas signature, uploads them to the `pod`
  bucket, and stores the paths on the order.
- **Live fleet map** (`/admin/fleet`): Google Maps with color-coded order pins
  (needs `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).
- **Analytics** (`/admin/analytics`): completion rate, zone performance, driver
  efficiency (dependency-free CSS bars).
- **Offline polish**: `OfflineIndicator` banner + `/offline` fallback wired into
  next-pwa `fallbacks`.

**Migration order:** `schema.sql` → `0002_orders_phase3.sql` → `0003_fleet_pod_phase4.sql`.

### Phase 4 setup

1. Run `0003_fleet_pod_phase4.sql` (it creates the `pod` bucket + policies).
2. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local` (Google Cloud → Maps
   JavaScript API enabled, key restricted to your domain).
3. Drivers' browsers will prompt for camera access on first POD photo.

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.local.example .env.local
#    -> fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Apply the database schema
#    Open Supabase Dashboard > SQL Editor > New query,
#    paste the contents of supabase/schema.sql, and Run.

# 4. Run the dev server
pnpm dev   # http://localhost:3000
```

> The service worker is disabled in development (by design). Run `pnpm build && pnpm start` to test PWA/offline behavior.

## Creating test users

In Supabase **Authentication > Users > Add user**, create an admin and a driver.
To set the role at signup from the app, pass it via metadata:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: { data: { role: "admin", name: "Ada Admin" } },
});
```

The `handle_new_user` trigger then creates the matching `profiles` row.
To promote an existing user, update `profiles.role` (as an admin) in the SQL editor.

## Project structure

```
src/
  app/
    layout.tsx              # root layout (manifest + theme)
    page.tsx                # landing
    login/page.tsx
    admin/dashboard/page.tsx
    driver/tasks/page.tsx
  components/{shared,admin,driver}/   # UI (filled in later phases)
  lib/supabase/{client,server,middleware}.ts
  types/database.ts
  middleware.ts             # role-based route protection
supabase/schema.sql
public/manifest.webmanifest
```

## Deploying to Netlify

1. Push the repo to GitHub.
2. Netlify → **Add new site → Import an existing project** → pick the repo.
   Build settings are read from `netlify.toml` (command `pnpm build`, Next runtime).
3. Add environment variables (**Site configuration → Environment variables**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional)
4. **Deploy**. After it's live, set the production URL in Supabase →
   **Authentication → URL Configuration → Site URL** (and add it to Redirect URLs).
5. Restrict your Google Maps key to the Netlify domain.

Test the production build locally first: `pnpm build && pnpm start`.

## Security model

The **database RLS is the real security boundary** (see `supabase/schema.sql`).
Middleware only improves UX by redirecting users away from the wrong area —
it is never the sole guard.
