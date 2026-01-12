import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { lessonsApiService } from '@/services/api/lessons/lessons.service';
import type { Lesson, LessonsQueryParams } from '@/services/api/types/lessons.types';

export interface LessonsFilters {
  searchTerm?: string;
  gradeId?: string;
  classroomId?: string;
  materialId?: string;
  teacherId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
}

export interface LessonsState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  filters: LessonsFilters;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  isInitialized: boolean;
}

export interface FetchLessonsPayload {
  page?: number;
  limit?: number;
  filters?: LessonsFilters;
}

export interface FetchLessonsResponse {
  data: Lesson[];
}

const initialState: LessonsState = {
  lessons: [],
  currentLesson: null,
  filters: {},
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: null,
  isInitialized: false,
};

export const fetchLessons = createAsyncThunk<FetchLessonsResponse, FetchLessonsPayload | void>(
  'lessons/fetchLessons',
  async (payload, { rejectWithValue }) => {
    try {
      const params: LessonsQueryParams = {};

      if (payload) {
        if (payload.page !== undefined) params.PageIndex = payload.page;
        if (payload.limit !== undefined) params.PageSize = payload.limit;

        if (payload.filters) {
          const {
            searchTerm,
            gradeId,
            classroomId,
            materialId,
            teacherId,
            date,
            fromDate,
            toDate,
          } = payload.filters;
          if (searchTerm) params.Search = searchTerm;
          if (gradeId) params.GradeId = gradeId;
          if (classroomId) params.ClassroomId = classroomId;
          if (materialId) params.MaterialId = materialId;
          if (teacherId) params.TeacherId = teacherId;
          if (date) params.Date = date;
          if (fromDate) params.FromDate = fromDate;
          if (toDate) params.ToDate = toDate;
        }
      }

      const response = await lessonsApiService.getLessons(params);

      if (!response.data) {
        return { data: [] };
      }

      return {
        data: response.data.lessons || [],
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchLessonById = createAsyncThunk<Lesson, string>(
  'lessons/fetchLessonById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await lessonsApiService.getLessonById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteLessonById = createAsyncThunk<string, string>(
  'lessons/deleteLesson',
  async (id, { rejectWithValue }) => {
    try {
      await lessonsApiService.deleteLesson(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<LessonsFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch lessons
    builder
      .addCase(fetchLessons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lessons = action.payload.data;
        state.isInitialized = true;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      });

    // Fetch lesson by ID
    builder
      .addCase(fetchLessonById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLesson = action.payload;
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete lesson
    builder
      .addCase(deleteLessonById.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteLessonById.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.lessons = state.lessons.filter((lesson) => lesson.id !== action.payload);
      })
      .addCase(deleteLessonById.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearError, clearCurrentLesson, resetState } =
  lessonsSlice.actions;

export default lessonsSlice.reducer;
