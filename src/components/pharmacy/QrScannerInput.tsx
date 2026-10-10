'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Scan,
  Camera,
  Keyboard,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { DEMO_DOCTOR } from '../../lib/demo-data';
import { signPrescription } from '../../lib/crypto';
import { encodePrescriptionToUrl } from '../../lib/qr-codec';

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

    // Check if camera API is supported in current context
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setCameraError(
        'Kamera web dibatasi browser pada koneksi HTTP (non-HTTPS). Gunakan USB Barcode Gun, tombol "Simulasi Scan", atau tempel link URL resep secara langsung.'
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
        (error) => {
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

  const handleSimulateScan = async () => {
    // Generate real signed prescription on the fly for quick demo test
    const rawDemo = {
      v: 1,
      id: `RX-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Agus Salim',
        a: 38,
        g: 'L' as const,
        phone: '081398765432',
      },
      dt: new Date().toISOString().slice(0, 10),
      rx: [
        {
          n: 'Paracetamol 500mg',
          q: 10,
          s: '3x1 tablet sesudah makan (bila demam)',
        },
        {
          n: 'Amoxicillin 500mg',
          q: 10,
          s: '3x1 kaplet sesudah makan (habiskan)',
        },
      ],
    };

    const sig = await signPrescription(rawDemo, DEMO_DOCTOR.privateKey);
    const fullPayload = { ...rawDemo, sig };
    const url = encodePrescriptionToUrl(fullPayload);
    onScanResult(url);
  };

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 border border-forest-200/60 text-forest-800">
            <Scan className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-ink-950 text-sm tracking-tight">
              Pemindai QR Resep Masuk
            </h3>
            <p className="text-[11px] text-ink-500">
              Arahkan USB Barcode Gun ke kolom input, nyalakan kamera web, atau tempel link hash resep.
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              isCameraActive
                ? 'border-forest-600 bg-forest-50 text-forest-800'
                : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            {isCameraActive ? 'Tutup Kamera' : 'Buka Kamera Web'}
          </button>

          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-forest-300 bg-forest-50/80 px-3 py-1.5 text-xs font-bold text-forest-800 hover:bg-forest-100 transition shadow-xs"
            title="Simulasikan scan resep contoh secara instan untuk demo"
          >
            <Sparkles className="h-3.5 w-3.5 text-forest-700" />
            <span>Simulasi Scan Demo</span>
          </button>
        </div>
      </div>

      {/* Camera scanner reader element */}
      {isCameraActive && (
        <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-4 text-center">
          {cameraError ? (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 text-left">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Pemberitahuan Kamera:</p>
                <p className="mt-0.5">{cameraError}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
                <div id="html5-qrcode-reader" className="w-full" />
              </div>
              <p className="mt-2 text-xs text-ink-500 font-mono">
                Posisikan QR Code di depan kamera hingga terfokus
              </p>
            </>
          )}
        </div>
      )}

      {/* Manual input form for USB Barcode Scanner Gun or text paste */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Keyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            ref={inputRef}
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Arahkan Barcode Scanner Gun ke sini, atau tempel hash resep #d=..."
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 py-2.5 pl-10 pr-20 text-xs text-ink-900 placeholder-ink-400 focus:border-forest-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600 font-mono"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-ink-200/80 px-1.5 py-0.5 text-[10px] font-mono text-ink-600">
            ↵ Enter
          </span>
        </div>
        <button
          type="submit"
          disabled={!manualInput.trim() || isLoading}
          className="rounded-xl bg-forest-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-forest-800 disabled:opacity-50"
        >
          {isLoading ? 'Memproses...' : 'Proses Resep'}
        </button>
      </form>
    </div>
  );
}
