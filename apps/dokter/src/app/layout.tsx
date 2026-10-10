import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#e86a28',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MediQR — Terminal Peresepan Dokter (Mode Offline)',
  description: 'Aplikasi Peresepan Medis Mandiri Berbasis Smart QR Kriptografi Ed25519.',
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
