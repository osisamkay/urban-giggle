'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function DashboardSidebar() {
    const pathname = usePathname();
    const { user, isSeller, isAdmin } = useAuthStore();

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname?.startsWith(path)) return true;
        return false;
    };

    // Determine context: are we in seller or admin section?
    // Admin lives at /admin/*, seller lives under /dashboard/seller/*.
    const isSellerSection = pathname?.startsWith('/dashboard/seller');
    const isAdminSection = pathname?.startsWith('/admin');

    const sellerNav = [
        { name: 'Seller Overview', href: '/dashboard/seller', icon: ChartBarIcon },
        { name: 'My Products', href: '/dashboard/seller/products', icon: CubeIcon },
        { name: 'Sales Orders', href: '/dashboard/seller/orders', icon: ClipboardListIcon },
        { name: 'Group Buys', href: '/dashboard/seller/groups', icon: UserGroupIcon },
    ];

    const adminNav = [
        { name: 'Admin Overview', href: '/admin', icon: ShieldCheckIcon },
        { name: 'Merchants', href: '/admin/merchants', icon: ShieldCheckIcon },
        { name: 'Orders', href: '/admin/orders', icon: ClipboardListIcon },
        { name: 'Products', href: '/admin/products', icon: CubeIcon },
        { name: 'User Management', href: '/admin/users', icon: UsersIcon },
    ];

    // Show seller nav in seller section, admin nav in admin section
    // If on /dashboard root, show based on role (seller first, then admin)
    let navigation: typeof sellerNav = [];
    if (isAdminSection && isAdmin()) {
        navigation = adminNav;
    } else if (isSellerSection && isSeller()) {
        navigation = sellerNav;
    } else {
        // On /dashboard root or unknown — show all applicable links
        if (isSeller()) navigation = [...navigation, ...sellerNav];
        if (isAdmin()) navigation = [...navigation, ...adminNav];
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto hidden md:block">
            <div className="p-6">
                {/* Section label */}
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {isAdminSection ? 'Admin' : 'Seller Dashboard'}
                </h2>

                <nav className="space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                isActive(item.href)
                                    ? 'bg-meat-50 text-meat-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <item.icon className={`mr-3 h-5 w-5 ${
                                isActive(item.href) ? 'text-meat-500' : 'text-gray-400'
                            }`} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Switch section link */}
                {isAdmin() && isSeller() && (
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Switch To
                        </h2>
                        {isSellerSection ? (
                            <Link
                                href="/admin"
                                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                <ShieldCheckIcon className="mr-3 h-5 w-5 text-gray-400" />
                                Admin Panel
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard/seller"
                                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                <ChartBarIcon className="mr-3 h-5 w-5 text-gray-400" />
                                Seller Dashboard
                            </Link>
                        )}
                    </div>
                )}

                {/* Quick links */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                    <Link
                        href="/products"
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        <HomeIcon className="mr-3 h-5 w-5 text-gray-400" />
                        Back to Store
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Icons
function HomeIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}
function ChartBarIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}
function CubeIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
}
function UserGroupIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function ClipboardListIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
}
function ShieldCheckIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
function UsersIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
