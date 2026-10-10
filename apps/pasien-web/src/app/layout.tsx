import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediQR Pasien — Portal Resep Digital',
  description: 'Portal Pasien untuk Membaca dan Memverifikasi Resep Medis Berbasis QR Code Ed25519 Mandiri',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#e86a28',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import ServiceWorkerRegister from '../components/common/ServiceWorkerRegister';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#faf7f2] text-[#241a14] font-sans antialiased selection:bg-[#e86a28]/20 selection:text-[#241a14]">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
