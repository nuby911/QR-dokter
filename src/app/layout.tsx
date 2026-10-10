import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediQR — Sistem E-Preskripsi Medis Desentralisasi',
  description: 'Protokol resep mandiri berbasis QR Code kriptografi Ed25519 dan pemotongan inventaris apotek.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased text-[#221a15] bg-[#faf7f2] selection:bg-[#e86a28] selection:text-white">
        {children}
      </body>
    </html>
  );
}
