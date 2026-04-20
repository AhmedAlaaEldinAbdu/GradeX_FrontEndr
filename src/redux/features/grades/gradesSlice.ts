import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gradeApiService } from '@/services/api/grades/grades.service';
import { getErrorMessage } from '@/lib/http';
import type { GradeDto } from '@/services/api/types/grades.types';

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

export const fetchGrades = createAsyncThunk<GradeDto[], string>(
  'grades/fetchAll',
  async (schoolBranchId, { rejectWithValue }) => {
    try {
      const response = await gradeApiService.getGrades({
        PageIndex: 1,
        PageSize: 1000,
        SchoolBranchId: schoolBranchId,
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
