"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { AuthResponse, User } from "@/types/domain";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "sentinel-red-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setReady(true);
      return;
    }
    setToken(stored);
    api
      .me(stored)
      .then(setUser)
      .catch(() => window.localStorage.removeItem(TOKEN_KEY))
      .finally(() => setReady(true));
  }, []);

  function persist(auth: AuthResponse) {
    setToken(auth.access_token);
    setUser(auth.user);
    window.localStorage.setItem(TOKEN_KEY, auth.access_token);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      login: async (email, password) => persist(await api.login({ email, password })),
      signup: async (name, email, password) => persist(await api.signup({ name, email, password })),
      logout: () => {
        setToken(null);
        setUser(null);
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }),
    [ready, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
