'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Download, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaManager() {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [dismissInstall, setDismissInstall] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Initial Online/Offline State & Event Listeners
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Listen for new workers or updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[PWA] Versi baru MediQR siap digunakan.');
                  } else {
                    console.log('[PWA] Konten MediQR berhasil disimpan untuk penggunaan offline.');
                  }
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] Gagal meregistrasi service worker:', err);
        });
    }

    // 3. BeforeInstallPrompt Event Listener for Native PWA Installation
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setTimeout(() => setIsInstalled(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } catch (err) {
      console.error('[PWA] Error prompt install:', err);
    }
  };

  return (
    <>
      {/* Offline Status Alert Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#241a14] text-white py-1.5 px-4 text-xs shadow-md border-b border-[#e86a28]/40 transition-all">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#e86a28] animate-pulse" />
              <WifiOff className="h-3.5 w-3.5 text-[#e86a28]" />
              <span className="font-semibold text-[11px] sm:text-xs">
                Mode Offline Aktif &bull; MediQR beroperasi mandiri tanpa koneksi internet
              </span>
            </div>
            <span className="hidden sm:inline font-mono text-[10px] text-[#ebdccd]">
              Cache Lokal Siap
            </span>
          </div>
        </div>
      )}

      {/* Installed Toast */}
      {isInstalled && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-emerald-900 text-white px-4 py-2.5 text-xs shadow-lg border border-emerald-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold">MediQR berhasil dipasang di perangkat ini!</span>
        </div>
      )}

      {/* Install Floating Promotion Pill (Shows only when browser supports PWA installation) */}
      {installPrompt && !dismissInstall && !isInstalled && (
        <aside aria-label="Instalasi Aplikasi" className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-[#ebdccd] bg-white/95 backdrop-blur-sm p-1.5 pl-3.5 shadow-xl transition-all">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#241a14]">Pasang MediQR</span>
            <span className="hidden sm:inline text-[#716358] text-[11px]">
              Akses cepat tanpa browser
            </span>
          </div>

          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.98]"
            title="Pasang aplikasi MediQR di layar utama"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Install</span>
          </button>

          <button
            onClick={() => setDismissInstall(true)}
            className="rounded-full p-1 text-[#a39487] hover:text-[#241a14] hover:bg-[#f5ece1] transition"
            title="Tutup pemberitahuan"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </aside>
      )}
    </>
  );
}
