import { createContext, useContext, useEffect, useState } from "react";

/* ---------- Types ---------- */

export type Role = "user" | "professional" | "admin";

export interface UserAccount {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: Role;
  // Professional-specific fields
  profession?: string;
  avatar?: string;
  portfolio?: string[];
  rating?: number;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export type UserSession = UserAccount;

type AuthContextType = {
  user: UserSession | null;
  login: (userData: UserSession) => void;
  logout: () => void;
  role: Role | null;
  updateSession: (partial: Partial<UserSession>) => void;
};

/* ---------- Context ---------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- Provider ---------- */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  // load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("archifind_user");
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
      localStorage.setItem("archifind_user", JSON.stringify(userData));
    } catch (err) {
      // ignore
    }
  };

  const updateSession = (partial: Partial<UserSession>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem("archifind_user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("archifind_user");
      localStorage.removeItem("archifind_selected_role");
    } catch (err) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        login,
        logout,
        updateSession,
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
