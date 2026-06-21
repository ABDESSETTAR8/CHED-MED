/**
 * CHED MED — TypeScript data models.
 * These mirror the SQL schema in supabase/schema.sql. Keep the two in sync.
 */

// -----------------------------------------------------------------------------
// Enums (must match the Postgres enum types exactly)
// -----------------------------------------------------------------------------
export type UserRole = "admin" | "driver";

export type OrderStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed"
  | "cancelled";

// -----------------------------------------------------------------------------
// Row models
// -----------------------------------------------------------------------------

/** A user profile (1:1 with auth.users). */
export interface Profile {
  id: string;            // uuid, equals auth.users.id
  role: UserRole;
  name: string;
  created_at: string;    // ISO timestamp
}

/**
 * A delivery order.
 * `coordinates` is PostGIS geography(Point). Over PostgREST it serializes as
 * GeoJSON; we model it as a GeoJSON Point (or null when not yet geocoded).
 */
export interface Order {
  id: string;                          // uuid
  status: OrderStatus;
  assigned_driver_id: string | null;   // uuid -> profiles.id, null = unassigned
  coordinates: GeoPoint | null;
  created_at: string;                  // ISO timestamp

  // Added in Phase 3 (see supabase/migrations/0002_orders_phase3.sql)
  customer_name: string | null;
  customer_phone: string | null;
  address: string | null;
  neighborhood: string | null;         // batching key for smart dispatch
  notes: string | null;
  assigned_at: string | null;
  delivered_at: string | null;
  updated_at: string;

  // Added in Phase 4 (Proof of Delivery)
  pod_photo_url: string | null;
  pod_signature_url: string | null;
}

/** A driver's latest known location (admin fleet view). */
export interface DriverLocation {
  driver_id: string;
  lon: number;
  lat: number;
  updated_at: string;
}

/** One row from the orders_map() RPC. */
export interface OrderMapPoint {
  id: string;
  status: OrderStatus;
  customer_name: string | null;
  neighborhood: string | null;
  assigned_driver_id: string | null;
  lon: number;
  lat: number;
}

/** One row from the cluster_pending_orders() RPC. */
export interface OrderCluster {
  cluster_id: number;
  order_id: string;
  neighborhood: string | null;
  address: string | null;
  lon: number;
  lat: number;
}

/** Minimal GeoJSON Point: coordinates are [longitude, latitude]. */
export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

// -----------------------------------------------------------------------------
// Insert / Update helper types (Phase 1 — extend as columns are added)
// -----------------------------------------------------------------------------
export type OrderInsert = {
  status?: OrderStatus;
  assigned_driver_id?: string | null;
  coordinates?: GeoPoint | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  notes?: string | null;
};

export type OrderUpdate = Partial<OrderInsert>;

// -----------------------------------------------------------------------------
// Supabase Database typing (passed to createClient<Database>)
// -----------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Pick<Profile, "id"> & Partial<Omit<Profile, "id">>;
        Update: Partial<Omit<Profile, "id">>;
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        // Status workflow + POD fields are updatable post-creation.
        Update: OrderUpdate & {
          pod_photo_url?: string | null;
          pod_signature_url?: string | null;
        };
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
    };
  };
}
