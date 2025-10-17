/**
 * Token Management Utilities
 * Handles JWT token storage and retrieval with Remember Me support
 */

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';
const REMEMBER_ME_KEY = 'rememberMe';

export interface StoredUserData {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isAuthenticated: boolean;
}

/**
 * Generate a mock JWT token for development
 */
export const generateMockToken = (email: string, role: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: email,
      role: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  );
  const signature = btoa('mock-signature-' + Date.now());
  return `${header}.${payload}.${signature}`;
};

/**
 * Generate a mock refresh token
 */
export const generateMockRefreshToken = (): string => {
  return btoa('refresh-token-' + Date.now() + '-' + Math.random().toString(36));
};

export const tokenManager = {
  /**
   * Get access token
   */
  getToken: (): string | null => {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    if (rememberMe) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return sessionStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set access token
   */
  setToken: (token: string, rememberMe: boolean = false): void => {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_ME_KEY, 'false');
    }
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    if (rememberMe) {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set refresh token
   */
  setRefreshToken: (token: string, rememberMe: boolean = false): void => {
    if (rememberMe) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  /**
   * Get stored user data
   */
  getUserData: (): StoredUserData | null => {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    const userData = storage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Set user data
   */
  setUserData: (userData: StoredUserData, rememberMe: boolean = false): void => {
    const dataString = JSON.stringify(userData);
    if (rememberMe) {
      localStorage.setItem(USER_DATA_KEY, dataString);
    } else {
      sessionStorage.setItem(USER_DATA_KEY, dataString);
    }
  },

  /**
   * Get remember me preference
   */
  getRememberMe: (): boolean => {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  },

  /**
   * Clear all tokens and user data
   */
  clearTokens: (): void => {
    // Clear from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);

    // Clear from sessionStorage
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
  },

  /**
   * Check if user has valid token
   */
  hasToken: (): boolean => {
    return !!tokenManager.getToken();
  },

  /**
   * Check if token is expired (mock implementation)
   */
  isTokenExpired: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return true;

    try {
      // Decode JWT payload (mock)
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      return payload.exp ? payload.exp < now : false;
    } catch {
      return true;
    }
  },
};
