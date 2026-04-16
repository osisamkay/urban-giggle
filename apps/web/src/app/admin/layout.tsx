'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading: authLoading, refreshUser } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Wait for Zustand to hydrate from localStorage
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Check auth after hydration
    useEffect(() => {
        if (!isHydrated) return;

        const checkAuth = async () => {
            // If no user after hydration, try refreshing from Supabase session
            if (!user) {
                await refreshUser();
            }
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [isHydrated, user, refreshUser]);

    // Redirect if not admin AFTER hydration and auth check complete
    useEffect(() => {
        if (!isHydrated || isCheckingAuth || authLoading) return;

        if (!user || user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, isHydrated, isCheckingAuth, authLoading, router]);

    // Show loading while hydrating or checking auth
    if (!isHydrated || isCheckingAuth || authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Verifying access...</p>
            </div>
        </div>;
    }

    if (!user || user.role !== 'ADMIN') return null;

    const links = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/merchants', label: 'Merchants', icon: '🏪' },
        { href: '/admin/users', label: 'Users', icon: '👥' },
        { href: '/admin/products', label: 'Products', icon: '🥩' },
        { href: '/admin/orders', label: 'Orders', icon: '📦' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center justify-center border-b border-slate-800">
                    <span className="text-xl font-bold tracking-tight">ShareSteak Admin</span>
                    <button className="md:hidden absolute right-4 text-gray-400" onClick={() => setSidebarOpen(false)}>×</button>
                </div>
                <nav className="mt-6 px-2 space-y-1">
                    {links.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-meat-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="mr-3 text-lg">{link.icon}</span>
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold overflow-hidden relative">
                            {user.avatarUrl ? (
                                <Image src={user.avatarUrl} alt="Admin" fill className="object-cover" />
                            ) : (
                                <span>{user.firstName?.[0]}</span>
                            )}
                        </div>
                        <div className="text-xs">
                            <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                            <p className="text-slate-400 capitalize">{user.role?.toLowerCase()}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center px-6 md:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-900">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="ml-4 font-semibold text-gray-900">Admin Panel</span>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
