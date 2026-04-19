import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';

// These tests verify the auth flow logic without hitting real Supabase
// For real integration tests, use Playwright E2E tests

describe('Auth Integration', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: false,
      hasHydrated: true,
    });
  });

  it('signup → sets user in store', async () => {
    // Simulate successful signup
    const mockUser = {
      id: 'user-1',
      email: 'new@sharesteak.com',
      role: 'BUYER' as const,
      firstName: 'New',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: false,
      mfaEnabled: false,
    };

    useAuthStore.getState().setUser(mockUser);

    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('new@sharesteak.com');
    expect(useAuthStore.getState().user?.role).toBe('BUYER');
  });

  it('login → sets user → navigate to products', async () => {
    const mockUser = {
      id: 'user-2',
      email: 'buyer@sharesteak.com',
      role: 'BUYER' as const,
      firstName: 'Test',
      lastName: 'Buyer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      mfaEnabled: false,
    };

    useAuthStore.getState().setUser(mockUser);

    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useAuthStore.getState().isSeller()).toBe(false);
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('signout → clears user', () => {
    useAuthStore.getState().setUser({
      id: 'user-3',
      email: 'test@test.com',
      role: 'BUYER',
    } as any);

    expect(useAuthStore.getState().isAuthenticated()).toBe(true);

    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('seller login → isSeller returns true', () => {
    useAuthStore.getState().setUser({
      id: 'seller-1',
      email: 'seller@sharesteak.com',
      role: 'SELLER',
    } as any);

    expect(useAuthStore.getState().isSeller()).toBe(true);
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('admin login → isAdmin and isSeller both true', () => {
    useAuthStore.getState().setUser({
      id: 'admin-1',
      email: 'admin@sharesteak.com',
      role: 'ADMIN',
    } as any);

    expect(useAuthStore.getState().isAdmin()).toBe(true);
    expect(useAuthStore.getState().isSeller()).toBe(true);
  });
});
