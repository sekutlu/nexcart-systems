"use client";

import { ApiClient } from "@nexcart/shared";
import { FormEvent, useState } from "react";

const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL ?? "/api");

export default function LoginPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const result = await api.login(String(form.get("email")), String(form.get("password")));
      localStorage.setItem("nexcart_token", result.token);
      setMessage(`Signed in as ${result.user.name}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in");
    }
  }

  return (
    <section className="panel">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" type="email" />
        <input name="password" placeholder="Password" type="password" />
        <button type="submit">Sign in</button>
      </form>
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}
