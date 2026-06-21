/**
 * Admin · Orders — create, dispatch, and monitor all orders.
 * Server Component: fetches data via the RLS-protected order layer.
 */
import { listOrders, listPendingOrders, listDrivers } from "@/lib/orders";
import { CreateOrderForm } from "@/components/admin/CreateOrderForm";
import { AssignBatch } from "@/components/admin/AssignBatch";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const dynamic = "force-dynamic"; // always reflect latest data

export default async function AdminOrdersPage() {
  const [orders, pending, drivers] = await Promise.all([
    listOrders(),
    listPendingOrders(),
    listDrivers(),
  ]);

  return (
    <main className="space-y-8 p-6">
      <section>
        <h1 className="text-2xl font-bold text-brand">Orders</h1>
        <p className="text-sm text-slate-500">
          Create deliveries, batch-assign by neighborhood, and track status.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 p-4">
        <h2 className="mb-3 font-semibold text-slate-800">New order</h2>
        <CreateOrderForm />
      </section>

      <section className="rounded-xl border border-slate-200 p-4">
        <h2 className="mb-3 font-semibold text-slate-800">
          Smart dispatch · {pending.length} pending
        </h2>
        <AssignBatch pending={pending} drivers={drivers} />
      </section>

      <section className="rounded-xl border border-slate-200 p-4">
        <h2 className="mb-3 font-semibold text-slate-800">All orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Neighborhood</th>
                  <th className="py-2 pr-4">Address</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{o.customer_name ?? "—"}</td>
                    <td className="py-2 pr-4">{o.neighborhood ?? "—"}</td>
                    <td className="py-2 pr-4">{o.address ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
