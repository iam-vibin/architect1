import { createContext, useContext, useEffect, useState } from "react";

/* ---------- Types ---------- */

export type Role = "user" | "professional" | "admin";

export type UserSession = {
  id: string; // UUID
  username: string;
  name?: string;
  role: Role;
};

type AuthContextType = {
  user: UserSession | null;
  login: (userData: UserSession) => void;
  logout: () => void;
  role: Role | null;
};

/* ---------- Fake UUIDs (PoC-safe) ---------- */

const USER_ID = "11111111-1111-1111-1111-111111111111";
const PROFESSIONAL_ID = "22222222-2222-2222-2222-222222222222";
const ADMIN_ID = "33333333-3333-3333-3333-333333333333";

/* ---------- Context ---------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- Provider ---------- */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  // load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('archifind_user');
      if (raw) {
        const parsed = JSON.parse(raw) as UserSession;
        setUser(parsed);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
    try {
      localStorage.setItem('archifind_user', JSON.stringify(userData));
    } catch (err) {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('archifind_user');
      localStorage.removeItem('archifind_selected_role');
    } catch (err) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------- Hook ---------- */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
