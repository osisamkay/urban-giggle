import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabaseUrl } from './config';

let _supabaseAdmin: SupabaseClient<Database> | null = null;

function getSupabaseAdmin(): SupabaseClient<Database> {
    if (_supabaseAdmin) return _supabaseAdmin;

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        throw new Error('Missing Supabase Service Role Key for admin client');
    }

    _supabaseAdmin = createClient<Database>(getSupabaseUrl(), supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    return _supabaseAdmin;
}

// Proxy that lazily initializes on first use. Methods are bound to the underlying
// client so `this` resolves correctly when callers do `supabaseAdmin.from(...)`.
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
    get(_target, prop) {
        const client = getSupabaseAdmin();
        const value = (client as any)[prop];
        return typeof value === 'function' ? value.bind(client) : value;
    }
});
