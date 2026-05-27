"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, ShieldCheck, Package, LogOut } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

export default function ProfilePage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && ready && !user) router.replace("/login");
  }, [mounted, ready, user, router]);

  if (!mounted || !ready || !user) return null;

  const ROLE_COLOR: Record<string, string> = {
    CUSTOMER:       "#3b82f6",
    ADMIN:          "var(--accent)",
    DELIVERY_STAFF: "#f59e0b",
    SUPER_ADMIN:    "#7c3aed",
  };
  const color = ROLE_COLOR[user.role] ?? "var(--muted)";

  return (
    <div className="page-wrap">
      <div className="stack-sm" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Your account details and settings.</p>
        </div>

        {/* Avatar card */}
        <div className="panel" style={{ textAlign: "center", padding: "40px 32px" }}>
          <div style={{
            alignItems: "center", background: "var(--accent)", borderRadius: "50%",
            color: "#fff", display: "inline-flex", fontSize: 36, fontWeight: 900,
            height: 80, justifyContent: "center", marginBottom: 16, width: 80,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{user.name}</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{user.email}</p>
          <span style={{
            background: `${color}18`, border: `1px solid ${color}40`,
            borderRadius: 999, color, display: "inline-block",
            fontSize: 12, fontWeight: 700, marginTop: 12, padding: "4px 14px",
          }}>
            {user.role.replace("_", " ")}
          </span>
        </div>

        {/* Details */}
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          {[
            { Icon: User,        label: "Full Name",  value: user.name  },
            { Icon: Mail,        label: "Email",      value: user.email },
            { Icon: ShieldCheck, label: "Role",       value: user.role.replace("_", " ") },
            { Icon: Package,     label: "Account ID", value: user.id.slice(0, 20) + "…" },
          ].map(({ Icon, label, value }, i) => (
            <div key={label} style={{
              alignItems: "center", borderBottom: i < 3 ? "1px solid var(--line)" : undefined,
              display: "flex", gap: 16, padding: "16px 24px",
            }}>
              <span style={{ color: "var(--accent)", flexShrink: 0 }}><Icon size={18} strokeWidth={1.8} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/orders" className="btn btn-ghost" style={{ flex: 1 }}>
            <Package size={15} /> My Orders
          </Link>
          <button
            className="btn btn-primary"
            style={{ flex: 1, background: "var(--accent)" }}
            onClick={() => { logout(); router.push("/login"); }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
