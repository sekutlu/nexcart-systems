"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, Receipt, Users, Plus, Clock, TrendingUp } from "lucide-react";
import { getStoredUser } from "@/lib/useAuth";

type Metrics = { products: number; orders: number; users: number; pending: number; sales: number };
type Order   = { id: string; user: { name: string; email: string }; total: number; status: string; createdAt: string; items: { product: { name: string } }[] };

const STATUS_COLOR: Record<string, string> = {
  PENDING:   "var(--muted)",
  PAID:      "#3b82f6",
  SHIPPED:   "#f59e0b",
  CANCELLED: "var(--accent)",
  DELIVERED: "var(--teal)",
};

export default function DashboardPage() {
  const [metrics, setMetrics]   = useState<Metrics | null>(null);
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token = getStoredUser()?.token;
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/admin/metrics",  { headers: h }).then(r => r.json()),
      fetch("/api/admin/orders",   { headers: h }).then(r => r.json()),
    ]).then(([m, o]) => {
      setMetrics(m);
      setOrders(Array.isArray(o) ? o.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Products",   value: metrics?.products ?? "—",                                          Icon: Package,    color: "#3b82f6"       },
    { label: "Total Orders",     value: metrics?.orders   ?? "—",                                          Icon: Receipt,    color: "#f59e0b"       },
    { label: "Registered Users", value: metrics?.users    ?? "—",                                          Icon: Users,      color: "#10b981"       },
    { label: "Total Sales",      value: metrics ? `M ${metrics.sales.toLocaleString()}` : "—",             Icon: TrendingUp, color: "var(--teal)"   },
  ];

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Overview</h1>
          <p className="db-page-sub">Welcome back, Admin — here&apos;s what&apos;s happening.</p>
        </div>
        <Link href="/admin/products" className="btn btn-primary">
          <Plus size={15} strokeWidth={2.5} /> New Product
        </Link>
      </div>

      <div className="db-metrics">
        {cards.map(({ label, value, Icon, color }) => (
          <div className="db-metric-card" key={label}>
            <div className="db-metric-top">
              <span className="db-metric-label">{label}</span>
              <span className="db-metric-icon" style={{ background: color + "22", color }}>
                <Icon size={16} strokeWidth={2} />
              </span>
            </div>
            <div className="db-metric-value">{loading ? "…" : value}</div>
          </div>
        ))}
      </div>

      <div className="db-card">
        <div className="db-card-header">
          <h2 className="db-card-title">Recent Orders</h2>
          <Link href="/dashboard/orders" className="db-card-link">View all →</Link>
        </div>
        {loading ? (
          <div className="empty" style={{ padding: "40px 20px" }}><p>Loading…</p></div>
        ) : orders.length === 0 ? (
          <div className="empty" style={{ padding: "40px 20px" }}>
            <Receipt size={36} strokeWidth={1} style={{ opacity: 0.25 }} />
            <h3>No orders yet</h3>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><span className="db-order-id">#{o.id.slice(-6).toUpperCase()}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.user.name}</div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{o.user.email}</div>
                    </td>
                    <td style={{ color: "var(--ink-soft)" }}>{o.items[0]?.product?.name ?? "—"}</td>
                    <td style={{ fontWeight: 700 }}>M {Number(o.total).toLocaleString()}</td>
                    <td>
                      <span className="db-status-badge" style={{ color: STATUS_COLOR[o.status], background: STATUS_COLOR[o.status] + "18", border: `1px solid ${STATUS_COLOR[o.status]}44` }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
