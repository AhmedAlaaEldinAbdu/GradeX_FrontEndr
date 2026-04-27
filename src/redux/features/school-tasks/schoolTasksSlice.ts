import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { schoolTaskApiService } from '@/services/api/school-tasks/school-tasks.service';
import type {
  CreateSchoolTaskRequest,
  SchoolTask,
  SchoolTaskQueryParams,
  SchoolTaskStatusItem,
  SchoolTaskStatusQueryParams,
  SchoolTaskSubmissionStatus,
  SchoolTaskType,
  StudentSchoolTask,
  StudentSchoolTaskQueryParams,
  UpdateSchoolTaskRequest,
} from '@/types/schoolTasks';

export interface SchoolTaskFilters {
  classroomId?: string;
  materialId?: string;
  taskType?: SchoolTaskType;
  schoolBranchesId?: string;
}

export interface SchoolTaskStatusFilters {
  studentName?: string;
  submissionStatus?: SchoolTaskSubmissionStatus;
}

export interface StudentSchoolTaskFilters {
  studentId?: string;
  date?: string;
  submissionStatus?: SchoolTaskSubmissionStatus;
  materialId?: string;
  taskType?: SchoolTaskType;
}

export interface SchoolTasksState {
  schoolTasks: SchoolTask[];
  currentSchoolTask: SchoolTask | null;
  taskStatuses: SchoolTaskStatusItem[];
  studentSchoolTasks: StudentSchoolTask[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statusPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  studentTasksPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: SchoolTaskFilters;
  statusFilters: SchoolTaskStatusFilters;
  studentTaskFilters: StudentSchoolTaskFilters;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface FetchSchoolTasksPayload {
  page?: number;
  limit?: number;
  filters?: SchoolTaskFilters;
}

export interface FetchSchoolTasksResponse {
  schoolTasks: SchoolTask[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FetchSchoolTaskStatusesPayload {
  id: string;
  page?: number;
  limit?: number;
  filters?: SchoolTaskStatusFilters;
}

export interface FetchSchoolTaskStatusesResponse {
  taskStatuses: SchoolTaskStatusItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FetchStudentSchoolTasksPayload {
  page?: number;
  limit?: number;
  filters?: StudentSchoolTaskFilters;
}

export interface FetchStudentSchoolTasksResponse {
  schoolTasks: StudentSchoolTask[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: SchoolTasksState = {
  schoolTasks: [],
  currentSchoolTask: null,
  taskStatuses: [],
  studentSchoolTasks: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  statusPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  studentTasksPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  statusFilters: {},
  studentTaskFilters: {},
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  isInitialized: false,
};

export const fetchSchoolTasks = createAsyncThunk<
  FetchSchoolTasksResponse,
  FetchSchoolTasksPayload | void
>('schoolTasks/fetchSchoolTasks', async (payload, { rejectWithValue }) => {
  try {
    const params: Partial<SchoolTaskQueryParams> = {};

    if (payload) {
      if (payload.page) params.PageIndex = payload.page;
      if (payload.limit) params.PageSize = payload.limit;

      if (payload.filters) {
        if (payload.filters.classroomId) params.ClassroomId = payload.filters.classroomId;
        if (payload.filters.materialId) params.MaterialId = payload.filters.materialId;
        if (payload.filters.taskType) params.TaskType = payload.filters.taskType;
        if (payload.filters.schoolBranchesId) {
          params.SchoolBranchesId = payload.filters.schoolBranchesId;
        }
      }
    }

    const response = await schoolTaskApiService.getSchoolTasks(params as SchoolTaskQueryParams);

    if (!response?.isSuccess || !response.data) {
      return {
        schoolTasks: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }

    return {
      schoolTasks: response.data.schoolTaskDto || [],
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
});

export const addSchoolTask = createAsyncThunk<SchoolTask, CreateSchoolTaskRequest>(
  'schoolTasks/addSchoolTask',
  async (data, { rejectWithValue }) => {
    try {
      const result = await schoolTaskApiService.createSchoolTask(data);

      if (!result.success) {
        return rejectWithValue(result.message);
      }

      return result.data as SchoolTask;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSchoolTaskById = createAsyncThunk<SchoolTask, string>(
  'schoolTasks/fetchSchoolTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const result = await schoolTaskApiService.getSchoolTaskById(id);

      if (!result.success || !result.data) {
        return rejectWithValue(result.message);
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSchoolTask = createAsyncThunk<
  SchoolTask,
  { id: string; data: UpdateSchoolTaskRequest }
>('schoolTasks/updateSchoolTask', async ({ id, data }, { rejectWithValue }) => {
  try {
    const result = await schoolTaskApiService.updateSchoolTask(id, data);

    if (!result.success) {
      return rejectWithValue(result.message);
    }

    return result.data as SchoolTask;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteSchoolTask = createAsyncThunk<string, string>(
  'schoolTasks/deleteSchoolTask',
  async (id, { rejectWithValue }) => {
    try {
      const result = await schoolTaskApiService.deleteSchoolTask(id);

      if (!result.success) {
        return rejectWithValue(result.message);
      }

      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSchoolTaskStatuses = createAsyncThunk<
  FetchSchoolTaskStatusesResponse,
  FetchSchoolTaskStatusesPayload
>('schoolTasks/fetchSchoolTaskStatuses', async (payload, { rejectWithValue }) => {
  try {
    const params: SchoolTaskStatusQueryParams = {
      Id: payload.id,
      PageIndex: payload.page,
      PageSize: payload.limit,
      StudentName: payload.filters?.studentName,
      SubmissionStatus: payload.filters?.submissionStatus,
    };

    const response = await schoolTaskApiService.getSchoolTaskStatusById(params);

    if (!response?.isSuccess || !response.data) {
      return {
        taskStatuses: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }

    return {
      taskStatuses: response.data.taskStatuses || [],
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
});

export const fetchStudentSchoolTasks = createAsyncThunk<
  FetchStudentSchoolTasksResponse,
  FetchStudentSchoolTasksPayload | void
>('schoolTasks/fetchStudentSchoolTasks', async (payload, { rejectWithValue }) => {
  try {
    const params: Partial<StudentSchoolTaskQueryParams> = {};

    if (payload) {
      if (payload.page) params.PageIndex = payload.page;
      if (payload.limit) params.PageSize = payload.limit;

      if (payload.filters) {
        if (payload.filters.studentId) params.StudentId = payload.filters.studentId;
        if (payload.filters.date) params.Date = payload.filters.date;
        if (payload.filters.submissionStatus) {
          params.SubmissionStatus = payload.filters.submissionStatus;
        }
        if (payload.filters.materialId) params.MaterialId = payload.filters.materialId;
        if (payload.filters.taskType) params.TaskType = payload.filters.taskType;
      }
    }

    const response = await schoolTaskApiService.getAllSchoolTasksByStudentId(
      params as StudentSchoolTaskQueryParams
    );

    if (!response?.isSuccess || !response.data) {
      return {
        schoolTasks: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }

    return {
      schoolTasks: response.data.schoolTasks || [],
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
});

const schoolTasksSlice = createSlice({
  name: 'schoolTasks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<SchoolTasksState['filters']>) => {
      state.filters = action.payload;
    },
    setStatusFilters: (state, action: PayloadAction<SchoolTasksState['statusFilters']>) => {
      state.statusFilters = action.payload;
    },
    setStudentTaskFilters: (
      state,
      action: PayloadAction<SchoolTasksState['studentTaskFilters']>
    ) => {
      state.studentTaskFilters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.statusFilters = {};
      state.studentTaskFilters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSchoolTask: (state, action: PayloadAction<SchoolTask | null>) => {
      state.currentSchoolTask = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<SchoolTasksState>) => {
    builder
      .addCase(fetchSchoolTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchoolTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schoolTasks = action.payload.schoolTasks;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.isInitialized = true;
      })
      .addCase(fetchSchoolTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addSchoolTask.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(addSchoolTask.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(addSchoolTask.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSchoolTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentSchoolTask = null;
      })
      .addCase(fetchSchoolTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSchoolTask = action.payload;
      })
      .addCase(fetchSchoolTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSchoolTask.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSchoolTask.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentSchoolTask = action.payload;
      })
      .addCase(updateSchoolTask.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSchoolTask.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSchoolTask.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.schoolTasks = state.schoolTasks.filter((task) => task.id !== action.payload);
        if (state.currentSchoolTask?.id === action.payload) {
          state.currentSchoolTask = null;
        }
      })
      .addCase(deleteSchoolTask.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSchoolTaskStatuses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchoolTaskStatuses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taskStatuses = action.payload.taskStatuses;
        state.statusPagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
      })
      .addCase(fetchSchoolTaskStatuses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentSchoolTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentSchoolTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentSchoolTasks = action.payload.schoolTasks;
        state.studentTasksPagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
      })
      .addCase(fetchStudentSchoolTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  setStatusFilters,
  setStudentTaskFilters,
  clearFilters,
  clearError,
  setCurrentSchoolTask,
} = schoolTasksSlice.actions;

export default schoolTasksSlice.reducer;
