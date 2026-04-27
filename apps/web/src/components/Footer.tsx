'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on dashboard pages
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.startsWith('/seller')) {
    return null;
  }

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4 group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-meat-500/15 via-meat-600/15 to-meat-700/15 rounded-lg opacity-0 group-hover:opacity-100 blur transition-all duration-300"></div>
              <Image
                src="/logos/original.png"
                alt="ShareSteak Logo"
                width={200}
                height={70}
                className="h-16 w-auto relative drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_8px_16px_rgba(220,38,38,0.2)] transition-all duration-300 group-hover:scale-[1.06] saturate-110 brightness-105"
                style={{ filter: 'contrast(1.15) saturate(1.1)' }}
              />
            </Link>
            <p className="text-sm text-gray-600 mb-4">
              Quality meat, direct from producers. Join group purchases to unlock wholesale prices and connect with trusted local farmers.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:text-white hover:bg-meat-600 transition-all duration-200 flex items-center justify-center"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:text-white hover:bg-meat-600 transition-all duration-200 flex items-center justify-center"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:text-white hover:bg-meat-600 transition-all duration-200 flex items-center justify-center"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-display font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/groups" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Group Purchases
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-display font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-sm font-display font-semibold text-gray-900 uppercase tracking-wider mb-4">
              For Sellers
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/seller/apply" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/seller/guide" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Seller Guide
                </Link>
              </li>
              <li>
                <Link href="/dashboard/seller" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller/resources" className="text-sm text-gray-600 hover:text-meat-600 transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} ShareSteak. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-meat-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-meat-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-gray-500 hover:text-meat-600 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
