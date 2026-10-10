import LZString from 'lz-string';
import type { PrescriptionPayload } from './types';

/**
 * Encodes a complete prescription payload into a compressed URL hash.
 */
export function encodePrescriptionToUrl(
  payload: PrescriptionPayload,
  baseUrl: string = ''
): string {
  const jsonString = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/view#d=${compressed}`;
}

/**
 * Decodes and parses a prescription payload from a URL hash string.
 * Example hashString: "#d=..." or "d=..."
 */
export function decodePrescriptionFromUrlHash(
  hashString: string
): PrescriptionPayload | null {
  try {
    if (!hashString) return null;

    let raw = hashString.startsWith('#') ? hashString.slice(1) : hashString;
    if (!raw) return null;

    let encodedData = '';
    if (raw.startsWith('d=')) {
      encodedData = raw.slice(2);
    } else {
      // Fallback: check query param style or direct compressed string
      const match = raw.match(/(?:^|&)d=([^&]+)/);
      if (match) {
        encodedData = match[1];
      } else {
        encodedData = raw;
      }
    }

    if (!encodedData) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
    if (!decompressed) return null;

    const payload = JSON.parse(decompressed) as PrescriptionPayload;

    // Validate essential schema attributes
    if (
      !payload ||
      typeof payload !== 'object' ||
      !payload.id ||
      !payload.doc ||
      !payload.pat ||
      !Array.isArray(payload.rx) ||
      !payload.sig
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
