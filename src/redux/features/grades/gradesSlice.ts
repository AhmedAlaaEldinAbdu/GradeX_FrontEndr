import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gradeApiService } from '@/services/api/grades/grades.service';
import { getErrorMessage } from '@/lib/http';
import type { GradeDto, GradeQueryParams } from '@/services/api/types/grades.types';

// ============================================================================
// Types
// ============================================================================

export interface GradesState {
  grades: GradeDto[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Thunks
// ============================================================================

const normalizeOptionalParam = (value?: string) => {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
};

export const fetchGrades = createAsyncThunk<GradeDto[], string | GradeQueryParams | undefined>(
  'grades/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const schoolBranchIdParam =
        typeof params === 'string'
          ? normalizeOptionalParam(params)
          : normalizeOptionalParam(params?.SchoolBranchId);

      const normalizedParams: GradeQueryParams =
        typeof params === 'string'
          ? {
            PageIndex: 1,
            PageSize: 1000,
            SchoolBranchId: schoolBranchIdParam,
          }
          : {
            PageIndex: params?.PageIndex ?? 1,
            PageSize: params?.PageSize ?? 1000,
            NameAr: normalizeOptionalParam(params?.NameAr),
            NameEn: normalizeOptionalParam(params?.NameEn),
            AcdemicSubsystemId: normalizeOptionalParam(params?.AcdemicSubsystemId),
            AcdemicsystemId: normalizeOptionalParam(params?.AcdemicsystemId),
            SchoolBranchId: schoolBranchIdParam,
          };

      const response = await gradeApiService.getGrades({
        ...normalizedParams,
      });
      return response.value?.gradeDtos ?? [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const initialState: GradesState = {
  grades: [],
  isLoading: false,
  error: null,
};

const gradesSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrades.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGrades.fulfilled, (state, action) => {
        state.isLoading = false;
        state.grades = action.payload;
      })
      .addCase(fetchGrades.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default gradesSlice.reducer;
