import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexCart Systems",
  description: "Simple e-commerce foundation"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">NexCart</Link>
          <nav>
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/orders">Orders</Link>
            <Link href="/admin/products">Admin</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
