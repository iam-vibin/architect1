import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken, api } from "@/lib/api";

/* ---------- Types ---------- */

export type Role = "user" | "professional" | "admin";

export type UserSession = {
  id: string;
  username: string;
  fullName?: string;
  name?: string;
  role: Role;
  email?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  bio?: string;
  savedProfessionals?: string[];
  status?: string;
};

type AuthContextType = {
  user: UserSession | null;
  token: string | null;
  role: Role | null;
  login: (userData: any, tokenString?: string) => void;
  logout: () => void;
  updateUser: (data: Partial<UserSession>) => void;
  refreshUser: () => Promise<void>;
};

/* ---------- Context ---------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- Provider ---------- */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("archifind_user");
      const storedToken = localStorage.getItem("archifind_token");
      if (raw) {
        const parsed = JSON.parse(raw) as UserSession;
        setUser(parsed);
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const login = (userData: any, tokenString?: string) => {
    const safeUser: UserSession = {
      id: userData.id || userData.userId,
      username: userData.username,
      fullName: userData.fullName || userData.name || userData.username,
      name: userData.fullName || userData.name || userData.username,
      role: userData.role,
      email: userData.email,
      phone: userData.phone,
      location: userData.location,
      avatar: userData.avatar,
      bio: userData.bio,
      savedProfessionals: userData.savedProfessionals || [],
      status: userData.status || "active",
    };

    setUser(safeUser);
    const finalToken = tokenString || userData.token || "";
    if (finalToken) {
      setToken(finalToken);
      setAuthToken(finalToken);
    }

    try {
      localStorage.setItem("archifind_user", JSON.stringify(safeUser));
      localStorage.setItem("archifind_selected_role", safeUser.role);
    } catch (err) {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    try {
      localStorage.removeItem("archifind_user");
      localStorage.removeItem("archifind_token");
      localStorage.removeItem("archifind_selected_role");
    } catch (err) {}
  };

  const updateUser = (data: Partial<UserSession>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    try {
      localStorage.setItem("archifind_user", JSON.stringify(updated));
    } catch (err) {}
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      if (res && res.success && res.user) {
        login(res.user);
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        login,
        logout,
        updateUser,
        refreshUser,
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
