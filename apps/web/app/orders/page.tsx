"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, ShoppingCart, CreditCard, CheckCircle2,
  Clock, Truck, XCircle, ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react";
import { getStoredUser } from "@/lib/useAuth";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; imageUrl: string | null };
  service?: {
    type: "HOSTING_SERVICE";
    status: string;
    accountId: string;
    activatedAt: string;
    renewalAt: string;
  } | null;
};

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType; step: number }> = {
  PENDING:   { label: "Pending",    color: "#667085",        Icon: Clock,         step: 0 },
  PAID:      { label: "Paid",       color: "#3b82f6",        Icon: CreditCard,    step: 1 },
  SHIPPED:   { label: "Shipped",    color: "#f59e0b",        Icon: Truck,         step: 2 },
  DELIVERED: { label: "Delivered",  color: "var(--teal)",    Icon: CheckCircle2,  step: 3 },
  CANCELLED: { label: "Cancelled",  color: "var(--accent)",  Icon: XCircle,       step: -1 },
};

const TRACKING_STEPS = ["Order Placed", "Payment Confirmed", "Shipped", "Delivered"];

function TrackingBar({ status }: { status: string }) {
  const step = STATUS_CONFIG[status]?.step ?? 0;
  if (status === "CANCELLED") {
    return (
      <div style={{ alignItems: "center", color: "var(--accent)", display: "flex", fontSize: 13, fontWeight: 600, gap: 6 }}>
        <XCircle size={14} /> Order Cancelled
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 12 }}>
      {TRACKING_STEPS.map((label, i) => {
        const done    = i <= step;
        const current = i === step;
        return (
          <div key={label} style={{ alignItems: "center", display: "flex", flex: i < TRACKING_STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{
                alignItems: "center", background: done ? "var(--teal)" : "var(--bg2)",
                border: `2px solid ${done ? "var(--teal)" : "var(--line)"}`,
                borderRadius: "50%", display: "flex", height: 28, justifyContent: "center",
                transition: "all 0.3s", width: 28,
                boxShadow: current ? "0 0 0 4px rgba(0,124,137,.15)" : undefined,
              }}>
                {done
                  ? <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
                  : <div style={{ background: "var(--line)", borderRadius: "50%", height: 8, width: 8 }} />}
              </div>
              <span style={{ color: done ? "var(--ink)" : "var(--muted)", fontSize: 11, fontWeight: done ? 700 : 500, whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < TRACKING_STEPS.length - 1 && (
              <div style={{ background: i < step ? "var(--teal)" : "var(--line)", flex: 1, height: 2, marginBottom: 18, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const { Icon } = cfg;

  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{ alignItems: "center", cursor: "pointer", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", padding: "16px 20px" }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ background: cfg.color + "18", border: `1px solid ${cfg.color}33`, borderRadius: "var(--radius-sm)", color: cfg.color, fontFamily: "monospace", fontSize: 12, fontWeight: 700, padding: "3px 10px" }}>
            #{order.id.slice(-8).toUpperCase()}
          </span>
          <span className="db-status-badge" style={{ color: cfg.color, background: cfg.color + "18", border: `1px solid ${cfg.color}44`, display: "flex", alignItems: "center", gap: 5 }}>
            <Icon size={12} strokeWidth={2.5} /> {cfg.label}
          </span>
        </div>
        <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 16 }}>M {order.total.toLocaleString()}</span>
          {expanded ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--line)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tracking */}
          <TrackingBar status={order.status} />

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {order.items.map(item => (
              <div key={item.id} style={{ alignItems: "center", display: "flex", gap: 12, justifyContent: "space-between" }}>
                <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
                  <div style={{ alignItems: "center", background: "var(--bg2)", borderRadius: "var(--radius-sm)", display: "flex", height: 40, justifyContent: "center", width: 40 }}>
                    <Package size={18} strokeWidth={1.2} style={{ color: "var(--accent)", opacity: 0.5 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.product.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>Qty: {item.quantity} × M {item.price.toLocaleString()}</div>
                    {item.service && (
                      <div style={{ color: "var(--teal)", fontSize: 12, fontWeight: 600 }}>
                        Hosting active · Renewal {new Date(item.service.renewalAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
                  </div>
                </div>
                <span style={{ fontWeight: 700 }}>M {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end", paddingTop: 12 }}>
            <span style={{ color: "var(--muted)", fontSize: 13, marginRight: 8 }}>Order Total:</span>
            <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 18 }}>M {order.total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Simulated Payment Modal ────────────────────────────────────────────────────
function PaymentModal({ total, onSuccess, onClose }: { total: number; onSuccess: () => void; onClose: () => void }) {
  const [step, setStep]       = useState<"form" | "processing" | "success" | "failed">("form");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvv, setCvv]         = useState("");
  const [name, setName]       = useState("");

  const formatCard   = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  const handlePay = () => {
    if (!name || cardNum.replace(/\s/g,"").length < 16 || expiry.length < 5 || cvv.length < 3) return;
    setStep("processing");
    setTimeout(() => {
      // Fail only on known test decline number
      const declined = cardNum.replace(/\s/g,"") === "4000000000000002";
      setStep(declined ? "failed" : "success");
    }, 1800);
  };

  return (
    <div style={{ alignItems: "center", background: "rgba(0,0,0,.55)", bottom: 0, display: "flex", justifyContent: "center", left: 0, padding: 20, position: "fixed", right: 0, top: 0, zIndex: 300 }}>
      <div style={{ background: "var(--panel)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)", maxWidth: 440, padding: 32, width: "100%" }}>

        {step === "form" && (
          <>
            <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>Simulated Payment</h2>
                <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>Amount: <strong style={{ color: "var(--accent)" }}>M {total.toLocaleString()}</strong></p>
              </div>
              <CreditCard size={28} style={{ color: "var(--accent)" }} />
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div className="field">
                <label>Cardholder Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="field">
                <label>Card Number</label>
                <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} />
              </div>
              <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
                <div className="field">
                  <label>Expiry</label>
                  <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="field">
                  <label>CVV</label>
                  <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="123" maxLength={4} />
                </div>
              </div>
              <div style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", color: "var(--muted)", fontSize: 12, padding: "10px 14px" }}>
                Simulated payment — any card details work. Use <strong>4000 0000 0000 0002</strong> to test a decline.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary btn-full" onClick={handlePay} style={{ gap: 6 }}>
                  <CreditCard size={14} /> Pay M {total.toLocaleString()}
                </button>
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              </div>
            </div>
          </>
        )}

        {step === "processing" && (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <div style={{ animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 16 }}>
              <CreditCard size={40} style={{ color: "var(--accent)" }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Processing payment…</h3>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>Please wait</p>
          </div>
        )}

        {step === "success" && (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <CheckCircle2 size={52} style={{ color: "var(--teal)", marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Payment Successful!</h3>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>Your order has been placed and payment confirmed.</p>
            <button className="btn btn-primary btn-full" onClick={onSuccess}>View My Orders <ArrowRight size={14} /></button>
          </div>
        )}

        {step === "failed" && (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <XCircle size={52} style={{ color: "var(--accent)", marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Payment Failed</h3>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>Your card was declined. Please try again.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary btn-full" onClick={() => setStep("form")}>Try Again</button>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [showPayment, setShowPayment]   = useState(false);
  const [error, setError]           = useState("");

  const user  = getStoredUser();
  const token = user?.token;
  const authH = { Authorization: `Bearer ${token}` };

  const load = () => {
    if (!token) { setLoading(false); return; }
    fetch("/api/orders", { headers: authH })
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCheckout = async () => {
    setError("");
    setCheckingOut(true);
    try {
      const res  = await fetch("/api/orders", { method: "POST", headers: { ...authH, "Content-Type": "application/json" } });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Checkout failed."); return; }
      setPaymentTotal(data.total);
      setShowPayment(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    load();
  };

  if (!token) {
    return (
      <div className="page-wrap">
        <div className="empty" style={{ paddingTop: 80 }}>
          <Package size={48} strokeWidth={1} style={{ opacity: 0.25 }} />
          <h3>Sign in to view your orders</h3>
          <Link href="/login" className="btn btn-primary" style={{ marginTop: 8 }}>Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="stack-sm">
        <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>My Orders</h1>
            <p>Track and manage your order history.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <button className="btn btn-primary" onClick={handleCheckout} disabled={checkingOut} style={{ gap: 6 }}>
              <ShoppingCart size={14} /> {checkingOut ? "Creating order…" : "Checkout Cart"}
            </button>
            {error && <p className="alert alert-error" style={{ margin: 0, fontSize: 13 }}>{error}</p>}
          </div>
        </div>

        {loading ? (
          <div className="empty"><p>Loading orders…</p></div>
        ) : orders.length === 0 ? (
          <div className="panel">
            <div className="empty">
              <Package size={48} strokeWidth={1} style={{ opacity: 0.25 }} />
              <h3>No orders yet</h3>
              <p>Add items to your cart and checkout to place your first order.</p>
              <Link href="/products" className="btn btn-primary" style={{ marginTop: 8 }}>Browse Products</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentModal
          total={paymentTotal}
          onSuccess={handlePaymentSuccess}
          onClose={() => { setShowPayment(false); load(); }}
        />
      )}
    </div>
  );
}
