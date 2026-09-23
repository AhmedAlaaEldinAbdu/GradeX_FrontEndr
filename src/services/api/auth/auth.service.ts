/**
 * Authentication API Service
 * Handles all API calls related to authentication using Axios
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { AuthEndpoints } from '../endpoints/auth-endpoints';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
} from '@/services/api/types/auth.types';

// ============================================================================
// Authentication Operations
// ============================================================================

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response: AxiosResponse<LoginResponse> = await axiosClient.post(
    AuthEndpoints.login,
    credentials
  );

  return response.data;
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response: AxiosResponse<RegisterResponse> = await axiosClient.post(
    AuthEndpoints.register,
    data
  );

  return response.data;
}

/**
 * Logout current user
 */
export async function logout(): Promise<LogoutResponse> {
  const response: AxiosResponse<LogoutResponse> = await axiosClient.post(AuthEndpoints.logout);

  return response.data;
}

/**
 * Refresh authentication token
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  const response: AxiosResponse<RefreshTokenResponse> = await axiosClient.post(
    AuthEndpoints.refresh,
    data
  );

  return response.data;
}

// ============================================================================
// Password Management
// ============================================================================

/**
 * Request password reset (forgot password)
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const response: AxiosResponse<ForgotPasswordResponse> = await axiosClient.post(
    AuthEndpoints.forgotPassword,
    data
  );

  return response.data;
}

/**
 * Reset password with token
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response: AxiosResponse<ResetPasswordResponse> = await axiosClient.post(
    AuthEndpoints.resetPassword,
    data
  );

  return response.data;
}

/**
 * Change password for the currently authenticated user.
 */
export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response: AxiosResponse<ChangePasswordResponse> = await axiosClient.post(
    AuthEndpoints.changePassword,
    data
  );

  return response.data;
}

// ============================================================================
// OTP Verification
// ============================================================================

/**
 * Verify OTP code
 */
export async function verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const response: AxiosResponse<VerifyOtpResponse> = await axiosClient.post(
    AuthEndpoints.verifyOtp,
    data
  );

  return response.data;
}

/**
 * Verify email address
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response: AxiosResponse<{ message: string }> = await axiosClient.post(
    AuthEndpoints.verifyEmail,
    { token }
  );

  return response.data;
}

// ============================================================================
// Export All Services
// ============================================================================

export const authApiService = {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyOtp,
  verifyEmail,
};

export default authApiService;
