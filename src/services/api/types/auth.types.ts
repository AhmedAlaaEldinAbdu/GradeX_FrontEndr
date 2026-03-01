/**
 * Authentication API Types
 * Types for authentication requests and responses
 */

// ============================================================================
// Login Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  message: string;
  token: string;
  schoolBrancheId?: string | null;
}

// ============================================================================
// JWT Token Payload (decoded from token)
// ============================================================================

export interface JwtTokenPayload {
  sub: string; // User ID
  jti: string; // JWT ID
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone': string;
  FullName: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  exp: number; // Expiration timestamp
  iss: string; // Issuer
  aud: string; // Audience
}

// ============================================================================
// User Data (extracted from JWT)
// ============================================================================

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ============================================================================
// Register Types
// ============================================================================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

// ============================================================================
// Forgot Password Types
// ============================================================================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

// ============================================================================
// Reset Password Types
// ============================================================================

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// ============================================================================
// Verify OTP Types
// ============================================================================

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  token?: string;
}

// ============================================================================
// Refresh Token Types
// ============================================================================

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  message: string;
  token: string;
  refreshToken?: string;
}

// ============================================================================
// Logout Types
// ============================================================================

export interface LogoutResponse {
  message: string;
}
