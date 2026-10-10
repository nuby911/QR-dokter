'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Keyboard,
  AlertCircle,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerInputProps {
  onScanResult: (rawString: string) => void;
  isLoading?: boolean;
}

export default function QrScannerInput({
  onScanResult,
  isLoading = false,
}: QrScannerInputProps) {
  const [manualInput, setManualInput] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on mount for USB barcode scanner guns
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle camera scanner lifecycle
  useEffect(() => {
    if (!isCameraActive) {
      setCameraError(null);
      return;
    }

    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setCameraError(
        'Kamera web dibatasi pada koneksi non-HTTPS. Gunakan USB Barcode Gun atau tempel link hash resep secara langsung.'
      );
      return;
    }

    let scanner: Html5QrcodeScanner | null = null;
    try {
      scanner = new Html5QrcodeScanner(
        'html5-qrcode-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScanResult(decodedText);
          setIsCameraActive(false);
          try {
            scanner?.clear();
          } catch {
            // ignore
          }
        },
        () => {
          // ignore transient frame scanning errors
        }
      );
    } catch (err) {
      console.error('Failed to init camera scanner:', err);
      setCameraError('Gagal mengakses kamera web perangkat.');
    }

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch {
          // ignore
        }
      }
    };
  }, [isCameraActive, onScanResult]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onScanResult(manualInput.trim());
    setManualInput('');
  };

  return (
    <div className="rounded-3xl border border-[#ebdccd] bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#241a14] text-xs uppercase tracking-wider font-mono">
            Pemindai Resep Masuk
          </h3>
          <p className="text-xs text-[#716358] mt-0.5">
            Gunakan USB Barcode Gun, kamera web, atau tempel tautan URL resep.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              isCameraActive
                ? 'border-[#241a14] bg-[#241a14] text-white'
                : 'border-[#ebdccd] bg-white text-[#241a14] hover:bg-[#f5ece1]'
            }`}
          >
            <Camera className="h-3.5 w-3.5 text-[#e86a28]" />
            <span>{isCameraActive ? 'Tutup Kamera' : 'Kamera Web'}</span>
          </button>
        </div>
      </div>

      {/* Camera scanner reader element */}
      {isCameraActive && (
        <div className="rounded-2xl border border-[#ebdccd] bg-[#faf7f2] p-4 text-center">
          {cameraError ? (
            <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 text-left">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Info Kamera:</p>
                <p className="mt-0.5">{cameraError}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto max-w-xs overflow-hidden rounded-2xl bg-white border border-[#ebdccd]">
                <div id="html5-qrcode-reader" className="w-full" />
              </div>
              <p className="mt-2 text-xs text-[#716358] font-mono">
                Posisikan QR Code di depan lensa kamera
              </p>
            </>
          )}
        </div>
      )}

      {/* Manual input form for USB Barcode Scanner Gun or text paste */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Keyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a39487]" />
          <input
            ref={inputRef}
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Arahkan Barcode Scanner Gun ke sini, atau tempel hash #d=..."
            className="w-full rounded-full border border-[#ebdccd] bg-[#fbfbf8] py-2.5 pl-10 pr-20 text-xs text-[#241a14] placeholder-[#a39487] focus:border-[#e86a28] focus:bg-white focus:outline-none font-mono transition"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#ebdccd]/60 px-2 py-0.5 text-[10px] font-mono text-[#716358]">
            ↵ Enter
          </span>
        </div>
        <button
          type="submit"
          disabled={!manualInput.trim() || isLoading}
          className="rounded-full bg-[#e86a28] hover:bg-[#d95a18] px-5 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-40 transition active:scale-[0.99]"
        >
          {isLoading ? 'Memproses...' : 'Proses'}
        </button>
      </form>
    </div>
  );
}
