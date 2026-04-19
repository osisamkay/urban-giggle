import { supabase } from '../supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'BUYER' | 'SELLER';
}

export interface SignInData {
  email: string;
  password: string;
}

export const authApi = {
  // Sign up a new user
  signUp: async (data: SignUpData) => {
    const { email, password, firstName, lastName, role = 'BUYER' } = data;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Update user profile created by DB trigger (handle_new_user)
    // with additional fields (name, role). Use upsert to handle
    // race condition where trigger may not have fired yet.
    const { error: profileError } = await supabase
      .from('users')
      // @ts-ignore - Supabase generated types are strict; upsert needs full row type
      .upsert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
      }, { onConflict: 'id' });

    if (profileError) throw profileError;

    return authData;
  },

  // Sign in existing user
  signIn: async (data: SignInData) => {
    const { email, password } = data;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) throw userError;

    return { auth: authData, user: userData };
  },

  // Sign in with Magic Link (OTP)
  signInWithMagicLink: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user profile
  getCurrentUserProfile: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return null;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    return userData;
  },

  // Request password reset
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<{
    first_name: string;
    last_name: string;
    phone_number: string;
    avatar_url: string;
  }>) => {
    const { data, error } = await supabase
      .from('users')
      // @ts-ignore - Type issue with Supabase generated types
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
