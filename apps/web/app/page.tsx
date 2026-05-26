import Link from "next/link";

export default function HomePage() {
  return (
    <section className="stack">
      <div>
        <h1>NexCart Commerce Foundation</h1>
        <p className="muted">A clean starter for web, mobile, REST APIs, Prisma, MySQL, and JWT auth.</p>
      </div>
      <div className="grid">
        <Link className="card" href="/products">
          <h2>Shop Products</h2>
          <p className="muted">Browse the product catalog from the shared API.</p>
        </Link>
        <Link className="card" href="/cart">
          <h2>Cart</h2>
          <p className="muted">Authenticated cart endpoint and page shell.</p>
        </Link>
        <Link className="card" href="/admin/products">
          <h2>Admin Products</h2>
          <p className="muted">Admin-only product creation endpoint and UI shell.</p>
        </Link>
      </div>
    </section>
  );
}
