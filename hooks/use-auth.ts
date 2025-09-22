"use client";

import { useState, useEffect, useCallback } from "react";
import { User, LoginCredentials, AuthSession, AuthState } from "@/types";
import { AuthService } from "@/services/auth-service";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    const session = AuthService.getSession();
    setState({
      isAuthenticated: session !== null,
      user: session?.user || null,
      isLoading: false,
      error: null,
    });
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const session = await AuthService.login(credentials);
      setState({
        isAuthenticated: true,
        user: session.user,
        isLoading: false,
        error: null,
      });
      return session;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    AuthService.logout();
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
  }, []);

  // Refresh session
  const refreshSession = useCallback(() => {
    const session = AuthService.refreshSession();
    if (session) {
      setState((prev) => ({
        ...prev,
        user: session.user,
      }));
    } else {
      logout();
    }
  }, [logout]);

  // Change password
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!state.user) {
        throw new Error("User not authenticated");
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await AuthService.changePassword(
          state.user.id,
          currentPassword,
          newPassword
        );
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Password change failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [state.user]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    refreshSession,
    changePassword,
    clearError,
  };
}
