import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { subjectApiService } from '@/services/api/subjects/subjects.service';
import type {
  Subject,
  SubjectQueryParams,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from '@/types/subjects';
import { getErrorMessage } from '@/lib/http';

// ============================================================================
// Types
// ============================================================================

export interface SubjectFilters {
  searchName?: string;
  level?: number;
}

export interface SubjectsState {
  // Data
  subjects: Subject[];
  currentSubject: Subject | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: SubjectFilters;

  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error States
  error: string | null;
  validationErrors: Record<string, string> | null;

  // UI States
  selectedSubjectIds: string[];
  isInitialized: boolean;
}

export interface FetchSubjectsPayload {
  page?: number;
  limit?: number;
  filters?: SubjectFilters;
}

export interface FetchSubjectsResponse {
  data: Subject[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: SubjectsState = {
  // Data
  subjects: [],
  currentSubject: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Filters
  filters: {},

  // Loading States
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,

  // Error States
  error: null,
  validationErrors: null,

  // UI States
  selectedSubjectIds: [],
  isInitialized: false,
};

export const fetchSubjects = createAsyncThunk<FetchSubjectsResponse, FetchSubjectsPayload | void>(
  'subjects/fetchSubjects',
  async (payload, { rejectWithValue }) => {
    try {
      const params: Partial<SubjectQueryParams> = {};

      if (payload) {
        if (payload.page) params.PageIndex = payload.page;
        if (payload.limit) params.PageSize = payload.limit;

        if (payload.filters) {
          if (payload.filters.searchName) params.SearchName = payload.filters.searchName;
          if (payload.filters.level) params.Level = payload.filters.level;
        }
      }

      const response = await subjectApiService.getSubjects(params as SubjectQueryParams);

      if (!response?.isSuccess || !response.data) {
        return {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        };
      }

      return {
        data: response.data.materialDto || [],
        meta: {
          total: response.data.totalItems || 0,
          page: response.data.pageIndex || 1,
          limit: response.data.pageSize || 10,
          totalPages: response.data.totalPages || 0,
        },
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSubjectById = createAsyncThunk<Subject, string>(
  'subjects/fetchSubjectById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await subjectApiService.getSubjectById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addSubject = createAsyncThunk<Subject, CreateSubjectRequest>(
  'subjects/addSubject',
  async (data, { rejectWithValue }) => {
    try {
      const response = await subjectApiService.createSubject(data);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteSubject = createAsyncThunk<string, string>(
  'subjects/deleteSubject',
  async (id, { rejectWithValue }) => {
    try {
      await subjectApiService.deleteSubject(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export interface UpdateSubjectPayload {
  id: string;
  data: Omit<UpdateSubjectRequest, 'id'>;
}

export const updateSubject = createAsyncThunk<Subject, UpdateSubjectPayload>(
  'subjects/updateSubject',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await subjectApiService.updateSubject(id, { ...data, id });
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<SubjectsState['filters']>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentSubject: (state, action: PayloadAction<Subject | null>) => {
      state.currentSubject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    selectSubject: (state, action: PayloadAction<string>) => {
      if (!state.selectedSubjectIds.includes(action.payload)) {
        state.selectedSubjectIds.push(action.payload);
      }
    },
    deselectSubject: (state, action: PayloadAction<string>) => {
      state.selectedSubjectIds = state.selectedSubjectIds.filter((id) => id !== action.payload);
    },
    selectAllSubjects: (state) => {
      state.selectedSubjectIds = state.subjects.map((subject) => subject.id);
    },
    clearSelection: (state) => {
      state.selectedSubjectIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<SubjectsState>) => {
    // Fetch Subjects
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action: PayloadAction<FetchSubjectsResponse>) => {
        state.isLoading = false;
        state.subjects = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.isInitialized = true;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Subject By ID
    builder
      .addCase(fetchSubjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubjectById.fulfilled, (state, action: PayloadAction<Subject>) => {
        state.isLoading = false;
        state.currentSubject = action.payload;
      })
      .addCase(fetchSubjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Subject
    builder
      .addCase(addSubject.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(addSubject.fulfilled, (state, action: PayloadAction<Subject>) => {
        state.isCreating = false;
        if (action.payload) {
          state.subjects.unshift(action.payload);
        }
      })
      .addCase(addSubject.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Delete Subject
    builder
      .addCase(deleteSubject.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSubject.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.subjects = state.subjects.filter((subject) => subject.id !== action.payload);
        state.selectedSubjectIds = state.selectedSubjectIds.filter((id) => id !== action.payload);
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Update Subject
    builder
      .addCase(updateSubject.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateSubject.fulfilled, (state, action: PayloadAction<Subject>) => {
        state.isUpdating = false;
        if (action.payload) {
          const index = state.subjects.findIndex((s) => s.id === action.payload.id);
          if (index !== -1) {
            state.subjects[index] = action.payload;
          }
          state.currentSubject = action.payload;
        }
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentSubject,
  clearError,
  selectSubject,
  deselectSubject,
  selectAllSubjects,
  clearSelection,
} = subjectsSlice.actions;

export default subjectsSlice.reducer;
