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
import { decryptAccessToken } from '@gradex/lib/auth/token-crypto';
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
  });

  if (!token || !userData) {
    logger.warn('Session restore failed - no token or user data');
    tokenManager.clearTokens();
    throw new Error('No valid session found');
  }

  // Convert StoredUserData to User type
  const user: User = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role as UserRoleType,
    avatar: userData.avatar,
    isAuthenticated: true,
    permissions: userData.permissions ?? [],
    schoolId: userData.schoolId ?? null,
    schoolBrancheId: userData.schoolBrancheId ?? userData.schoolBranchId ?? null,
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

      const jwtClaimBranchId = userData.schoolBrancheId ?? userData.schoolBranchId ?? null;
      const branchIdFromResponse = response.schoolBrancheId ?? null;
      const branchId: string | null = jwtClaimBranchId ?? branchIdFromResponse;

      userData.schoolBrancheId = branchId;
      userData.schoolBranchId = branchId;

      // Derive role from schoolBrancheId: null = SuperAdmin, non-null = SchoolAdmin
      const derivedRole: UserRoleType = branchId ? UserRole.SCHOOL_ADMIN : UserRole.SUPER_ADMIN;

      userData.role = derivedRole;

      // Store token and user data
      const rememberMe = credentials.rememberMe ?? false;
      tokenManager.setToken(response.token, rememberMe);
      tokenManager.setUserData(userData, rememberMe);

      // Generate and store mock refresh token
      const refreshToken = generateMockRefreshToken();
      tokenManager.setRefreshToken(refreshToken, rememberMe);

      logger.success('Login successful - Token stored', {
        rememberMe,
        branchIdSource: jwtClaimBranchId ? 'jwt-claim' : branchIdFromResponse ? 'response' : 'none',
        tokenPreview: response.token.substring(0, 30) + '...',
        storage: rememberMe ? 'localStorage' : 'sessionStorage',
      });

      return {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: derivedRole,
          isAuthenticated: true,
          permissions: userData.permissions ?? [],
          schoolId: userData.schoolId ?? null,
          schoolBrancheId: branchId,
        },
        token: response.token,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Async thunk for completing login from an SSO callback.
 */
export const loginWithCallbackToken = createAsyncThunk(
  'auth/loginWithCallbackToken',
  async (
    args: {
      encryptedToken: string;
      schoolBrancheId?: string | null;
      rememberMe?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const jwt = await decryptAccessToken(args.encryptedToken);

      const userData = decodeJwtToken(jwt);
      if (!userData) {
        throw new Error('Failed to decode user data from token');
      }

      const jwtClaimBranchId = userData.schoolBrancheId ?? userData.schoolBranchId ?? null;
      const explicitBranchId =
        args.schoolBrancheId && args.schoolBrancheId.length > 0 ? args.schoolBrancheId : null;
      const branchId: string | null = jwtClaimBranchId ?? explicitBranchId;

      const derivedRole: UserRoleType = branchId ? UserRole.SCHOOL_ADMIN : UserRole.SUPER_ADMIN;

      userData.role = derivedRole;
      userData.schoolBrancheId = branchId;
      userData.schoolBranchId = branchId;

      const rememberMe = args.rememberMe ?? true;
      tokenManager.setToken(jwt, rememberMe);
      tokenManager.setUserData(userData, rememberMe);
      tokenManager.setRefreshToken(generateMockRefreshToken(), rememberMe);

      logger.success('Callback login successful - Token stored', {
        rememberMe,
        branchIdSource: jwtClaimBranchId ? 'jwt-claim' : explicitBranchId ? 'url-param' : 'none',
        tokenPreview: jwt.substring(0, 30) + '...',
        storage: rememberMe ? 'localStorage' : 'sessionStorage',
      });

      return {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: derivedRole,
          isAuthenticated: true,
          permissions: userData.permissions ?? [],
          schoolId: userData.schoolId ?? null,
          schoolBrancheId: branchId,
        },
        token: jwt,
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

    // Callback Login (SSO)
    builder
      .addCase(loginWithCallbackToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        logger.debug('Callback login pending...');
      })
      .addCase(loginWithCallbackToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        logger.success('Callback login fulfilled - Redux state updated', {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
        });
      })
      .addCase(loginWithCallbackToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = (action.payload as string) || action.error.message || 'Callback login failed';
        logger.error('Callback login rejected', state.error);
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
