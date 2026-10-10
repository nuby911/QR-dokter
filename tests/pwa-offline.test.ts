import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { decodePrescriptionFromUrlHash, encodePrescriptionToUrl } from '../src/lib/qr-codec';
import { signPrescription, verifyPrescriptionSignature } from '../src/lib/crypto';
import { DEMO_DOCTOR } from '../src/lib/demo-data';

describe('PWA & Offline Service Worker Configuration', () => {
  const publicDir = path.join(process.cwd(), 'public');

  it('should have a valid, well-structured web app manifest', () => {
    const manifestPath = path.join(publicDir, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);

    // Required PWA properties
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBe('MediQR');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#e86a28');
    expect(manifest.background_color).toBe('#faf7f2');

    // Icons array
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const icon192 = manifest.icons.find((i: { sizes: string }) => i.sizes === '192x192');
    const icon512 = manifest.icons.find((i: { sizes: string }) => i.sizes === '512x512');
    expect(icon192).toBeDefined();
    expect(icon512).toBeDefined();

    // Verify icons physically exist on disk
    expect(fs.existsSync(path.join(publicDir, icon192.src))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, icon512.src))).toBe(true);
  });

  it('should have a valid Service Worker with offline caching strategies', () => {
    const swPath = path.join(publicDir, 'sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf8');
    expect(swContent).toContain("addEventListener('install'");
    expect(swContent).toContain("addEventListener('activate'");
    expect(swContent).toContain("addEventListener('fetch'");

    // Checks for core routes in cache
    expect(swContent).toContain("'/doctor'");
    expect(swContent).toContain("'/view'");
    expect(swContent).toContain("'/pharmacy'");

    // Checks for offline navigation fallback logic
    expect(swContent).toContain("request.mode === 'navigate'");
  });

  it('should ensure vector and touch icons exist', () => {
    const svgPath = path.join(publicDir, 'icons', 'icon.svg');
    const appleTouchPath = path.join(publicDir, 'icons', 'apple-touch-icon.png');
    expect(fs.existsSync(svgPath)).toBe(true);
    expect(fs.existsSync(appleTouchPath)).toBe(true);
  });

  it('should demonstrate complete offline cryptographic prescription workflow without network', async () => {
    // 1. Doctor creates and signs prescription completely offline
    const rawPayload = {
      v: 1,
      id: 'RX-OFFLINE-TEST-001',
      doc: {
        n: DEMO_DOCTOR.name,
        sip: DEMO_DOCTOR.sip,
        pk: DEMO_DOCTOR.publicKey,
        faskes: DEMO_DOCTOR.faskes,
      },
      pat: {
        n: 'Pasien Offline',
        a: 28,
        g: 'L' as const,
        phone: '08123456789',
      },
      dt: '2026-10-10',
      rx: [
        {
          n: 'Amoxicillin 500mg',
          q: 15,
          s: '3x1 kaplet sesudah makan',
        },
      ],
    };

    const sig = await signPrescription(rawPayload, DEMO_DOCTOR.privateKey);
    const fullPrescription = { ...rawPayload, sig };

    // 2. Encode to URL with hash fragment
    const fullUrl = encodePrescriptionToUrl(fullPrescription, 'https://mediqr.local');
    expect(fullUrl).toContain('#d=');

    // 3. Extract hash (simulating browser reading window.location.hash in airplane mode)
    const hash = fullUrl.substring(fullUrl.indexOf('#'));

    // 4. Decode payload offline from hash
    const decoded = decodePrescriptionFromUrlHash(hash);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe('RX-OFFLINE-TEST-001');
    expect(decoded?.rx[0].n).toBe('Amoxicillin 500mg');

    // 5. Verify Ed25519 signature offline using public key included in payload
    const isValid = await verifyPrescriptionSignature(decoded!);
    expect(isValid).toBe(true);
  });
});
