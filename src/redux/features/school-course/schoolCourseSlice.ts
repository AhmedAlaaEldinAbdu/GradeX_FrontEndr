import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { schoolCourseApiService } from '@/services/api/school-course/school-course.service';
import type {
  SchoolCourse,
  SchoolCourseQueryParams,
  SchoolCoursesListData,
  CreateSchoolCourseRequest,
  UpdateSchoolCourseRequest,
} from '@/services/api/types/school-course.types';
import { getErrorMessage } from '@/lib/http';

// ============================================================================
// State
// ============================================================================

export interface SchoolCourseState {
  // Data
  courses: SchoolCourse[];
  currentCourse: SchoolCourse | null;
  activeCoursesCount: number;
  totalStudentsCount: number;

  // Pagination
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;

  // Error
  error: string | null;

  isInitialized: boolean;
}

const initialState: SchoolCourseState = {
  courses: [],
  currentCourse: null,
  activeCoursesCount: 0,
  totalStudentsCount: 0,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  isInitialized: false,
};

// ============================================================================
// Thunks
// ============================================================================

export const fetchSchoolCourses = createAsyncThunk<
  SchoolCoursesListData,
  SchoolCourseQueryParams | void
>('schoolCourses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await schoolCourseApiService.getSchoolCourses(params ?? undefined);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchSchoolCourseById = createAsyncThunk<SchoolCourse, string>(
  'schoolCourses/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await schoolCourseApiService.getSchoolCourseById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createSchoolCourse = createAsyncThunk<SchoolCourse, CreateSchoolCourseRequest>(
  'schoolCourses/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await schoolCourseApiService.createSchoolCourse(data);
      if (!response.isSuccess) {
        return rejectWithValue(response.message || 'Failed to create course');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSchoolCourse = createAsyncThunk<SchoolCourse, UpdateSchoolCourseRequest>(
  'schoolCourses/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await schoolCourseApiService.updateSchoolCourse(data);
      if (!response.isSuccess) {
        return rejectWithValue(response.message || 'Failed to update course');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const schoolCourseSlice = createSlice({
  name: 'schoolCourses',
  initialState,
  reducers: {
    setCurrentCourse: (state, action: PayloadAction<SchoolCourse | null>) => {
      state.currentCourse = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<SchoolCourseState>) => {
    // Fetch list
    builder
      .addCase(fetchSchoolCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchSchoolCourses.fulfilled,
        (state, action: PayloadAction<SchoolCoursesListData>) => {
          state.isLoading = false;
          state.courses = action.payload.schoolCourses ?? [];
          state.activeCoursesCount = action.payload.activeCoursesCount ?? 0;
          state.totalStudentsCount = action.payload.totalStudentsCount ?? 0;
          state.pagination = {
            pageIndex: action.payload.pageIndex ?? 1,
            pageSize: action.payload.pageSize ?? 10,
            totalItems: action.payload.totalItems ?? 0,
            totalPages: action.payload.totalPages ?? 0,
          };
          state.isInitialized = true;
        }
      )
      .addCase(fetchSchoolCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch by id
    builder
      .addCase(fetchSchoolCourseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchoolCourseById.fulfilled, (state, action: PayloadAction<SchoolCourse>) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchSchoolCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createSchoolCourse.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSchoolCourse.fulfilled, (state, action: PayloadAction<SchoolCourse>) => {
        state.isCreating = false;
        if (action.payload) state.courses.unshift(action.payload);
      })
      .addCase(createSchoolCourse.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateSchoolCourse.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSchoolCourse.fulfilled, (state, action: PayloadAction<SchoolCourse>) => {
        state.isUpdating = false;
        if (action.payload) {
          const index = state.courses.findIndex((c) => c.id === action.payload.id);
          if (index !== -1) state.courses[index] = action.payload;
          state.currentCourse = action.payload;
        }
      })
      .addCase(updateSchoolCourse.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentCourse, clearError } = schoolCourseSlice.actions;

export default schoolCourseSlice.reducer;
