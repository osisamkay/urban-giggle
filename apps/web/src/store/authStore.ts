import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@sharesteak/types';
import { authApi } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
      isLoading: false, // Providers.tsx handles initial auth check visibility
      hasHydrated: false,

      setUser: (user) => set({ user }),

      setLoading: (loading) => set({ isLoading: loading }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user: userData } = await authApi.signIn({ email, password });
          set({ user: userData as unknown as User, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signInWithMagicLink: async (email) => {
        set({ isLoading: true });
        try {
          await authApi.signInWithMagicLink(email);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) throw error;
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
          // Fetch user profile after signup (already logged in by Supabase)
          const userData = await authApi.getCurrentUserProfile();
          set({ user: userData as unknown as User, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          await authApi.signOut();
        } catch (error) {
          console.error('Sign out error:', error);
          // Continue to clear user state even if Supabase signOut fails
        } finally {
          // Always clear user state
          set({ user: null });
          // Clear persisted storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
          }
        }
      },

      refreshUser: async () => {
        try {
          const userData = await authApi.getCurrentUserProfile();
          set({ user: userData as unknown as User });
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
      // Only persist the user, not the loading state
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

