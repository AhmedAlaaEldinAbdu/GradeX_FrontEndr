/**
 * Token Crypto Utilities
 *
 * Decrypts encrypted access tokens received via SSO callback URLs
 * (e.g. `/auth/callback?access_token=<encrypted>`).
 *
 * Encryption scheme expected from the backend:
 *   - Algorithm: AES-256-CBC, PKCS#7 padding
 *   - Key:       SHA-256 digest of the shared secret
 *   - IV:        random 16 bytes, prepended to the ciphertext
 *   - Encoding:  the (IV || ciphertext) buffer is base64 (or base64url) encoded
 *               and may additionally be URI-encoded inside the query string
 *
 * The secret is read from the `VITE_AUTH_TOKEN_SECRET_KEY` environment variable.
 */

import { logger } from '@/lib/utils/logger';

const AUTH_TOKEN_SECRET_KEY = import.meta.env.VITE_AUTH_TOKEN_SECRET_KEY as string | undefined;

const IV_LENGTH_BYTES = 16;

const base64ToBytes = (input: string): Uint8Array => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const deriveKey = async (secret: string): Promise<CryptoKey> => {
  const secretBytes = new TextEncoder().encode(secret);
  const hashed = await crypto.subtle.digest('SHA-256', secretBytes);
  return crypto.subtle.importKey('raw', hashed, { name: 'AES-CBC' }, false, ['decrypt']);
};

/**
 * Decrypt an encrypted access token using the shared secret.
 *
 * @param encryptedToken Encrypted token from the callback URL (already URI-decoded
 *                       by URLSearchParams). Whitespace is tolerated.
 * @returns The plaintext JWT string ready to be fed into `decodeJwtToken`.
 */
export const decryptAccessToken = async (encryptedToken: string): Promise<string> => {
  if (!AUTH_TOKEN_SECRET_KEY) {
    throw new Error(
      'Auth token secret key is not configured. Set VITE_AUTH_TOKEN_SECRET_KEY in your environment.'
    );
  }

  const trimmed = encryptedToken.trim();
  if (!trimmed) {
    throw new Error('Encrypted access token is empty.');
  }

  const payload = base64ToBytes(trimmed);
  if (payload.length <= IV_LENGTH_BYTES) {
    throw new Error('Encrypted access token is malformed (payload too short).');
  }

  const iv = payload.slice(0, IV_LENGTH_BYTES);
  const ciphertext = payload.slice(IV_LENGTH_BYTES);

  try {
    const key = await deriveKey(AUTH_TOKEN_SECRET_KEY);
    const plaintextBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, ciphertext);
    const plaintext = new TextDecoder().decode(plaintextBuffer).trim();
    if (!plaintext) {
      throw new Error('Decryption produced an empty token.');
    }
    return plaintext;
  } catch (error) {
    logger.error('Failed to decrypt access token', error);
    throw new Error('Failed to decrypt access token.');
  }
};
