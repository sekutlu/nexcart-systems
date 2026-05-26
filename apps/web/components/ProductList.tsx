"use client";

import { ApiClient, Product } from "@nexcart/shared";
import { useEffect, useState } from "react";

const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL ?? "/api");

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.products().then(setProducts).catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="muted">{error}</p>;
  }

  return (
    <div className="grid">
      {products.map((product) => (
        <article className="card" key={product.id}>
          <h3>{product.name}</h3>
          <p className="muted">{product.description}</p>
          <strong>${product.price.toFixed(2)}</strong>
        </article>
      ))}
    </div>
  );
}
