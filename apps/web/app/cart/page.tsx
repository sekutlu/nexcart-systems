"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, Package, ArrowRight } from "lucide-react";
import { getStoredUser } from "@/lib/useAuth";

type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    category: string;
  };
};

const HOSTING_CATEGORY = "Web Hosting";

function ItemImage({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <Package size={32} strokeWidth={1.2} style={{ color: "var(--accent)", opacity: 0.4 }} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} onError={() => setFailed(true)}
      style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
  );
}

export default function CartPage() {
  const [items, setItems]     = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const user  = getStoredUser();
  const token = user?.token;
  const authH = { Authorization: `Bearer ${token}` };

  const load = () => {
    if (!token) { setLoading(false); return; }
    fetch("/api/cart", { headers: authH })
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateQty = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(productId);
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { ...authH, "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    await load();
    setUpdating(null);
  };

  const removeItem = async (productId: string) => {
    setUpdating(productId);
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { ...authH, "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems(prev => prev.filter(i => i.productId !== productId));
    setUpdating(null);
  };

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (!token) {
    return (
      <div className="page-wrap">
        <div className="empty" style={{ paddingTop: 80 }}>
          <ShoppingCart size={48} strokeWidth={1} style={{ opacity: 0.25 }} />
          <h3>Sign in to view your cart</h3>
          <p>You need to be logged in to add items and checkout.</p>
          <Link href="/login" className="btn btn-primary" style={{ marginTop: 8 }}>Sign in</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="empty"><p>Loading cart…</p></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-wrap">
        <div className="stack-sm">
          <div className="page-header">
            <h1>Your Cart</h1>
            <p>Review your items before checkout.</p>
          </div>
          <div className="panel">
            <div className="empty">
              <ShoppingCart size={48} strokeWidth={1} style={{ opacity: 0.25 }} />
              <h3>Your cart is empty</h3>
              <p>Looks like you haven&apos;t added anything yet.</p>
              <Link href="/products" className="btn btn-primary" style={{ marginTop: 8 }}>Browse Products</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="stack-sm">
        <div className="page-header">
          <h1>Your Cart</h1>
          <p>{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</p>
        </div>

        <div className="cart-layout" style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
          {/* ── Items ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map(item => {
              const busy = updating === item.productId;
              const lineTotal = item.product.price * item.quantity;
              const isHosting = item.product.category === HOSTING_CATEGORY;
              return (
                <div key={item.id} className="panel" style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 20px", opacity: busy ? 0.6 : 1, transition: "opacity 0.2s" }}>
                  {/* Image */}
                  <div style={{ alignItems: "center", background: "var(--bg2)", borderRadius: "var(--radius-sm)", display: "flex", flexShrink: 0, height: 72, justifyContent: "center", overflow: "hidden", width: 72 }}>
                    <ItemImage src={item.product.imageUrl} alt={item.product.name} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {item.product.category && (
                      <span style={{ color: "var(--accent)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{item.product.category}</span>
                    )}
                    <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>M {item.product.price.toLocaleString()} each</div>
                  </div>

                  {/* Qty controls */}
                  <div style={{ alignItems: "center", display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      disabled={busy || item.quantity <= 1}
                      className="btn-icon"
                      style={{ height: 32, width: 32 }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: 15, minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      disabled={busy || (!isHosting && item.quantity >= item.product.stock)}
                      className="btn-icon"
                      style={{ height: 32, width: 32 }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Line total */}
                  <div style={{ fontWeight: 900, fontSize: 16, minWidth: 90, textAlign: "right", flexShrink: 0 }}>
                    M {lineTotal.toLocaleString()}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    disabled={busy}
                    className="btn-icon"
                    style={{ color: "var(--accent)", borderColor: "transparent", flexShrink: 0 }}
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Summary ── */}
          <div className="panel" style={{ position: "sticky", top: 88 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Order Summary</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {items.map(item => (
                <div key={item.id} style={{ alignItems: "center", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                    {item.product.name} <span style={{ color: "var(--muted)" }}>×{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600, flexShrink: 0 }}>M {(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, marginBottom: 20 }}>
              <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ color: "var(--accent)", fontSize: 22, fontWeight: 900 }}>M {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <Link href="/orders" className="btn btn-primary btn-full" style={{ gap: 8 }}>
              Proceed to Checkout <ArrowRight size={15} />
            </Link>
            <Link href="/products" className="btn btn-ghost btn-full" style={{ marginTop: 10 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
