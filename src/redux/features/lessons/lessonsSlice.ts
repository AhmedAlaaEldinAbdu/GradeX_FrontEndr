import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { lessonsApiService } from '@/services/api/lessons/lessons.service';
import type {
  Lesson,
  LessonsQueryParams,
  CreateLessonRequest,
  UpdateLessonRequest,
} from '@/services/api/types/lessons.types';
import { addMinutesToTime } from '@/lib/utils/date-utils';
import type { ApiResponseModel } from '@/services/api';

export interface LessonsFilters {
  searchTerm?: string;
  gradeId?: string;
  classroomId?: string;
  materialId?: string;
  teacherId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  schoolBranchesId?: string;
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
            schoolBranchesId,
          } = payload.filters;
          if (searchTerm) params.Search = searchTerm;
          if (gradeId) params.GradeId = gradeId;
          if (classroomId) params.ClassroomId = classroomId;
          if (materialId) params.MaterialId = materialId;
          if (teacherId) params.TeacherId = teacherId;
          if (date) params.Date = date;
          if (fromDate) params.FromDate = fromDate;
          if (toDate) params.ToDate = toDate;
          if (schoolBranchesId) params.SchoolBranchesId = schoolBranchesId;
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

export const createLesson = createAsyncThunk<
  ApiResponseModel<null>,
  { data: CreateLessonRequest; attachmentFiles?: File[] }
>('lessons/createLesson', async ({ data, attachmentFiles }, { rejectWithValue }) => {
  try {
    const response = await lessonsApiService.createLesson(data, attachmentFiles);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

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

// Fetch a lesson without mutating slice state/loading flags (useful for background operations)
export const fetchLessonByIdSilent = createAsyncThunk<Lesson, string>(
  'lessons/fetchLessonByIdSilent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await lessonsApiService.getLessonById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateLesson = createAsyncThunk<ApiResponseModel<null>, UpdateLessonRequest>(
  'lessons/updateLesson',
  async (data, { rejectWithValue }) => {
    try {
      const response = await lessonsApiService.updateLesson(data);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateLessonWithAttachments = createAsyncThunk<
  ApiResponseModel<null>,
  { data: UpdateLessonRequest; attachmentFiles?: File[] }
>('lessons/updateLessonWithAttachments', async ({ data, attachmentFiles }, { rejectWithValue }) => {
  try {
    const response = await lessonsApiService.updateLesson(data, attachmentFiles);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

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

export const recoverAllLessons = createAsyncThunk<
  Lesson[],
  void,
  { state: { lessons: LessonsState } }
>('lessons/recoverAllLessons', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const lessons = state.lessons.lessons;

    if (!lessons || lessons.length === 0) {
      return [];
    }

    // Prepare bulk update data - set endTime to startTime + 45 minutes
    const updateRequests: UpdateLessonRequest[] = lessons.map((lesson) => {
      const newEndTime = addMinutesToTime(lesson.startTime, 45);

      return {
        id: lesson.id,
        materialId: lesson.materialId,
        teacherId: lesson.teacherId,
        bookId: lesson.bookId,
        gradeId: lesson.gradeId,
        classroomId: lesson.classroomId,
        schoolBranchesId: lesson.schoolBranchesId,
        date: lesson.date,
        startTime: lesson.startTime,
        endTime: newEndTime,
        classworkFromPage: lesson.classworkFromPage,
        classworkToPage: lesson.classworkToPage,
        homeworkFromPage: lesson.homeworkFromPage,
        homeworkToPage: lesson.homeworkToPage,
        homeworkDescriptionAr: lesson.homeworkDescriptionAr || '',
        homeworkDescriptionEn: lesson.homeworkDescriptionEn || '',
        isHomeworkForAllStudents: lesson.isHomeworkForAllStudents,
        applyToAllWeeks: lesson.applyToAllWeeks ?? lesson.ApplyToAllWeeks ?? false,
        lessonsStudent: lesson.lessonsStudent.map((s) => ({ studentId: s.studentId })),
        attachments: lesson.attachments.map((a) => ({ fileName: a.fileName, fileUrl: a.fileUrl })),
      };
    });

    // Use bulk update for single API call
    await lessonsApiService.bulkUpdateLessons(updateRequests);

    // Return updated lessons with new endTime
    const updatedLessons = lessons.map((lesson) => ({
      ...lesson,
      endTime: addMinutesToTime(lesson.startTime, 45),
    }));

    return updatedLessons;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

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

    // Update lesson
    builder
      .addCase(updateLesson.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateLesson.fulfilled, (state) => {
        state.isUpdating = false;
      })
      .addCase(updateLesson.rejected, (state, action) => {
        state.isUpdating = false;
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

    // Create lesson
    builder
      .addCase(createLesson.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createLesson.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(createLesson.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update lesson (with attachments)
    builder
      .addCase(updateLessonWithAttachments.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateLessonWithAttachments.fulfilled, (state) => {
        state.isUpdating = false;
      })
      .addCase(updateLessonWithAttachments.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(recoverAllLessons.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(recoverAllLessons.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.lessons = action.payload;
      })
      .addCase(recoverAllLessons.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearError, clearCurrentLesson, resetState } =
  lessonsSlice.actions;

export default lessonsSlice.reducer;
