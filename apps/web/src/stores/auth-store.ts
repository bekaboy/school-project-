import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  rememberMe: boolean;
  lastActivity: number;
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setLoading: (loading: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  updateActivity: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  rememberMe: localStorage.getItem('era-med-remember') === 'true',
  lastActivity: Date.now(),
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (isLoading) => set({ isLoading }),
  setRememberMe: (remember) => {
    localStorage.setItem('era-med-remember', remember ? 'true' : 'false');
    set({ rememberMe: remember });
  },
  updateActivity: () => set({ lastActivity: Date.now() }),
}));
