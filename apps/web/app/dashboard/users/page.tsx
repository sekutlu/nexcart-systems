"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, ShieldCheck, Trash2, Truck, UserCheck, Users, X } from "lucide-react";
import { getStoredUser } from "@/lib/useAuth";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: { orders: number };
};

type FormState = {
  name: string;
  email: string;
  password: string;
  role: string;
};

const EMPTY_FORM: FormState = { name: "", email: "", password: "", role: "CUSTOMER" };
const ROLES = ["CUSTOMER", "ADMIN", "DELIVERY_STAFF", "SUPER_ADMIN"];

const ROLE_COLOR: Record<string, string> = {
  CUSTOMER: "#3b82f6",
  ADMIN: "var(--accent)",
  DELIVERY_STAFF: "#f59e0b",
  SUPER_ADMIN: "#7c3aed",
};

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = () => getStoredUser()?.token ?? "";
  const currentUserId = getStoredUser()?.id;
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const count = (role: string) => users.filter((u) => u.role === role).length;

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setError("");
    setModal("create");
  };

  const openEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setEditing(user);
    setError("");
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setError("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (modal === "create" && !form.password) {
      setError("Password is required for new users.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const isEdit = modal === "edit";
      const body = {
        name: form.name,
        email: form.email,
        role: form.role,
        ...(form.password ? { password: form.password } : {}),
      };
      const res = await fetch(isEdit ? `/api/admin/users/${editing!.id}` : "/api/admin/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save user.");
        return;
      }
      setMessage(isEdit ? "User updated." : "User created.");
      setTimeout(() => setMessage(""), 3000);
      closeModal();
      load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    setDeleteTarget(null);
    if (res.ok) {
      setMessage("User deleted.");
      setTimeout(() => setMessage(""), 3000);
      load();
    } else {
      setError(data.error ?? "Could not delete user.");
    }
  };

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Users</h1>
          <p className="db-page-sub">{loading ? "Loading..." : `${users.length} registered accounts`}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} strokeWidth={2.5} /> Add User
        </button>
      </div>

      {message && <p className="alert alert-success">{message}</p>}
      {error && !modal && <p className="alert alert-error">{error}</p>}

      <div className="db-metrics">
        {[
          { label: "Total", value: users.length, Icon: Users, color: "#3b82f6" },
          { label: "Customers", value: count("CUSTOMER"), Icon: UserCheck, color: "#3b82f6" },
          { label: "Admins", value: count("ADMIN") + count("SUPER_ADMIN"), Icon: ShieldCheck, color: "var(--accent)" },
          { label: "Delivery", value: count("DELIVERY_STAFF"), Icon: Truck, color: "#f59e0b" },
        ].map((m) => (
          <div className="db-metric-card" key={m.label}>
            <div className="db-metric-top">
              <span className="db-metric-label">{m.label}</span>
              <span className="db-metric-icon" style={{ background: m.color + "22", color: m.color }}>
                <m.Icon size={16} strokeWidth={2} />
              </span>
            </div>
            <div className="db-metric-value">{loading ? "..." : m.value}</div>
          </div>
        ))}
      </div>

      <div className="db-card">
        {loading ? (
          <div className="empty" style={{ padding: "40px 20px" }}><p>Loading users...</p></div>
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
                <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Orders</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const color = ROLE_COLOR[user.role] ?? "var(--muted)";
                  return (
                    <tr key={user.id}>
                      <td style={{ color: "var(--muted)" }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{user.name}</td>
                      <td style={{ color: "var(--muted)", fontSize: 13 }}>{user.email}</td>
                      <td>
                        <span className="db-status-badge" style={{ color, background: color + "18", border: `1px solid ${color}44` }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: 13 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 700 }}>{user._count?.orders ?? 0}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="db-action-btn" onClick={() => openEdit(user)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            className="db-action-btn db-action-danger"
                            onClick={() => setDeleteTarget(user)}
                            disabled={user.id === currentUserId}
                            style={{ display: "flex", alignItems: "center", gap: 4, opacity: user.id === currentUserId ? 0.45 : 1 }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ alignItems: "center", background: "rgba(0,0,0,.5)", bottom: 0, display: "flex", justifyContent: "center", left: 0, padding: 20, position: "fixed", right: 0, top: 0, zIndex: 200 }}>
          <div style={{ background: "var(--panel)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)", maxHeight: "90vh", overflowY: "auto", padding: 32, width: "100%", maxWidth: 520 }}>
            <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{modal === "edit" ? "Edit User" : "New User"}</h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="field">
                <label>Email</label>
                <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="name@example.com" type="email" />
              </div>
              <div className="field">
                <label>{modal === "edit" ? "New Password (optional)" : "Password"}</label>
                <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Minimum 8 characters" type="password" />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                  {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              {error && <p className="alert alert-error">{error}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : modal === "edit" ? "Save Changes" : "Create User"}
                </button>
                <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={{ alignItems: "center", background: "rgba(0,0,0,.5)", bottom: 0, display: "flex", justifyContent: "center", left: 0, padding: 20, position: "fixed", right: 0, top: 0, zIndex: 300 }}>
          <div style={{ background: "var(--panel)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)", padding: 32, textAlign: "center", width: "100%", maxWidth: 420 }}>
            <div style={{ alignItems: "center", background: "var(--accent-glow)", borderRadius: "50%", display: "inline-flex", height: 56, justifyContent: "center", marginBottom: 16, width: 56 }}>
              <Trash2 size={24} style={{ color: "var(--accent)" }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Delete User?</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
              <strong style={{ color: "var(--ink)" }}>{deleteTarget.name}</strong> will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: "var(--accent)" }} onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
