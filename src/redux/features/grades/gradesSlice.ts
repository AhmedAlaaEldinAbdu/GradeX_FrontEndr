import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gradeApiService } from '@/services/api/grades/grades.service';
import { getErrorMessage } from '@/lib/http';
import type {
  GradeDetailsDto,
  GradeDto,
  GradeQueryParams,
  StageWithGradesDto,
} from '@/services/api/types/grades.types';

// ============================================================================
// Types
// ============================================================================

export interface GradesState {
  grades: GradeDto[];
  totalStudentsCount: number;
  isLoading: boolean;
  error: string | null;
  currentGrade: GradeDetailsDto | null;
  currentGradeLoading: boolean;
  currentGradeError: string | null;
  stages: StageWithGradesDto[];
  stagesTotals: {
    totalStages: number;
    totalGrades: number;
    totalClassrooms: number;
    totalStudents: number;
  };
  isLoadingStages: boolean;
  stagesError: string | null;
}

// ============================================================================
// Thunks
// ============================================================================

interface FetchGradesResult {
  grades: GradeDto[];
  totalStudentsCount: number;
}

const normalizeOptionalParam = (value?: string) => {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
};

export const fetchGrades = createAsyncThunk<
  FetchGradesResult,
  string | GradeQueryParams | undefined
>('grades/fetchAll', async (params, { rejectWithValue }) => {
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
    return {
      grades: response.value?.gradeDtos ?? [],
      totalStudentsCount: response.value?.totalStudentsCount ?? 0,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchGradeById = createAsyncThunk<GradeDetailsDto, string>(
  'grades/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await gradeApiService.getGradeById(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

interface FetchStagesWithGradesResult {
  stages: StageWithGradesDto[];
  totalStages: number;
  totalGrades: number;
  totalClassrooms: number;
  totalStudents: number;
}

export const fetchStagesWithGrades = createAsyncThunk<FetchStagesWithGradesResult, string | void>(
  'grades/fetchStagesWithGrades',
  async (schoolBranchId, { rejectWithValue }) => {
    try {
      const response = await gradeApiService.getStagesWithGrades({
        SchoolBranchId: normalizeOptionalParam(schoolBranchId || undefined),
      });

      if (!response?.isSuccess || !response.data) {
        return {
          stages: [],
          totalStages: 0,
          totalGrades: 0,
          totalClassrooms: 0,
          totalStudents: 0,
        };
      }

      return {
        stages: response.data.stages || [],
        totalStages: response.data.totalStages || 0,
        totalGrades: response.data.totalGrades || 0,
        totalClassrooms: response.data.totalClassrooms || 0,
        totalStudents: response.data.totalStudents || 0,
      };
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
  totalStudentsCount: 0,
  isLoading: false,
  error: null,
  currentGrade: null,
  currentGradeLoading: false,
  currentGradeError: null,
  stages: [],
  stagesTotals: {
    totalStages: 0,
    totalGrades: 0,
    totalClassrooms: 0,
    totalStudents: 0,
  },
  isLoadingStages: false,
  stagesError: null,
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
        state.grades = action.payload.grades;
        state.totalStudentsCount = action.payload.totalStudentsCount;
      })
      .addCase(fetchGrades.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGradeById.pending, (state) => {
        state.currentGradeLoading = true;
        state.currentGradeError = null;
      })
      .addCase(fetchGradeById.fulfilled, (state, action) => {
        state.currentGradeLoading = false;
        state.currentGrade = action.payload;
      })
      .addCase(fetchGradeById.rejected, (state, action) => {
        state.currentGradeLoading = false;
        state.currentGradeError = action.payload as string;
      })
      .addCase(fetchStagesWithGrades.pending, (state) => {
        state.isLoadingStages = true;
        state.stagesError = null;
      })
      .addCase(fetchStagesWithGrades.fulfilled, (state, action) => {
        state.isLoadingStages = false;
        state.stages = action.payload.stages;
        state.stagesTotals = {
          totalStages: action.payload.totalStages,
          totalGrades: action.payload.totalGrades,
          totalClassrooms: action.payload.totalClassrooms,
          totalStudents: action.payload.totalStudents,
        };
      })
      .addCase(fetchStagesWithGrades.rejected, (state, action) => {
        state.isLoadingStages = false;
        state.stagesError = action.payload as string;
      });
  },
});

export default gradesSlice.reducer;
