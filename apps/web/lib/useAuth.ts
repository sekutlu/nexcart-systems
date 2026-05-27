"use client";

import { useState, useEffect, useCallback } from "react";

export type Role = "CUSTOMER" | "ADMIN" | "DELIVERY_STAFF" | "SUPER_ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
};

const KEY = "NEXCART_USER";

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(KEY);
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setReady(true);
  }, []);

  const login = useCallback((user: AuthUser) => {
    storeUser(user);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    clearUser();
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles: Role[]) => {
    return !!user && roles.includes(user.role);
  }, [user]);

  return { user, ready, login, logout, hasRole };
}
