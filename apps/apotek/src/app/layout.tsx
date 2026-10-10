import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediQR Apotek — Terminal Kasir & Inventaris Farmasi',
  description: 'Sistem Farmasi Mandiri untuk Pemindaian Resep Digital QR, Validasi Ed25519, dan Manajemen Stok Obat',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#faf7f2] text-[#241a14] font-sans antialiased selection:bg-[#e86a28]/20 selection:text-[#241a14]">
        {children}
      </body>
    </html>
  );
}
