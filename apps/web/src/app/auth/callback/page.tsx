'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuthStore();
    const [status, setStatus] = useState('Completing sign in...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                setStatus('Verifying authentication...');

                // Check if there's an error in the URL params (from failed auth)
                const error = searchParams.get('error');
                const errorDescription = searchParams.get('error_description');
                if (error) {
                    console.error('Auth error from URL:', error, errorDescription);
                    setStatus(`Authentication failed: ${errorDescription || error}. Redirecting...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    router.replace('/login');
                    return;
                }

                // For magic links, Supabase sends tokens in hash fragment
                // The Supabase client should automatically detect and process these
                // We need to wait for the auth state to change

                // Set up a promise that resolves when we get an authenticated session
                const waitForSession = new Promise<boolean>((resolve) => {
                    // First check if session already exists
                    supabase.auth.getSession().then(({ data: { session } }) => {
                        if (session) {
                            console.log('Session already exists:', session.user.email);
                            resolve(true);
                            return;
                        }

                        // If no session, listen for auth state changes
                        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                            console.log('Auth state changed:', event, session?.user?.email);
                            if (event === 'SIGNED_IN' && session) {
                                subscription.unsubscribe();
                                resolve(true);
                            }
                        });

                        // Set a timeout in case the auth never completes
                        setTimeout(() => {
                            subscription.unsubscribe();
                            resolve(false);
                        }, 5000);
                    });
                });

                setStatus('Processing magic link...');
                const hasSession = await waitForSession;

                if (!hasSession) {
                    // One final check
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        console.error('No session established after waiting');
                        setStatus('Session not established. Redirecting to login...');
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        router.replace('/login');
                        return;
                    }
                }

                setStatus('Loading user profile...');
                await refreshUser();

                // Redirect based on role
                const user = useAuthStore.getState().user;
                console.log('Callback - User loaded:', user);

                if (user?.role === 'ADMIN') {
                    setStatus('Welcome, Admin! Redirecting to dashboard...');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    router.replace('/admin');
                } else if (user?.role === 'SELLER') {
                    setStatus('Welcome, Seller! Redirecting...');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    router.replace('/seller/dashboard');
                } else {
                    setStatus('Welcome! Redirecting...');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    router.replace('/products');
                }
            } catch (error) {
                console.error('Callback error:', error);
                setStatus('Something went wrong. Redirecting to login...');
                await new Promise(resolve => setTimeout(resolve, 1500));
                router.replace('/login');
            }
        };

        handleCallback();
    }, [router, refreshUser, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600 mx-auto mb-4"></div>
                <p className="text-gray-500">{status}</p>
            </div>
        </div>
    );
}
