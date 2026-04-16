import { supabase } from '../supabase/client';
import type { Database } from '../supabase/database.types';

export type Address = Database['public']['Tables']['addresses']['Row'];
export type AddressInsert = Database['public']['Tables']['addresses']['Insert'];

export const addressesApi = {
  // Get user's addresses
  getUserAddresses: async (userId: string) => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data as Address[];
  },

  // Get default address
  getDefaultAddress: async (userId: string) => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create a new address
  createAddress: async (address: AddressInsert) => {
    // If this is set as default, unset other defaults
    if (address.is_default && address.user_id) {
      await supabase
        .from('addresses')
        // @ts-ignore - Type issue with Supabase generated types
        .update({ is_default: false })
        .eq('user_id', address.user_id);
    }

    const { data, error } = await supabase
      .from('addresses')
      // @ts-ignore - Type issue with Supabase generated types
      .insert(address)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an address
  updateAddress: async (addressId: string, updates: Partial<AddressInsert>) => {
    // If setting as default, unset other defaults
    if (updates.is_default && updates.user_id) {
      await supabase
        .from('addresses')
        // @ts-ignore - Type issue with Supabase generated types
        .update({ is_default: false })
        .eq('user_id', updates.user_id);
    }

    const { data, error } = await supabase
      .from('addresses')
      // @ts-ignore - Type issue with Supabase generated types
      .update(updates)
      .eq('id', addressId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete an address
  deleteAddress: async (addressId: string) => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;
  },

  // Set default address
  setDefaultAddress: async (addressId: string, userId: string) => {
    // Unset all defaults
    await supabase
      .from('addresses')
      // @ts-ignore - Type issue with Supabase generated types
      .update({ is_default: false })
      .eq('user_id', userId);

    // Set new default
    const { data, error } = await supabase
      .from('addresses')
      // @ts-ignore - Type issue with Supabase generated types
      .update({ is_default: true })
      .eq('id', addressId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
