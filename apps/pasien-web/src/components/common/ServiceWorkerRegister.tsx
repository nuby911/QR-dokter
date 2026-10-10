'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[MediQR Pasien PWA] Service Worker aktif:', reg.scope);
        })
        .catch((err) => {
          console.warn('[MediQR Pasien PWA] Registrasi Service Worker tertunda:', err);
        });
    }
  }, []);

  return null;
}
