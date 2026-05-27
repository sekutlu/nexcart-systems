"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

export default function RegisterPage() {
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const rules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains a number",     ok: /\d/.test(password)   },
    { label: "Contains a letter",     ok: /[a-zA-Z]/.test(password) },
  ];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form    = new FormData(e.currentTarget);
    const name    = String(form.get("name")).trim();
    const email   = String(form.get("email")).trim();
    const pw      = String(form.get("password"));
    const confirm = String(form.get("confirm"));

    if (pw !== confirm) { setError("Passwords do not match"); return; }
    if (pw.length < 8)  { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); return; }
      login({ ...data.user, token: data.token });
      router.push("/products");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap">
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
        <div style={{ width: "100%", maxWidth: 460 }}>

          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{
              alignItems: "center", background: "var(--accent)", borderRadius: 14,
              color: "#fff", display: "inline-flex", fontSize: 22, fontWeight: 900,
              height: 52, justifyContent: "center", marginBottom: 16, width: 52,
            }}>D</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Create your account</h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Join Datamak NexCart — it&apos;s free</p>
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" placeholder="John Doe" type="text" required autoComplete="name" />
              </div>

              <div className="field">
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" placeholder="you@example.com" type="email" required autoComplete="email" />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password" name="password"
                    placeholder="Min. 8 characters"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                {password.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                    {rules.map((r) => (
                      <div key={r.label} style={{ alignItems: "center", color: r.ok ? "var(--teal)" : "var(--muted)", display: "flex", fontSize: 12, gap: 6 }}>
                        {r.ok ? <CheckCircle2 size={13} strokeWidth={2.5} /> : <XCircle size={13} strokeWidth={2} />}
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input id="confirm" name="confirm" placeholder="Repeat password" type="password" required />
              </div>

              {error && <p className="alert alert-error">{error}</p>}

              <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 4 }}>
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 20, textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>

          <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 20, textAlign: "center" }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
