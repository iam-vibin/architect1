import { createContext, useContext, useState } from "react";

/* ---------- Types ---------- */

export type Role = "user" | "professional" | "admin";

export type UserSession = {
  id: string; // UUID
  role: Role;
};

type AuthContextType = {
  user: UserSession | null;
  loginAsUser: () => void;
  loginAsProfessional: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
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

  const loginAsUser = () =>
    setUser({ id: USER_ID, role: "user" });

  const loginAsProfessional = () =>
    setUser({ id: PROFESSIONAL_ID, role: "professional" });

  const loginAsAdmin = () =>
    setUser({ id: ADMIN_ID, role: "admin" });

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsUser,
        loginAsProfessional,
        loginAsAdmin,
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
