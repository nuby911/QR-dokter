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
 * Decodes and parses a prescription payload from a URL string, hash string, or query string.
 * Supports:
 * - "http://192.168.1.7:3000/view#d=..."
 * - "http://192.168.1.7:3000/view?d=..."
 * - "#d=..."
 * - "?d=..."
 * - "d=..."
 * - Raw encoded string
 */
export function decodePrescriptionFromUrlHash(
  inputString: string
): PrescriptionPayload | null {
  try {
    if (!inputString || typeof inputString !== 'string') return null;

    let target = inputString.trim();

    // 1. If it's a full URL, extract the relevant hash or search component
    if (target.includes('#')) {
      target = target.substring(target.indexOf('#') + 1);
    } else if (target.includes('?')) {
      target = target.substring(target.indexOf('?') + 1);
    }

    if (target.startsWith('#') || target.startsWith('?')) {
      target = target.slice(1);
    }

    // 2. Extract the 'd' parameter value
    let encodedData = '';
    if (target.startsWith('d=')) {
      encodedData = target.slice(2);
    } else {
      const match = target.match(/(?:^|[&?])d=([^&]+)/);
      if (match) {
        encodedData = match[1];
      } else {
        encodedData = target;
      }
    }

    if (!encodedData) return null;

    // Clean any trailing query parameters if attached
    if (encodedData.includes('&')) {
      encodedData = encodedData.split('&')[0];
    }

    // 3. Decompress with multiple fallback strategies to handle various mobile browsers:
    // Some mobile browsers pre-decode URL components, convert '+' to ' ', or keep them encoded
    const normalizedData = encodedData.replace(/ /g, '+');
    let decompressed: string | null = null;

    try {
      decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
    } catch {
      decompressed = null;
    }

    if (!decompressed && normalizedData !== encodedData) {
      try {
        decompressed = LZString.decompressFromEncodedURIComponent(normalizedData);
      } catch {
        decompressed = null;
      }
    }

    if (!decompressed) {
      try {
        decompressed = LZString.decompressFromEncodedURIComponent(
          encodeURIComponent(encodedData)
        );
      } catch {
        decompressed = null;
      }
    }

    if (!decompressed) {
      try {
        decompressed = LZString.decompressFromEncodedURIComponent(
          decodeURIComponent(encodedData)
        );
      } catch {
        decompressed = null;
      }
    }

    if (!decompressed) {
      try {
        decompressed = LZString.decompress(encodedData);
      } catch {
        decompressed = null;
      }
    }

    // Direct JSON fallback in case plain text was provided
    if (!decompressed && (encodedData.startsWith('{') || encodedData.startsWith('%7B'))) {
      try {
        decompressed = decodeURIComponent(encodedData);
      } catch {
        decompressed = encodedData;
      }
    }

    if (!decompressed) return null;

    const payload = JSON.parse(decompressed) as PrescriptionPayload;

    // Deep schema validation to prevent runtime exceptions in UI
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof payload.id !== 'string' ||
      typeof payload.sig !== 'string' ||
      !payload.doc ||
      typeof payload.doc.n !== 'string' ||
      typeof payload.doc.pk !== 'string' ||
      !payload.pat ||
      typeof payload.pat.n !== 'string' ||
      !Array.isArray(payload.rx) ||
      payload.rx.length === 0
    ) {
      return null;
    }

    // Ensure all medication items have minimum required attributes
    for (const item of payload.rx) {
      if (!item || typeof item !== 'object' || typeof item.n !== 'string') {
        return null;
      }
    }

    return payload;
  } catch (err) {
    console.error('Error decoding prescription payload:', err);
    return null;
  }
}
