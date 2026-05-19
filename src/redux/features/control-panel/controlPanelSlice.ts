import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { controlPanelApiService } from '@/services/api/control-panel/control-panel.service';
import type {
  DashboardMetrics,
  AttendanceStageStat,
} from '@/services/api/types/control-panel.types';
import { getErrorMessage } from '@/lib/http';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

// ============================================================================
// Types
// ============================================================================

export interface ControlPanelState {
  dashboardMetrics: DashboardMetrics | null;
  attendanceStatistics: AttendanceStageStat[];
  attendanceChangePercentage: number | null;
  attendanceIsIncrease: boolean | null;
  isLoading: boolean;
  isAttendanceLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface AttendanceStatisticsResult {
  stages: AttendanceStageStat[];
  changePercentage: number | null;
  isIncrease: boolean | null;
}

export interface FetchDashboardMetricsPayload {
  schoolBranchId?: string;
}

export interface FetchAttendanceStatisticsPayload {
  filterType: number;
  schoolBranchId?: string;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: ControlPanelState = {
  dashboardMetrics: null,
  attendanceStatistics: [],
  attendanceChangePercentage: null,
  attendanceIsIncrease: null,
  isLoading: false,
  isAttendanceLoading: false,
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

export const fetchAttendanceStatistics = createAsyncThunk<
  AttendanceStatisticsResult,
  FetchAttendanceStatisticsPayload
>('controlPanel/fetchAttendanceStatistics', async (payload, { rejectWithValue }) => {
  try {
    const schoolBranchId = payload.schoolBranchId || getCurrentSchoolBranchId();

    if (!schoolBranchId) {
      return rejectWithValue('School branch ID is missing');
    }

    const response = await controlPanelApiService.getAttendanceStatistics({
      SchoolBranchId: schoolBranchId,
      FilterType: payload.filterType,
    });

    if (!response?.isSuccess || !response.data) {
      return rejectWithValue(response?.message || 'Failed to fetch attendance statistics');
    }

    return {
      stages: response.data,
      changePercentage: response.changePercentage ?? null,
      isIncrease: response.isIncrease ?? null,
    };
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

    builder
      .addCase(fetchAttendanceStatistics.pending, (state) => {
        state.isAttendanceLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAttendanceStatistics.fulfilled,
        (state, action: PayloadAction<AttendanceStatisticsResult>) => {
          state.isAttendanceLoading = false;
          state.attendanceStatistics = action.payload.stages;
          state.attendanceChangePercentage = action.payload.changePercentage;
          state.attendanceIsIncrease = action.payload.isIncrease;
        }
      )
      .addCase(fetchAttendanceStatistics.rejected, (state, action) => {
        state.isAttendanceLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// Exports
// ============================================================================

export const { clearError } = controlPanelSlice.actions;

export default controlPanelSlice.reducer;
