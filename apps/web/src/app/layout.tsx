import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SkipToContent } from '@/components/SkipToContent';
import { Analytics } from '@/components/Analytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ShareSteak - Modern Meat Marketplace',
    template: '%s | ShareSteak',
  },
  description:
    'Connect with quality meat producers through group purchasing and community features. Direct-to-consumer meat marketplace with transparent sourcing.',
  keywords: 'meat marketplace, group purchasing, meat delivery, local farmers, wholesale meat, Calgary, Alberta',
  icons: {
    icon: '/logos/original.png',
    apple: '/logos/original.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'ShareSteak',
    title: 'ShareSteak - Modern Meat Marketplace',
    description: 'Quality meat, direct from producers. Join group purchases for wholesale prices.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShareSteak - Modern Meat Marketplace',
    description: 'Quality meat, direct from producers. Join group purchases for wholesale prices.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sharesteak.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShareSteak',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Analytics />
        <Providers>
          <SkipToContent />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main id="main-content" className="flex-1" role="main">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}