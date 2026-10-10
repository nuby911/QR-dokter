'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Keyboard,
  Play,
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

  const handleSimulateScan = async () => {
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
          s: '3x1 tablet sesudah makan',
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
    <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider font-mono">
            Pemindai Resep Masuk
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Gunakan USB Barcode Gun, kamera web, atau tempel tautan URL resep.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition ${
              isCameraActive
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>{isCameraActive ? 'Tutup Kamera' : 'Kamera Web'}</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition"
            title="Simulasikan scan resep contoh secara instan"
          >
            <Play className="h-3 w-3" />
            <span>Simulasi Uji</span>
          </button>
        </div>
      </div>

      {/* Camera scanner reader element */}
      {isCameraActive && (
        <div className="rounded border border-neutral-200 bg-neutral-50 p-4 text-center">
          {cameraError ? (
            <div className="flex items-start gap-2.5 rounded bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 text-left">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Info Kamera:</p>
                <p className="mt-0.5">{cameraError}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto max-w-xs overflow-hidden rounded bg-white border border-neutral-200">
                <div id="html5-qrcode-reader" className="w-full" />
              </div>
              <p className="mt-2 text-[11px] text-neutral-500 font-mono">
                Posisikan QR Code di depan lensa kamera
              </p>
            </>
          )}
        </div>
      )}

      {/* Manual input form for USB Barcode Scanner Gun or text paste */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Arahkan Barcode Scanner Gun ke sini, atau tempel hash #d=..."
            className="w-full rounded border border-neutral-200 bg-neutral-50/50 py-2 pl-9 pr-16 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none font-mono"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-neutral-200/60 px-1 py-0.5 text-[9px] font-mono text-neutral-600">
            ↵ Enter
          </span>
        </div>
        <button
          type="submit"
          disabled={!manualInput.trim() || isLoading}
          className="rounded bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-40 transition"
        >
          {isLoading ? 'Memproses...' : 'Proses'}
        </button>
      </form>
    </div>
  );
}
