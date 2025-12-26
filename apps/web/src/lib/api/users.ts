import { supabase } from '../supabase/client';

export const usersApi = {
    getAllUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        return data as any;
    },

    updateUserRole: async (userId: string, role: string) => {
        const { data, error } = await supabase
            .from('users')
            // @ts-ignore
            .update({ role })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data as any;
    },

    getAllMerchants: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*, seller_profiles(*)')
            .eq('role', 'SELLER')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as any;
    },

    verifyMerchant: async (sellerProfileId: string, verified: boolean) => {
        const { error } = await supabase
            .from('seller_profiles')
            // @ts-ignore
            .update({ verified })
            .eq('id', sellerProfileId);

        if (error) throw error;
    }
};
