import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './authTypes';
import { UserRole, type UserRoleType } from '@gradex/constants';
import {
  tokenManager,
  type StoredUserData,
  generateMockRefreshToken,
  decodeJwtToken,
} from '@gradex/lib/auth/token-manager';
import { authApiService } from '@/services/api/auth/auth.service';
import { getErrorMessage } from '@/lib/http';
import type { LoginRequest } from '@/services/api/types/auth.types';
import { logger } from '@/lib/utils/logger';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false, // Start as false until initial session check completes
  error: null,
  token: null,
};

/**
 * Async thunk for restoring user session from storage
 */
export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const token = tokenManager.getToken();
  const userData = tokenManager.getUserData();

  logger.info('Attempting to restore session', {
    hasToken: !!token,
    hasUserData: !!userData,
    isExpired: token ? tokenManager.isTokenExpired() : 'no token',
  });

  if (!token || !userData || tokenManager.isTokenExpired()) {
    logger.warn('Session restore failed - clearing tokens');
    tokenManager.clearTokens();
    throw new Error('No valid session found');
  }

  // Convert StoredUserData to User type
  const user: User = {
    id: Number(userData.id) || 0,
    name: userData.name,
    email: userData.email,
    role: userData.role as UserRoleType,
    avatar: userData.avatar,
    isAuthenticated: true,
  };

  logger.success('Session restored successfully', user);

  return {
    user,
    token,
  };
});

/**
 * Async thunk for user login
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest & { rememberMe?: boolean }, { rejectWithValue }) => {
    try {
      // Call the real API
      const response = await authApiService.login({
        email: credentials.email,
        password: credentials.password,
      });

      // Decode the JWT token to extract user data
      const userData = decodeJwtToken(response.token);

      if (!userData) {
        throw new Error('Failed to decode user data from token');
      }

      // Store token and user data
      const rememberMe = credentials.rememberMe ?? false;
      tokenManager.setToken(response.token, rememberMe);
      tokenManager.setUserData(userData, rememberMe);

      // Generate and store mock refresh token
      const refreshToken = generateMockRefreshToken();
      tokenManager.setRefreshToken(refreshToken, rememberMe);

      logger.success('Login successful - Token stored', {
        rememberMe,
        tokenPreview: response.token.substring(0, 30) + '...',
        storage: rememberMe ? 'localStorage' : 'sessionStorage',
      });

      return {
        user: {
          id: Number(userData.id) || 0,
          name: userData.name,
          email: userData.email,
          // role: userData.role as UserRoleType,
          role: UserRole.SCHOOL_ADMIN as UserRoleType, // TODO: Remove this line after backend integration
          isAuthenticated: true,
        },
        token: response.token,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Async thunk for user logout
 */
export const logout = createAsyncThunk('auth/logout', async () => {
  tokenManager.clearTokens();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set user manually (with token persistence)
     */
    setUser: (state, action: PayloadAction<User & { rememberMe?: boolean; token?: string }>) => {
      const { rememberMe = false, token, ...user } = action.payload;

      state.user = user as User;
      state.isAuthenticated = user.isAuthenticated ?? false;
      state.error = null;

      // Persist to storage if authenticated
      if (user.isAuthenticated && token) {
        state.token = token;
        tokenManager.setToken(token, rememberMe);
        tokenManager.setUserData(user as StoredUserData, rememberMe);

        // Also save refresh token (mock)
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          tokenManager.setRefreshToken(generateMockRefreshToken(), rememberMe);
        }
      }
    },
    /**
     * Clear user session
     */
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.error = null;
      tokenManager.clearTokens();
    },
    /**
     * Update user role
     */
    setUserRole: (state, action: PayloadAction<UserRoleType>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    // Restore Session
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        logger.debug('Restore session pending...');
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true; // Session check complete
        state.isAuthenticated = true;
        state.user = action.payload.user as User;
        state.token = action.payload.token;
        state.error = null;
        logger.success('Restore session fulfilled - User authenticated', action.payload.user);
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true; // Session check complete (no valid session)
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
        logger.info('Restore session rejected - No valid session');
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        logger.debug('Login pending...');
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true; // Mark as initialized after successful login
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        logger.success('Login fulfilled - Redux state updated', {
          isAuthenticated: state.isAuthenticated,
          isInitialized: state.isInitialized,
          user: state.user,
          hasToken: !!state.token,
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true; // Mark as initialized even on failure
        state.error = action.error.message || 'Login failed';
        logger.error('Login rejected', action.error.message);
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { setUser, clearUser, setUserRole } = authSlice.actions;
export default authSlice.reducer;
