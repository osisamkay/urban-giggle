import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/store/authStore';

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isLoading: false,
    hasHydrated: false,
  });
});

describe('authStore', () => {
  it('should start with null user', () => {
    const { user } = useAuthStore.getState();
    expect(user).toBeNull();
  });

  it('should set user', () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      role: 'BUYER' as const,
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      mfaEnabled: false,
    };

    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('should report authentication status', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);

    useAuthStore.getState().setUser({
      id: '123',
      email: 'test@test.com',
      role: 'BUYER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      mfaEnabled: false,
    } as any);

    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('should detect admin role', () => {
    useAuthStore.getState().setUser({
      id: '123',
      email: 'admin@test.com',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      mfaEnabled: false,
    } as any);

    expect(useAuthStore.getState().isAdmin()).toBe(true);
    expect(useAuthStore.getState().isSeller()).toBe(true); // Admin is also seller
  });

  it('should detect seller role', () => {
    useAuthStore.getState().setUser({
      id: '123',
      email: 'seller@test.com',
      role: 'SELLER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      mfaEnabled: false,
    } as any);

    expect(useAuthStore.getState().isSeller()).toBe(true);
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('should clear user on sign out state', () => {
    useAuthStore.getState().setUser({
      id: '123',
      email: 'test@test.com',
      role: 'BUYER',
    } as any);

    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('should set hydrated state', () => {
    useAuthStore.getState().setHasHydrated(true);
    expect(useAuthStore.getState().hasHydrated).toBe(true);
  });
});
