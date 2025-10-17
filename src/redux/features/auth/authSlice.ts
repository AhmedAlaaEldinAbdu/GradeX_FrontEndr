import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './authTypes';
import { UserRole, type UserRoleType } from '@gradex/constants';
import {
  tokenManager,
  type StoredUserData,
  generateMockRefreshToken,
} from '@gradex/lib/auth/token-manager';

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

  if (!token || !userData || tokenManager.isTokenExpired()) {
    tokenManager.clearTokens();
    throw new Error('No valid session found');
  }

  return {
    user: userData,
    token,
  };
});

/**
 * Async thunk for user login
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    // TODO: Replace with real API call
    return {
      user: {
        id: 1,
        name: 'Admin user',
        email: credentials.email,
        role: UserRole.SUPER_ADMIN,
        isAuthenticated: false,
      },
      token: 'mock-token',
    };
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
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true; // Session check complete
        state.isAuthenticated = true;
        state.user = action.payload.user as User;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true; // Session check complete (no valid session)
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
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
