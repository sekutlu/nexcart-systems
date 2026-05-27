import { ProductList } from "@/components/ProductList";

export default function ProductsPage() {
  return (
    <div className="page-wrap">
      <div className="stack-sm">
        <div className="page-header">
          <h1>Shop — Datamak Technologies</h1>
          <p>Computers, ICT products, networking gear &amp; web hosting services.</p>
        </div>
        <ProductList />
      </div>
    </div>
  );
}
