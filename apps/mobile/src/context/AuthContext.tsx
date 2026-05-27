import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";
const KEY = "NEXCART_USER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
};

type AuthCtx = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => { if (raw) setUser(JSON.parse(raw)); })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Invalid credentials");
    const u: AuthUser = { ...data.user, token: data.token };
    await AsyncStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Registration failed");
    const u: AuthUser = { ...data.user, token: data.token };
    await AsyncStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
