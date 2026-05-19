import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { taskStudentApiService } from '@/services/api/task-students/task-students.service';
import type {
  StudentMaterialTasksQueryParams,
  StudentExamItem,
  StudentExamsListData,
  StudentExamsQueryParams,
  StudentHomeworkItem,
  StudentHomeworkListData,
  StudentHomeworkQueryParams,
  TaskStudent,
  UpdateTaskStudentRequest,
} from '@/types/taskStudents';

interface ListPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

const emptyPagination: ListPagination = {
  pageIndex: 1,
  totalPages: 0,
  totalItems: 0,
  pageSize: 10,
};

export interface TaskStudentsState {
  currentTaskStudent: TaskStudent | null;
  studentMaterialTasks: TaskStudent[];
  studentExams: StudentExamItem[];
  studentHomework: StudentHomeworkItem[];
  examsPagination: ListPagination;
  homeworkPagination: ListPagination;
  isLoading: boolean;
  isExamsLoading: boolean;
  isHomeworkLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface FetchStudentMaterialTasksPayload {
  studentId: string;
  taskDate?: string;
}

export interface FetchStudentExamsPayload {
  studentId: string;
  params?: StudentExamsQueryParams;
}

export interface FetchStudentHomeworkPayload {
  studentId: string;
  params?: StudentHomeworkQueryParams;
}

export const initialState: TaskStudentsState = {
  currentTaskStudent: null,
  studentMaterialTasks: [],
  studentExams: [],
  studentHomework: [],
  examsPagination: emptyPagination,
  homeworkPagination: emptyPagination,
  isLoading: false,
  isExamsLoading: false,
  isHomeworkLoading: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  isInitialized: false,
};

export const fetchTaskStudentById = createAsyncThunk<TaskStudent, string>(
  'taskStudents/fetchTaskStudentById',
  async (id, { rejectWithValue }) => {
    try {
      const result = await taskStudentApiService.getTaskStudentById(id);

      if (!result.success || !result.data) {
        return rejectWithValue(result.message);
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchStudentMaterialTasks = createAsyncThunk<
  TaskStudent[],
  FetchStudentMaterialTasksPayload
>('taskStudents/fetchStudentMaterialTasks', async ({ studentId, taskDate }, { rejectWithValue }) => {
  try {
    const params: StudentMaterialTasksQueryParams = {
      taskDate,
    };

    const response = await taskStudentApiService.getStudentMaterialTasks(studentId, params);

    if (!response?.isSuccess || !response.data) {
      return [];
    }

    return response.data.taskStudents || [];
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchStudentExams = createAsyncThunk<
  StudentExamsListData,
  FetchStudentExamsPayload
>('taskStudents/fetchStudentExams', async ({ studentId, params }, { rejectWithValue }) => {
  try {
    const response = await taskStudentApiService.getStudentExams(studentId, params);

    if (!response?.isSuccess) {
      return rejectWithValue(response?.message || 'Failed to fetch student exams');
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchStudentHomework = createAsyncThunk<
  StudentHomeworkListData,
  FetchStudentHomeworkPayload
>('taskStudents/fetchStudentHomework', async ({ studentId, params }, { rejectWithValue }) => {
  try {
    const response = await taskStudentApiService.getStudentHomework(studentId, params);

    if (!response?.isSuccess) {
      return rejectWithValue(response?.message || 'Failed to fetch student homework');
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editTaskStudent = createAsyncThunk<
  TaskStudent,
  { id: string; data: UpdateTaskStudentRequest }
>('taskStudents/editTaskStudent', async ({ id, data }, { rejectWithValue }) => {
  try {
    const result = await taskStudentApiService.updateTaskStudent(id, data);

    if (!result.success) {
      return rejectWithValue(result.message);
    }

    return result.data as TaskStudent;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const removeTaskStudent = createAsyncThunk<string, string>(
  'taskStudents/removeTaskStudent',
  async (id, { rejectWithValue }) => {
    try {
      const result = await taskStudentApiService.deleteTaskStudent(id);

      if (!result.success) {
        return rejectWithValue(result.message);
      }

      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const taskStudentsSlice = createSlice({
  name: 'taskStudents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTaskStudent: (state, action: PayloadAction<TaskStudent | null>) => {
      state.currentTaskStudent = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<TaskStudentsState>) => {
    builder
      .addCase(fetchTaskStudentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskStudentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTaskStudent = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchTaskStudentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentMaterialTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentMaterialTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentMaterialTasks = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchStudentMaterialTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentExams.pending, (state) => {
        state.isExamsLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentExams.fulfilled, (state, action) => {
        state.isExamsLoading = false;
        state.studentExams = action.payload.exams || [];
        state.examsPagination = {
          pageIndex: action.payload.pageIndex || 1,
          totalPages: action.payload.totalPages || 0,
          totalItems: action.payload.totalItems || 0,
          pageSize: action.payload.pageSize || 10,
        };
        state.isInitialized = true;
      })
      .addCase(fetchStudentExams.rejected, (state, action) => {
        state.isExamsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentHomework.pending, (state) => {
        state.isHomeworkLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentHomework.fulfilled, (state, action) => {
        state.isHomeworkLoading = false;
        state.studentHomework = action.payload.exams || [];
        state.homeworkPagination = {
          pageIndex: action.payload.pageIndex || 1,
          totalPages: action.payload.totalPages || 0,
          totalItems: action.payload.totalItems || 0,
          pageSize: action.payload.pageSize || 10,
        };
        state.isInitialized = true;
      })
      .addCase(fetchStudentHomework.rejected, (state, action) => {
        state.isHomeworkLoading = false;
        state.error = action.payload as string;
      })
      .addCase(editTaskStudent.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(editTaskStudent.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentTaskStudent = action.payload;
        state.studentMaterialTasks = state.studentMaterialTasks.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(editTaskStudent.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(removeTaskStudent.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(removeTaskStudent.fulfilled, (state, action) => {
        state.isDeleting = false;
        if (state.currentTaskStudent?.id === action.payload) {
          state.currentTaskStudent = null;
        }
        state.studentMaterialTasks = state.studentMaterialTasks.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(removeTaskStudent.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentTaskStudent } = taskStudentsSlice.actions;

export default taskStudentsSlice.reducer;