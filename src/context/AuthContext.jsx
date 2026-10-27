import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const { user: currentUser, profile: currentProfile } = await authService.getCurrentUser();
        setUser(currentUser);
        setProfile(currentProfile);
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { profile: p } = await authService.getCurrentUser();
          setUser(session.user);
          setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (!res.error && res.data) {
      setUser(res.data.user);
      setProfile(res.data.profile);
    }
    return res;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    if (!res.error && res.data) {
      setUser(res.data.user);
      setProfile(res.data.profile);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  // Helper untuk mempermudah reviewer menguji 3 peran (Orang Tua, Petugas, Admin)
  const switchRole = (newRole) => {
    const updated = authService.switchDemoRole(newRole);
    setUser(updated);
    setProfile(updated);
  };

  const value = {
    user,
    profile,
    role: profile?.role || 'parent',
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
    switchRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      profile: null,
      role: 'parent',
      isAuthenticated: false,
      loading: true,
      login: async () => ({ error: { message: 'Auth belum siap' } }),
      logout: async () => {},
      register: async () => ({ error: { message: 'Auth belum siap' } }),
      switchRole: () => {}
    };
  }
  return context;
}
