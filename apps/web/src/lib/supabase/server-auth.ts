import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from './server';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// User profile type for auth checks
export interface AuthUser {
    id: string;
    email: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
    first_name: string | null;
    last_name: string | null;
}

// Get authenticated user from request cookies using SSR client
export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        // Use the proper SSR client that handles cookies correctly
        const supabase = await createServerSupabaseClient();

        // Get the session from the SSR client
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            console.debug('[server-auth] No authenticated user found');
            return null;
        }

        // Create admin client to fetch user profile (with service role for full access)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Fetch user profile to get role
        const { data: userProfile } = await supabaseAdmin
            .from('users')
            .select('id, email, role, first_name, last_name')
            .eq('id', user.id)
            .single();

        if (!userProfile) {
            return null;
        }

        return userProfile as AuthUser;
    } catch (error) {
        console.error('[server-auth] getAuthUser error:', error);
        return null;
    }
}

// Check if user is authenticated
export async function requireAuth() {
    const user = await getAuthUser();
    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }
    return { user };
}

// Check if user is admin
export async function requireAdmin() {
    const user = await getAuthUser();
    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }
    if (user.role !== 'ADMIN') {
        return { error: 'Forbidden - Admin access required', status: 403 };
    }
    return { user };
}

// Check if user is seller or admin
export async function requireSeller() {
    const user = await getAuthUser();
    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
        return { error: 'Forbidden - Seller access required', status: 403 };
    }
    return { user };
}
