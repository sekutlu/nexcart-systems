"use client";

import { useEffect, useState } from "react";
import { Receipt, Clock, Truck, XCircle, CheckCircle2, CreditCard } from "lucide-react";
import { getStoredUser } from "@/lib/useAuth";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { product: { name: string } }[];
};

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_COLOR: Record<string, string> = {
  PENDING:   "var(--muted)",
  PAID:      "#3b82f6",
  SHIPPED:   "#f59e0b",
  DELIVERED: "var(--teal)",
  CANCELLED: "var(--accent)",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  PENDING:   Clock,
  PAID:      CreditCard,
  SHIPPED:   Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
};

export default function DashboardOrdersPage() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess]   = useState("");

  const token = () => getStoredUser()?.token ?? "";

  const load = () => {
    setLoading(true);
    fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      setSuccess(`Order updated to ${status}`);
      setTimeout(() => setSuccess(""), 3000);
    }
    setUpdating(null);
  };

  const count = (s: string) => orders.filter(o => o.status === s).length;

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Orders</h1>
          <p className="db-page-sub">{loading ? "Loading…" : `${orders.length} orders total`}</p>
        </div>
      </div>

      {success && <p className="alert alert-success">{success}</p>}

      <div className="db-metrics">
        {[
          { label: "Total",     value: orders.length,      Icon: Receipt,      color: "#3b82f6"        },
          { label: "Pending",   value: count("PENDING"),   Icon: Clock,        color: "var(--muted)"   },
          { label: "Shipped",   value: count("SHIPPED"),   Icon: Truck,        color: "#f59e0b"        },
          { label: "Delivered", value: count("DELIVERED"), Icon: CheckCircle2, color: "var(--teal)"    },
        ].map((m) => (
          <div className="db-metric-card" key={m.label}>
            <div className="db-metric-top">
              <span className="db-metric-label">{m.label}</span>
              <span className="db-metric-icon" style={{ background: m.color + "22", color: m.color }}>
                <m.Icon size={16} strokeWidth={2} />
              </span>
            </div>
            <div className="db-metric-value">{loading ? "…" : m.value}</div>
          </div>
        ))}
      </div>

      <div className="db-card">
        {loading ? (
          <div className="empty" style={{ padding: "40px 20px" }}><p>Loading orders…</p></div>
        ) : orders.length === 0 ? (
          <div className="empty" style={{ padding: "60px 20px" }}>
            <Receipt size={40} strokeWidth={1} style={{ opacity: 0.25 }} />
            <h3>No orders yet</h3>
            <p>Orders will appear here once customers start checking out.</p>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Date</th><th>Status</th><th>Update Status</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const sc   = STATUS_COLOR[o.status];
                  const Icon = STATUS_ICON[o.status] ?? Clock;
                  const busy = updating === o.id;
                  return (
                    <tr key={o.id} style={{ opacity: busy ? 0.6 : 1, transition: "opacity 0.2s" }}>
                      <td><span className="db-order-id">#{o.id.slice(-8).toUpperCase()}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.user.name}</div>
                        <div style={{ color: "var(--muted)", fontSize: 12 }}>{o.user.email}</div>
                      </td>
                      <td style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                        {o.items.slice(0, 2).map(i => i.product.name).join(", ")}
                        {o.items.length > 2 && ` +${o.items.length - 2} more`}
                      </td>
                      <td style={{ fontWeight: 700 }}>M {Number(o.total).toLocaleString()}</td>
                      <td style={{ color: "var(--muted)", fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td>
                        <span className="db-status-badge" style={{ color: sc, background: sc + "18", border: `1px solid ${sc}44`, display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <Icon size={11} strokeWidth={2.5} /> {o.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.status}
                          disabled={busy}
                          onChange={e => updateStatus(o.id, e.target.value)}
                          style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", color: "var(--ink)", cursor: "pointer", font: "inherit", fontSize: 12, fontWeight: 600, padding: "5px 10px", width: "100%" }}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
