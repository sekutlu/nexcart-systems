"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";
import { getStoredUser } from "@/lib/useAuth";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
};

type FormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = { name: "", description: "", price: "", stock: "0", category: "", imageUrl: "", isActive: true };
const CATEGORIES = ["Computers", "Networking", "ICT Products", "Web Hosting", "Accessories"];
const STATUS_COLOR = (p: Product) => p.stock === 0 ? "var(--accent)" : p.stock <= 5 ? "#f59e0b" : "var(--teal)";
const STATUS_LABEL = (p: Product) => p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "Active";

export default function DashboardProductsPage() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState<"create" | "edit" | null>(null);
  const [editing, setEditing]         = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm]               = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  const token = () => getStoredUser()?.token ?? "";
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/products", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setError(""); setModal("create"); };
  const openEdit   = (p: Product) => {
    setForm({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock), category: p.category, imageUrl: p.imageUrl ?? "", isActive: p.isActive });
    setEditing(p);
    setError("");
    setModal("edit");
  };
  const closeModal = () => { setModal(null); setEditing(null); setError(""); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.price) {
      setError("Name, description, and price are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock), imageUrl: form.imageUrl || null };
      const url  = modal === "edit" ? `/api/admin/products/${editing!.id}` : "/api/admin/products";
      const res  = await fetch(url, { method: modal === "edit" ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save product."); return; }
      setSuccess(modal === "edit" ? "Product updated." : "Product created.");
      setTimeout(() => setSuccess(""), 3000);
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
    const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    setDeleteTarget(null);
    if (res.ok) { setSuccess("Product deleted."); setTimeout(() => setSuccess(""), 3000); load(); }
    else setError("Failed to delete product.");
  };

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">Products</h1>
          <p className="db-page-sub">{loading ? "Loading…" : `${products.length} products in catalog`}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} strokeWidth={2.5} /> Add Product
        </button>
      </div>

      {success && <p className="alert alert-success">{success}</p>}
      {error && !modal && <p className="alert alert-error">{error}</p>}

      <div className="db-card">
        {loading ? (
          <div className="empty" style={{ padding: "40px 20px" }}><p>Loading products…</p></div>
        ) : products.length === 0 ? (
          <div className="empty" style={{ padding: "60px 20px" }}>
            <Package size={40} strokeWidth={1} style={{ opacity: 0.25 }} />
            <h3>No products yet</h3>
            <p>Click "Add Product" to create your first product.</p>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr><th>#</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const sc = STATUS_COLOR(p);
                  return (
                    <tr key={p.id}>
                      <td style={{ color: "var(--muted)" }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ color: "var(--muted)", fontSize: 12, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>
                      </td>
                      <td><span className="db-tag">{p.category || "—"}</span></td>
                      <td style={{ fontWeight: 700 }}>M {Number(p.price).toLocaleString()}</td>
                      <td style={{ color: sc, fontWeight: 600 }}>{p.stock}</td>
                      <td>
                        <span className="db-status-badge" style={{ color: sc, background: sc + "18", border: `1px solid ${sc}44` }}>
                          {STATUS_LABEL(p)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="db-action-btn" onClick={() => openEdit(p)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Pencil size={12} /> Edit
                          </button>
                          <button className="db-action-btn db-action-danger" onClick={() => setDeleteTarget(p)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
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

      {/* ── Edit / Create Modal ── */}
      {modal && (
        <div style={{ alignItems: "center", background: "rgba(0,0,0,.5)", bottom: 0, display: "flex", justifyContent: "center", left: 0, padding: 20, position: "fixed", right: 0, top: 0, zIndex: 200 }}>
          <div style={{ background: "var(--panel)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)", maxHeight: "90vh", overflowY: "auto", padding: 32, width: "100%", maxWidth: 520 }}>
            <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{modal === "edit" ? "Edit Product" : "New Product"}</h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div className="field">
                <label>Product Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dell XPS 15 Laptop" required />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief product description…" />
              </div>
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="field">
                  <label>Price (M)</label>
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" type="number" min="0" step="0.01" required />
                </div>
                <div className="field">
                  <label>Stock</label>
                  <input value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" type="number" min="0" required />
                </div>
              </div>
              <div className="field">
                <label>Image URL (optional)</label>
                <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" type="url" />
              </div>
              {modal === "edit" && (
                <label style={{ alignItems: "center", cursor: "pointer", display: "flex", gap: 10, fontSize: 14 }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: "auto" }} />
                  Active (visible to customers)
                </label>
              )}
              {error && <p className="alert alert-error">{error}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : modal === "edit" ? "Save Changes" : "Create Product"}
                </button>
                <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div style={{ alignItems: "center", background: "rgba(0,0,0,.5)", bottom: 0, display: "flex", justifyContent: "center", left: 0, padding: 20, position: "fixed", right: 0, top: 0, zIndex: 300 }}>
          <div style={{ background: "var(--panel)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)", padding: 32, width: "100%", maxWidth: 420, textAlign: "center" }}>
            <div style={{ alignItems: "center", background: "var(--accent-glow)", borderRadius: "50%", display: "inline-flex", height: 56, justifyContent: "center", marginBottom: 16, width: 56 }}>
              <Trash2 size={24} style={{ color: "var(--accent)" }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Delete Product?</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
              <strong style={{ color: "var(--ink)" }}>{deleteTarget.name}</strong> will be permanently removed. This cannot be undone.
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
