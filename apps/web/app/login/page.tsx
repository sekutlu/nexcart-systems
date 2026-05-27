"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:    String(form.get("email")).trim(),
          password: String(form.get("password")),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Invalid credentials"); return; }

      login({ ...data.user, token: data.token });

      const role = data.user.role;
      if (role === "SUPER_ADMIN" || role === "ADMIN") router.push("/dashboard");
      else if (role === "DELIVERY_STAFF") router.push("/delivery");
      else router.push("/products");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap">
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{
              alignItems: "center", background: "var(--accent)", borderRadius: 14,
              color: "#fff", display: "inline-flex", fontSize: 22, fontWeight: 900,
              height: 52, justifyContent: "center", marginBottom: 16, width: 52,
            }}>D</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Welcome back</h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Sign in to your NexCart account</p>
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" placeholder="you@example.com" type="email" required autoComplete="email" />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password" name="password"
                    placeholder="••••••••"
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      background: "none", border: "none", color: "var(--muted)", cursor: "pointer",
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p className="alert alert-error">{error}</p>}

              <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 4 }}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 20, textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
