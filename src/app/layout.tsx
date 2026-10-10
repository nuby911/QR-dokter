import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediQR — Sistem Resep Medis Cerdas & Inventaris Apotek',
  description: 'Platform resep mandiri tanpa server pusat berbasis Self-Contained QR Code & manajemen stok apotek otomatis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
