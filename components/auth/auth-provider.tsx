"use client";

import { createContext, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User, LoginCredentials } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => void;
  refreshSession: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  // Auto-refresh session periodically
  useEffect(() => {
    if (auth.isAuthenticated) {
      const interval = setInterval(() => {
        auth.refreshSession();
      }, 30 * 60 * 1000); // Refresh every 30 minutes

      return () => clearInterval(interval);
    }
  }, [auth.isAuthenticated, auth.refreshSession]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
