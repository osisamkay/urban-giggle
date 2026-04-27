import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  authApi: {
    verifyOtp: vi.fn(),
    getCurrentUserProfile: vi.fn(),
  },
}));

// Reset store between tests
beforeEach(() => {
  vi.clearAllMocks();
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

  describe('verifyOtp', () => {
    const profile = {
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

    it('sets user and clears loading on successful verification', async () => {
      vi.mocked(authApi.verifyOtp).mockResolvedValue({ user: { id: '123' } } as any);
      vi.mocked(authApi.getCurrentUserProfile).mockResolvedValue(profile as any);

      await useAuthStore.getState().verifyOtp('test@test.com', '123456');

      expect(useAuthStore.getState().user).toEqual(profile);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('throws and clears loading when verifyOtp returns no user', async () => {
      vi.mocked(authApi.verifyOtp).mockResolvedValue({ user: null } as any);

      await expect(
        useAuthStore.getState().verifyOtp('test@test.com', '123456')
      ).rejects.toThrow(/no user/i);

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(authApi.getCurrentUserProfile).not.toHaveBeenCalled();
    });

    it('rethrows underlying error and clears loading on failure', async () => {
      vi.mocked(authApi.verifyOtp).mockRejectedValue(new Error('Invalid code'));

      await expect(
        useAuthStore.getState().verifyOtp('test@test.com', '999999')
      ).rejects.toThrow('Invalid code');

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
