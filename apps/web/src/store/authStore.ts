import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@sharesteak/types';
import { authApi } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isSeller: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user: userData } = await authApi.signIn({ email, password });
          set({ user: userData as User, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signUp: async (data) => {
        set({ isLoading: true });
        try {
          await authApi.signUp({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
          });
          // Sign in after successful signup
          await get().signIn(data.email, data.password);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          await authApi.signOut();
          set({ user: null });
        } catch (error) {
          console.error('Sign out error:', error);
          throw error;
        }
      },

      refreshUser: async () => {
        try {
          const userData = await authApi.getCurrentUserProfile();
          set({ user: userData as User });
        } catch (error) {
          console.error('Refresh user error:', error);
          set({ user: null });
        }
      },

      isAuthenticated: () => !!get().user,

      isAdmin: () => get().user?.role === 'ADMIN',

      isSeller: () => get().user?.role === 'SELLER' || get().user?.role === 'ADMIN',
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize auth state on app load
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        const userData = await authApi.getCurrentUserProfile();
        useAuthStore.getState().setUser(userData as User);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        useAuthStore.getState().setUser(null);
      }
    } else {
      useAuthStore.getState().setUser(null);
    }
  });
}
