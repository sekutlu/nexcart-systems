"use client";

import { WithAuth } from "@/components/WithAuth";

function SettingsContent() {
  return (
    <div className="page-wrap">
      <div className="stack-sm" style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="page-header">
          <h1>System Settings</h1>
          <p>Platform configuration — Super Admin only.</p>
        </div>

        <div className="panel">
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Application Info</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {[
              ["Platform",    "Datamak NexCart"],
              ["Version",     "1.0.0"],
              ["Environment", process.env.NODE_ENV ?? "production"],
              ["API Base",    "/api"],
              ["Database",    "MySQL via Prisma ORM"],
              ["Auth",        "JWT (7-day expiry)"],
            ].map(([k, v]) => (
              <div key={k} style={{ alignItems: "center", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", paddingBottom: 14 }}>
                <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>{k}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Demo Accounts</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              ["Admin",       "admin@nexcart.com",       "Admin@12345",    "#c11d17"],
              ["Super Admin", "superadmin@nexcart.com",  "Super@12345",    "#7c3aed"],
              ["Delivery",    "delivery@nexcart.com",    "Delivery@12345", "#f59e0b"],
              ["Customer",    "customer@nexcart.com",    "Customer@12345", "#3b82f6"],
            ].map(([role, email, pw, color]) => (
              <div key={role} style={{ alignItems: "center", background: "var(--bg2)", borderRadius: "var(--radius-sm)", display: "flex", gap: 12, padding: "12px 16px" }}>
                <span style={{ background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 999, color, fontSize: 11, fontWeight: 700, padding: "2px 10px", flexShrink: 0 }}>{role}</span>
                <span style={{ color: "var(--muted)", fontSize: 13, flex: 1 }}>{email}</span>
                <code style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, padding: "2px 8px" }}>{pw}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <WithAuth roles={["SUPER_ADMIN"]}>
      <SettingsContent />
    </WithAuth>
  );
}
