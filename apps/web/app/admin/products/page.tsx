"use client";

import { ApiClient } from "@nexcart/shared";
import { FormEvent, useState } from "react";

const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL ?? "/api");

export default function AdminProductsPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const token = localStorage.getItem("nexcart_token");

    if (!token) {
      setMessage("Sign in as an admin first.");
      return;
    }

    try {
      await api.request("/admin/products", {
        token,
        body: {
          name: String(form.get("name")),
          description: String(form.get("description")),
          price: Number(form.get("price")),
          stock: Number(form.get("stock"))
        }
      });
      event.currentTarget.reset();
      setMessage("Product created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create product");
    }
  }

  return (
    <section className="panel">
      <h1>Admin Products</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Product name" />
        <textarea name="description" placeholder="Description" />
        <input name="price" placeholder="Price" type="number" />
        <input name="stock" placeholder="Stock" type="number" />
        <button type="submit">Create product</button>
      </form>
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}
