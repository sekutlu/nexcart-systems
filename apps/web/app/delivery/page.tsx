"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, CreditCard, Package, Truck, XCircle } from "lucide-react";
import { WithAuth } from "@/components/WithAuth";
import { getStoredUser } from "@/lib/useAuth";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { product: { name: string } }[];
};

const DELIVERY_STATUSES = ["SHIPPED", "DELIVERED"];

const STATUS_COLOR: Record<string, string> = {
  PENDING: "var(--muted)",
  PAID: "#3b82f6",
  SHIPPED: "#f59e0b",
  DELIVERED: "var(--teal)",
  CANCELLED: "var(--accent)",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  PENDING: Clock,
  PAID: CreditCard,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
};

function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const token = () => getStoredUser()?.token ?? "";

  const load = () => {
    setLoading(true);
    fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    setMessage("");
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
      setMessage(`Order marked as ${status.toLowerCase()}.`);
    } else {
      setMessage(data.error ?? "Could not update order.");
    }
    setUpdating(null);
  };

  return (
    <div className="page-wrap">
      <div className="stack-sm">
        <div className="page-header">
          <h1>Delivery Orders</h1>
          <p>Update orders as they move through dispatch and delivery.</p>
        </div>

        {message && <p className={message.includes("Could not") ? "alert alert-error" : "alert alert-success"}>{message}</p>}

        <div className="panel">
          {loading ? (
            <div className="empty"><p>Loading delivery orders...</p></div>
          ) : orders.length === 0 ? (
            <div className="empty">
              <Package size={42} strokeWidth={1} style={{ opacity: 0.25 }} />
              <h3>No orders assigned yet</h3>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Delivery Update</th></tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const Icon = STATUS_ICON[order.status] ?? Clock;
                    const color = STATUS_COLOR[order.status] ?? "var(--muted)";
                    const busy = updating === order.id;

                    return (
                      <tr key={order.id} style={{ opacity: busy ? 0.6 : 1 }}>
                        <td><span className="db-order-id">#{order.id.slice(-8).toUpperCase()}</span></td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{order.user.name}</div>
                          <div style={{ color: "var(--muted)", fontSize: 12 }}>{order.user.email}</div>
                        </td>
                        <td style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                          {order.items.slice(0, 2).map((i) => i.product.name).join(", ")}
                          {order.items.length > 2 && ` +${order.items.length - 2} more`}
                        </td>
                        <td style={{ fontWeight: 700 }}>M {Number(order.total).toLocaleString()}</td>
                        <td>
                          <span className="db-status-badge" style={{ color, background: color + "18", border: `1px solid ${color}44`, display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <Icon size={11} strokeWidth={2.5} /> {order.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={DELIVERY_STATUSES.includes(order.status) ? order.status : ""}
                            disabled={busy || order.status === "CANCELLED"}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", color: "var(--ink)", cursor: "pointer", font: "inherit", fontSize: 12, fontWeight: 600, padding: "5px 10px", width: "100%" }}
                          >
                            <option value="" disabled>Choose status</option>
                            {DELIVERY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
    </div>
  );
}

export default function DeliveryPage() {
  return (
    <WithAuth roles={["DELIVERY_STAFF", "ADMIN", "SUPER_ADMIN"]}>
      <DeliveryOrdersPage />
    </WithAuth>
  );
}
