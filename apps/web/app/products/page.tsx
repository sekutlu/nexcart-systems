import { ProductList } from "@/components/ProductList";

export default function ProductsPage() {
  return (
    <section className="stack">
      <div>
        <h1>Products</h1>
        <p className="muted">Public catalog backed by the shared REST API.</p>
      </div>
      <ProductList />
    </section>
  );
}
