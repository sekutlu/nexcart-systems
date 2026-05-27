"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home, ShoppingBag, ShoppingCart, Package, LayoutDashboard,
  Truck, Settings, Users, BarChart2, LogOut, User, LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";

// ── Per-role nav definitions ──────────────────────────────────────────────────

const CUSTOMER_NAV = [
  { href: "/",          label: "Home"       },
  { href: "/products",  label: "Shop"       },
  { href: "/cart",      label: "Cart"       },
  { href: "/orders",    label: "My Orders"  },
  { href: "/profile",   label: "Profile"    },
];

const ADMIN_NAV = [
  { href: "/dashboard",          label: "Dashboard"    },
  { href: "/dashboard/products", label: "Products"     },
  { href: "/dashboard/orders",   label: "Orders"       },
  { href: "/dashboard/users",    label: "Users"        },
  { href: "/dashboard/inventory",     label: "Inventory"    },
];

const DELIVERY_NAV = [
  { href: "/delivery", label: "Delivery Orders" },
  { href: "/profile",  label: "Profile"         },
];

const SUPER_ADMIN_NAV = [
  { href: "/dashboard",          label: "Dashboard"    },
  { href: "/dashboard/users",    label: "Users"        },
  { href: "/dashboard/products", label: "Products"     },
  { href: "/dashboard/orders",   label: "Orders"       },
  { href: "/dashboard/inventory",     label: "Inventory"    },
  { href: "/settings",           label: "Settings"     },
];

// ── Bottom tab definitions ────────────────────────────────────────────────────

const CUSTOMER_TABS = [
  { href: "/",         label: "Home",      Icon: Home          },
  { href: "/products", label: "Shop",      Icon: ShoppingBag   },
  { href: "/cart",     label: "Cart",      Icon: ShoppingCart  },
  { href: "/orders",   label: "Orders",    Icon: Package       },
  { href: "/profile",  label: "Profile",   Icon: User          },
];

const ADMIN_TABS = [
  { href: "/dashboard",          label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products",  Icon: ShoppingBag     },
  { href: "/dashboard/orders",   label: "Orders",    Icon: Package         },
  { href: "/dashboard/users",    label: "Users",     Icon: Users           },
  { href: "/dashboard/inventory",     label: "Inventory", Icon: BarChart2       },
];

const DELIVERY_TABS = [
  { href: "/delivery", label: "Orders",  Icon: Truck },
  { href: "/profile",  label: "Profile", Icon: User  },
];

const SUPER_ADMIN_TABS = [
  { href: "/dashboard",          label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/users",    label: "Users",     Icon: Users           },
  { href: "/dashboard/orders",   label: "Orders",    Icon: Package         },
  { href: "/dashboard/inventory",     label: "Inventory", Icon: BarChart2       },
  { href: "/settings",           label: "Settings",  Icon: Settings        },
];

// ── Role badge colours ────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  CUSTOMER:       { label: "Customer",       color: "var(--teal)"   },
  ADMIN:          { label: "Admin",          color: "var(--accent)" },
  DELIVERY_STAFF: { label: "Delivery",       color: "#f59e0b"       },
  SUPER_ADMIN:    { label: "Super Admin",    color: "#7c3aed"       },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NavBar() {
  const path = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const isActive = (href: string) => href === "/" ? path === "/" : path.startsWith(href);

  const navLinks = !user ? CUSTOMER_NAV.slice(0, 2)
    : user.role === "SUPER_ADMIN"    ? SUPER_ADMIN_NAV
    : user.role === "ADMIN"          ? ADMIN_NAV
    : user.role === "DELIVERY_STAFF" ? DELIVERY_NAV
    : CUSTOMER_NAV;

  const tabs = !user ? CUSTOMER_TABS.slice(0, 3)
    : user.role === "SUPER_ADMIN"    ? SUPER_ADMIN_TABS
    : user.role === "ADMIN"          ? ADMIN_TABS
    : user.role === "DELIVERY_STAFF" ? DELIVERY_TABS
    : CUSTOMER_TABS;

  const badge = user ? ROLE_BADGE[user.role] : null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!ready || !mounted) {
    // Render a stable shell on both server and client pre-hydration
    return (
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-logo">D</span>
          <span className="brand-text">Datamak <span>NexCart</span></span>
        </Link>
      </header>
    );
  }

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-logo">D</span>
          <span className="brand-text">Datamak <span>NexCart</span></span>
        </Link>

        <nav className="nav-desktop">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={isActive(href) ? { color: "var(--accent)", fontWeight: 700 } : undefined}
            >
              {label}
            </Link>
          ))}

          {/* Cart only for customers */}
          {(!user || user.role === "CUSTOMER") && (
            <Link href="/cart" className="nav-cart">
              <ShoppingCart size={15} strokeWidth={2.5} /> Cart
            </Link>
          )}

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8 }}>
              {badge && (
                <span style={{
                  background: `${badge.color}18`,
                  border: `1px solid ${badge.color}40`,
                  borderRadius: 999,
                  color: badge.color,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                }}>
                  {badge.label}
                </span>
              )}
              <span style={{ color: "var(--ink-soft)", fontSize: 13, fontWeight: 500 }}>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  alignItems: "center", background: "var(--bg2)", border: "1px solid var(--line)",
                  borderRadius: "var(--radius-sm)", color: "var(--ink-soft)", cursor: "pointer",
                  display: "flex", font: "inherit", fontSize: 13, fontWeight: 600, gap: 6, padding: "7px 14px",
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="nav-cta">
              <LogIn size={14} strokeWidth={2.5} style={{ marginRight: 4 }} />
              Sign in
            </Link>
          )}
        </nav>
      </header>

      {/* Bottom tab bar */}
      <nav className="bottom-tabs">
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className={`bottom-tab${active ? " active" : ""}`}>
              <span className="bottom-tab-icon">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              </span>
              <span className="bottom-tab-label">{label}</span>
              {active && <span className="bottom-tab-dot" />}
            </Link>
          );
        })}
        {user && (
          <button
            onClick={handleLogout}
            className="bottom-tab"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <span className="bottom-tab-icon"><LogOut size={22} strokeWidth={1.8} /></span>
            <span className="bottom-tab-label">Logout</span>
          </button>
        )}
      </nav>
    </>
  );
}
