import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './authTypes';
import { UserRole, type UserRoleType } from '@gradex/constants';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
};

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
      },
      token: 'mock-token',
    };
  }
);

/**
 * Async thunk for user logout
 */
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('authToken');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set user manually
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    /**
     * Clear user session
     */
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.error = null;
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
