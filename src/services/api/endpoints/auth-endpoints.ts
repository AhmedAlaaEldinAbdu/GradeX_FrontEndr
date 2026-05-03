const AUTH = '/Auth';

export const AuthEndpoints = {
  login: `${AUTH}/login`,
  logout: `${AUTH}/logout`,
  refresh: `${AUTH}/refresh`,
  register: `${AUTH}/register`,
  forgotPassword: `${AUTH}/forgot-password`,
  resetPassword: `${AUTH}/reset-password`,
  changePassword: `${AUTH}/ChangePassword`,
  verifyEmail: `${AUTH}/verify-email`,
  verifyOtp: `${AUTH}/verify-otp`,
};
