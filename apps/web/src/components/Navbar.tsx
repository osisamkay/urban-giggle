'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import NotificationsDropdown from './NotificationsDropdown';

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isActivePath = (path: string) => pathname === path;

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/groups', label: 'Group Purchases' },
    { href: '/community', label: 'Community' },
  ];

  if (pathname?.startsWith('/admin')) return null;

  if (user?.role === 'SELLER') {
    navLinks.push({ href: '/seller/dashboard', label: 'Dashboard' });
  }

  if (user?.role === 'ADMIN') {
    navLinks.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group relative">
            <div className="absolute -inset-2 group-hover:opacity-100 blur-lg transition-all duration-300"></div>
            <Image
              src="/logos/monochrome-transparent.png"
              alt="ShareSteak Logo"
              width={240}
              height={80}
              className="h-[4rem] w-auto relative  transition-all duration-300 group-hover:scale-[1.08] saturate-110 brightness-105"
              priority
              style={{ filter: 'contrast(1.15) saturate(1.1)' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${isActivePath(link.href)
                  ? 'text-meat-600 border-meat-600 font-semibold'
                  : 'text-gray-700 hover:text-meat-600 border-transparent hover:border-meat-300'
                  } inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-all duration-200 hover:bg-meat-50/50 rounded-t-lg`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <NotificationsDropdown />
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-meat-600 transition-colors touch-target"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-meat-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu - Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <>
                  <Link
                    href="/orders"
                    className="text-sm text-gray-700 hover:text-meat-600 transition-colors"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/profile"
                    className="text-sm text-gray-700 hover:text-meat-600 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-700 hover:text-meat-600 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-gray-700 hover:text-meat-600 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-meat-600 to-meat-700 text-white px-6 py-2 rounded-lg hover:from-meat-700 hover:to-meat-800 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-meat-600 hover:bg-gray-100 transition-colors touch-target"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`${isActivePath(link.href)
                  ? 'text-meat-600 bg-meat-50'
                  : 'text-gray-700 hover:text-meat-600 hover:bg-gray-50'
                  } block px-3 py-3 rounded-md text-base font-medium transition-colors touch-target`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile user actions */}
            <div className="pt-4 pb-2 border-t border-gray-200 space-y-1">
              {user ? (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-meat-600 hover:bg-gray-50 transition-colors touch-target"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-meat-600 hover:bg-gray-50 transition-colors touch-target"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-meat-600 hover:bg-gray-50 transition-colors touch-target"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-meat-600 hover:bg-gray-50 transition-colors touch-target"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-md text-base font-medium bg-meat-600 text-white hover:bg-meat-700 transition-colors touch-target text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
