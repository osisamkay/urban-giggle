import type { SupabaseClient } from '@supabase/supabase-js';
import type { User, UserRole, ApiResponse } from '@sharesteak/types';

export class AuthAPI {
  constructor(private supabase: SupabaseClient) {}

  async signUp(email: string, password: string, role: UserRole = 'BUYER'): Promise<ApiResponse<User>> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create user profile
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          role,
        })
        .select()
        .single();

      if (userError) throw userError;

      return {
        success: true,
        data: userData as User,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Sign up failed',
        },
      };
    }
  }

  async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Authentication failed');

      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      return {
        success: true,
        data: userData as User,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Sign in failed',
        },
      };
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Sign out failed',
        },
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();

      if (!session) {
        return { success: true, data: null };
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as User,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get user',
        },
      };
    }
  }

  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Password reset failed',
        },
      };
    }
  }

  async updatePassword(newPassword: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Password update failed',
        },
      };
    }
  }
}
