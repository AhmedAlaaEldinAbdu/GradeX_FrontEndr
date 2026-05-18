import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { controlPanelApiService } from '@/services/api/control-panel/control-panel.service';
import type { DashboardMetrics } from '@/services/api/types/control-panel.types';
import { getErrorMessage } from '@/lib/http';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

// ============================================================================
// Types
// ============================================================================

export interface ControlPanelState {
  dashboardMetrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface FetchDashboardMetricsPayload {
  schoolBranchId?: string;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: ControlPanelState = {
  dashboardMetrics: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

export const fetchDashboardMetrics = createAsyncThunk<
  DashboardMetrics,
  FetchDashboardMetricsPayload | void
>('controlPanel/fetchDashboardMetrics', async (payload, { rejectWithValue }) => {
  try {
    const schoolBranchId = payload?.schoolBranchId || getCurrentSchoolBranchId();

    if (!schoolBranchId) {
      return rejectWithValue('School branch ID is missing');
    }

    const response = await controlPanelApiService.getDashboardMetrics({
      SchoolBranchId: schoolBranchId,
    });

    if (!response?.isSuccess || !response.data) {
      return rejectWithValue(response?.message || 'Failed to fetch dashboard metrics');
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ============================================================================
// Slice
// ============================================================================

const controlPanelSlice = createSlice({
  name: 'controlPanel',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ControlPanelState>) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardMetrics.fulfilled,
        (state, action: PayloadAction<DashboardMetrics>) => {
          state.isLoading = false;
          state.dashboardMetrics = action.payload;
          state.isInitialized = true;
        }
      )
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// Exports
// ============================================================================

export const { clearError } = controlPanelSlice.actions;

export default controlPanelSlice.reducer;
