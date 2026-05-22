import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';
import type { User, AuthError } from '@supabase/supabase-js';

/**
 * Custom hook for authentication operations
 * Handles login, registration, OTP verification, password reset, and logout
 */
export const useAuth = () => {
  const { setUser, setSession, setLoading, logout: clearAuthState } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle authentication errors
   */
  const handleError = useCallback((err: AuthError | Error | null) => {
    if (!err) {
      setError(null);
      return;
    }

    const errorMessage =
      err instanceof Error
        ? err.message
        : err.message || 'An unexpected error occurred';
    setError(errorMessage);
  }, []);

  /**
   * Register a new user with email and password
   */
  const register = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: registerError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (registerError) {
          handleError(registerError);
          return { success: false, data: null };
        }

        if (data.user) {
          setUser(data.user);
          setSession(data.session);
        }

        return { success: true, data };
      } catch (err) {
        handleError(err as Error);
        return { success: false, data: null };
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setSession, handleError]
  );

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          handleError(loginError);
          return { success: false, data: null };
        }

        if (data.user && data.session) {
          setUser(data.user);
          setSession(data.session);
        }

        return { success: true, data };
      } catch (err) {
        handleError(err as Error);
        return { success: false, data: null };
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setSession, handleError]
  );

  /**
   * Verify OTP for email verification
   */
  const verifyOtp = useCallback(
    async (email: string, token: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: otpError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });

        if (otpError) {
          handleError(otpError);
          return { success: false, data: null };
        }

        if (data.user && data.session) {
          setUser(data.user);
          setSession(data.session);
        }

        return { success: true, data };
      } catch (err) {
        handleError(err as Error);
        return { success: false, data: null };
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setSession, handleError]
  );

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(
    async (email: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: 'cric://reset-password',
          }
        );

        if (resetError) {
          handleError(resetError);
          return { success: false };
        }

        return { success: true };
      } catch (err) {
        handleError(err as Error);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        handleError(logoutError);
        return { success: false };
      }

      clearAuthState();
      return { success: true };
    } catch (err) {
      handleError(err as Error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState, handleError]);

  /**
   * Check current session and initialize auth state
   */
  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
      } else {
        clearAuthState();
      }
    } catch (err) {
      handleError(err as Error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  }, [setSession, setLoading, clearAuthState, handleError]);

  return {
    register,
    login,
    verifyOtp,
    resetPassword,
    logout,
    checkSession,
    error,
    isLoading,
    clearError: () => setError(null),
  };
};

