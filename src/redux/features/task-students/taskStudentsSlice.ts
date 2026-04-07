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
  TaskStudent,
  UpdateTaskStudentRequest,
} from '@/types/taskStudents';

export interface TaskStudentsState {
  currentTaskStudent: TaskStudent | null;
  studentMaterialTasks: TaskStudent[];
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface FetchStudentMaterialTasksPayload {
  studentId: string;
  taskDate?: string;
}

export const initialState: TaskStudentsState = {
  currentTaskStudent: null,
  studentMaterialTasks: [],
  isLoading: false,
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