import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';
import { SUPABASE_STORAGE_KEY, getSupabaseUrl } from './config';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        getSupabaseUrl(),
        supabaseAnonKey,
        {
            auth: { storageKey: SUPABASE_STORAGE_KEY },
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}
