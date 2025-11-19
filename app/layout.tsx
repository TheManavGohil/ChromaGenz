import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClientProvider } from '@/components/providers/client-provider';
import { NextAuthSessionProvider } from '@/components/providers/session-provider';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChromaGen - AI-Powered Color Palette Generator',
  description: 'Generate beautiful, accessible color palettes with AI. Perfect for designers, developers, and creatives.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <ClientProvider defaultTheme="dark">
            <Navbar />
            <main className="min-h-screen bg-background">
              {children}
            </main>
            <Toaster />
          </ClientProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}