"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ClipboardList, Users,
  Store, Settings, LogOut, Menu, X,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",          Icon: LayoutDashboard, label: "Overview"   },
  { href: "/dashboard/products", Icon: Package,         label: "Products"   },
  { href: "/dashboard/orders",   Icon: ClipboardList,   label: "Orders"     },
  { href: "/dashboard/users",    Icon: Users,           label: "Users"      },
  { href: "/dashboard/inventory", Icon: Store, label: "Inventory" },
];

export default function DashboardSidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="db-burger" onClick={() => setOpen(v => !v)} aria-label="Toggle sidebar">
        <Menu size={18} /> <span>Menu</span>
      </button>

      {open && <div className="db-overlay" onClick={() => setOpen(false)} />}

      <aside className={`db-sidebar${open ? " db-sidebar-open" : ""}`}>
        <div className="db-sidebar-brand">
          <span className="db-sidebar-logo">D</span>
          <span>Dashboard</span>
        </div>

        <nav className="db-nav">
          <p className="db-nav-label">Main</p>
          {NAV.map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`db-nav-item${path === href ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="db-nav-icon"><Icon size={16} strokeWidth={2} /></span>
              {label}
            </Link>
          ))}

          <p className="db-nav-label" style={{ marginTop: 24 }}>Settings</p>
          <Link
            href="/dashboard/inventory"
            className={`db-nav-item${path === "/dashboard/inventory" ? " active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <span className="db-nav-icon"><Settings size={16} strokeWidth={2} /></span>
            Inventory
          </Link>
          <Link href="/login" className="db-nav-item" onClick={() => setOpen(false)}>
            <span className="db-nav-icon"><LogOut size={16} strokeWidth={2} /></span>
            Sign out
          </Link>
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-avatar">A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Admin User</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>admin@datamak.co.ls</div>
          </div>
        </div>
      </aside>
    </>
  );
}
