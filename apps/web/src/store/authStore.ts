import { create } from 'zustand';
import type { User } from '@sharesteak/types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isSeller: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),

  isAuthenticated: () => !!get().user,

  isAdmin: () => get().user?.role === 'ADMIN',

  isSeller: () => get().user?.role === 'SELLER' || get().user?.role === 'ADMIN',
}));
