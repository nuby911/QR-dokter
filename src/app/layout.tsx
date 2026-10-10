import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaManager from '../components/common/PwaManager';

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
      <body className="min-h-screen antialiased text-[#221a15] bg-[#faf7f2] selection:bg-[#e86a28] selection:text-white">
        <PwaManager />
        {children}
      </body>
    </html>
  );
}
