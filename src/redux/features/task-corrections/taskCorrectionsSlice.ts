import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { taskCorrectionApiService } from '@/services/api/task-corrections/task-corrections.service';
import type {
  CreateTaskCorrectionRequest,
  TaskCorrection,
  UpdateTaskCorrectionRequest,
} from '@/types/taskCorrections';

export interface TaskCorrectionsState {
  currentTaskCorrection: TaskCorrection | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: TaskCorrectionsState = {
  currentTaskCorrection: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  isInitialized: false,
};

export const fetchTaskCorrectionByTaskStudentId = createAsyncThunk<TaskCorrection, string>(
  'taskCorrections/fetchTaskCorrectionByTaskStudentId',
  async (taskStudentId, { rejectWithValue }) => {
    try {
      const result = await taskCorrectionApiService.getTaskCorrectionByTaskStudentId(taskStudentId);

      if (!result.success || !result.data) {
        return rejectWithValue(result.message);
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addTaskCorrection = createAsyncThunk<TaskCorrection, CreateTaskCorrectionRequest>(
  'taskCorrections/addTaskCorrection',
  async (data, { rejectWithValue }) => {
    try {
      const result = await taskCorrectionApiService.createTaskCorrection(data);

      if (!result.success) {
        return rejectWithValue(result.message);
      }

      return result.data as TaskCorrection;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const editTaskCorrection = createAsyncThunk<
  TaskCorrection,
  { id: string; data: UpdateTaskCorrectionRequest }
>('taskCorrections/editTaskCorrection', async ({ id, data }, { rejectWithValue }) => {
  try {
    const result = await taskCorrectionApiService.updateTaskCorrection(id, data);

    if (!result.success) {
      return rejectWithValue(result.message);
    }

    return result.data as TaskCorrection;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const removeTaskCorrection = createAsyncThunk<string, string>(
  'taskCorrections/removeTaskCorrection',
  async (id, { rejectWithValue }) => {
    try {
      const result = await taskCorrectionApiService.deleteTaskCorrection(id);

      if (!result.success) {
        return rejectWithValue(result.message);
      }

      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const taskCorrectionsSlice = createSlice({
  name: 'taskCorrections',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTaskCorrection: (state, action: PayloadAction<TaskCorrection | null>) => {
      state.currentTaskCorrection = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<TaskCorrectionsState>) => {
    builder
      .addCase(fetchTaskCorrectionByTaskStudentId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskCorrectionByTaskStudentId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTaskCorrection = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchTaskCorrectionByTaskStudentId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addTaskCorrection.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(addTaskCorrection.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentTaskCorrection = action.payload;
      })
      .addCase(addTaskCorrection.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      .addCase(editTaskCorrection.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(editTaskCorrection.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentTaskCorrection = action.payload;
      })
      .addCase(editTaskCorrection.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(removeTaskCorrection.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(removeTaskCorrection.fulfilled, (state, action) => {
        state.isDeleting = false;
        if (state.currentTaskCorrection?.id === action.payload) {
          state.currentTaskCorrection = null;
        }
      })
      .addCase(removeTaskCorrection.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentTaskCorrection } = taskCorrectionsSlice.actions;

export default taskCorrectionsSlice.reducer;