import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import PwaManager from '../components/common/PwaManager';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: '#e86a28',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MediQR — Sistem E-Preskripsi Medis Desentralisasi',
  description: 'Protokol resep mandiri berbasis QR Code kriptografi Ed25519 dan pemotongan inventaris apotek.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MediQR',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${plusJakarta.className} ${jetbrainsMono.variable} min-h-screen antialiased text-[#221a15] bg-[#faf7f2] selection:bg-[#e86a28] selection:text-white`}>
        <PwaManager />
        {children}
      </body>
    </html>
  );
}
