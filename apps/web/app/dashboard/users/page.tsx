"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, ShieldCheck, Truck } from "lucide-react";
import { getStoredUser } from "@/lib/useAuth";

type User = { id: string; name: string; email: string; role: string; createdAt: string; _count: { orders: number } };

const ROLE_COLOR: Record<string, string> = {
  CUSTOMER:       "#3b82f6",
  ADMIN:          "var(--accent)",
  DELIVERY_STAFF: "#f59e0b",
  SUPER_ADMIN:    "#7c3aed",
};

export default function DashboardUsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredUser()?.token;
    if (!token) return;
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const count = (role: string) => users.filter(u => u.role === role).length;

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Users</h1>
          <p className="db-page-sub">{loading ? "Loading…" : `${users.length} registered accounts`}</p>
        </div>
      </div>

      <div className="db-metrics">
        {[
          { label: "Total",     value: users.length,          Icon: Users,       color: "#3b82f6"        },
          { label: "Customers", value: count("CUSTOMER"),     Icon: UserCheck,   color: "#3b82f6"        },
          { label: "Admins",    value: count("ADMIN"),        Icon: ShieldCheck, color: "var(--accent)"  },
          { label: "Delivery",  value: count("DELIVERY_STAFF"), Icon: Truck,     color: "#f59e0b"        },
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
          <div className="empty" style={{ padding: "40px 20px" }}><p>Loading users…</p></div>
        ) : users.length === 0 ? (
          <div className="empty" style={{ padding: "60px 20px" }}>
            <Users size={40} strokeWidth={1} style={{ opacity: 0.25 }} />
            <h3>No users yet</h3>
            <p>Users will appear here once they register.</p>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Orders</th></tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const c = ROLE_COLOR[u.role] ?? "var(--muted)";
                  return (
                    <tr key={u.id}>
                      <td style={{ color: "var(--muted)" }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: "var(--muted)", fontSize: 13 }}>{u.email}</td>
                      <td>
                        <span className="db-status-badge" style={{ color: c, background: c + "18", border: `1px solid ${c}44` }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 700 }}>{u._count?.orders ?? 0}</td>
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
