import CryptoJS from 'crypto-js';

import { logger } from '@/lib/utils/logger';

const AUTH_TOKEN_SECRET_KEY = import.meta.env.VITE_AUTH_TOKEN_SECRET_KEY as string | undefined;

export const decryptAccessToken = async (encryptedToken: string): Promise<string> => {
  console.log('***************');
  console.log('***************');
  console.log('***************');
  console.log(AUTH_TOKEN_SECRET_KEY);
  console.log('***************');
  console.log('***************');
  if (!AUTH_TOKEN_SECRET_KEY) {
    throw new Error(
      'Auth token secret key is not configured. Set VITE_AUTH_TOKEN_SECRET_KEY in your environment.'
    );
  }

  const trimmed = encryptedToken.trim();
  if (!trimmed) {
    throw new Error('Encrypted access token is empty.');
  }

  try {
    const bytes = CryptoJS.AES.decrypt(trimmed, AUTH_TOKEN_SECRET_KEY);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) {
      throw new Error('Decryption produced an empty token.');
    }

    try {
      const parsed = JSON.parse(plaintext);
      if (typeof parsed === 'string') return parsed;
      return JSON.stringify(parsed);
    } catch {
      return plaintext;
    }
  } catch (error) {
    console.log('***************');
    console.log(error);
    console.log('***************');
    logger.error('Failed to decrypt access token', error);
    throw new Error('Failed to decrypt access token.');
  }
};
