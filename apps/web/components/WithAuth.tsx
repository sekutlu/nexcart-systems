"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/lib/useAuth";

type Props = {
  children: React.ReactNode;
  roles: Role[];
  redirectTo?: string;
};

export function WithAuth({ children, roles, redirectTo = "/login" }: Props) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!ready || !mounted) return;
    if (!user) { router.replace(redirectTo); return; }
    if (!roles.includes(user.role)) {
      if (user.role === "CUSTOMER") router.replace("/products");
      else if (user.role === "DELIVERY_STAFF") router.replace("/delivery");
      else router.replace("/dashboard");
    }
  }, [ready, mounted, user, roles, redirectTo, router]);

  // Always render children on server to avoid hydration mismatch.
  // On client, hide until auth is resolved.
  if (mounted && ready && (!user || !roles.includes(user.role))) return null;

  return <>{children}</>;
}
