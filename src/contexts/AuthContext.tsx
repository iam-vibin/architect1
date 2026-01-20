import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'professional' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<UserRole, User> = {
  user: {
    id: 'user-1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'user',
    avatar: '/placeholder.svg',
  },
  professional: {
    id: 'prof-1',
    name: 'Arun Kumar',
    email: 'arun@archifind.com',
    role: 'professional',
    avatar: '/placeholder.svg',
  },
  admin: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@archifind.com',
    role: 'admin',
    avatar: '/placeholder.svg',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo, any non-empty credentials work
    if (email && password) {
      setUser(mockUsers[role]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
