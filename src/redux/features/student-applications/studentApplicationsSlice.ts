import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { studentApplicationsApiService } from '@/services/api/student-applications/student-applications.service';
import type {
  StudentApplicationDto,
  StudentApplicationDetailDto,
} from '@/services/api/student-applications/student-applications.types';
import { getErrorMessage } from '@/lib/http';

interface StudentApplicationsState {
  applications: StudentApplicationDto[];
  currentApplication: StudentApplicationDetailDto | null;
  currentApplicationLoading: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: StudentApplicationsState = {
  applications: [],
  currentApplication: null,
  currentApplicationLoading: false,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

export interface FetchStudentApplicationsPayload {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: number;
  educationalStageId?: string;
  schoolBranchId?: string;
}

export interface FetchStudentApplicationsResponse {
  data: StudentApplicationDto[];
  meta: {
    totalItems: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
}

export const fetchStudentApplications = createAsyncThunk<
  FetchStudentApplicationsResponse,
  FetchStudentApplicationsPayload,
  { rejectValue: string }
>('studentApplications/fetchStudentApplications', async (payload, { rejectWithValue }) => {
  try {
    const response = await studentApplicationsApiService.getStudentApplications({
      PageIndex: payload.page || 1,
      PageSize: payload.limit || 10,
      Search: payload.searchTerm,
      Status: payload.status,
      LKSchoolStageId: payload.educationalStageId,
      SchoolBranchId: payload.schoolBranchId,
    });

    if (!response?.isSuccess || !response.data) {
      return {
        data: [],
        meta: {
          totalItems: 0,
          pageIndex: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };
    }

    return {
      data: response.data.applicationDtos || [],
      meta: {
        totalItems: response.data.totalItems || 0,
        pageIndex: response.data.pageIndex || 1,
        pageSize: response.data.pageSize || 10,
        totalPages: response.data.totalPages || 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchStudentApplicationById = createAsyncThunk<
  StudentApplicationDetailDto,
  string,
  { rejectValue: string }
>('studentApplications/fetchStudentApplicationById', async (id, { rejectWithValue }) => {
  try {
    const response = await studentApplicationsApiService.getStudentApplicationById(id);

    if (!response?.isSuccess || !response.data) {
      return rejectWithValue('Failed to fetch student application details');
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateStudentApplicationStatus = createAsyncThunk<
  void,
  { id: string; status: number },
  { rejectValue: string }
>('studentApplications/updateStatus', async ({ id, status }, { rejectWithValue, dispatch }) => {
  try {
    const response = await studentApplicationsApiService.updateStudentApplicationStatus(id, status);

    if (!response?.isSuccess) {
      return rejectWithValue(response?.errors?.[0] || 'Failed to update status');
    }

    // Refresh the list after update
    dispatch(fetchStudentApplications({}));
    return;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const sendEditRequest = createAsyncThunk<
  void,
  { studentApplicationId: string; editRequest: string },
  { rejectValue: string }
>(
  'studentApplications/sendEditRequest',
  async ({ studentApplicationId, editRequest }, { rejectWithValue, dispatch }) => {
    try {
      const response = await studentApplicationsApiService.sendEditRequest(
        studentApplicationId,
        editRequest
      );

      if (!response?.isSuccess) {
        return rejectWithValue(response?.errors?.[0] || 'Failed to send edit request');
      }

      // Refresh the list after update
      dispatch(fetchStudentApplications({}));
      return;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const studentApplicationsSlice = createSlice({
  name: 'studentApplications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchStudentApplications.fulfilled,
        (state, action: PayloadAction<FetchStudentApplicationsResponse>) => {
          state.isLoading = false;
          state.applications = action.payload.data;
          state.pagination = {
            pageIndex: action.payload.meta.pageIndex,
            pageSize: action.payload.meta.pageSize,
            totalItems: action.payload.meta.totalItems,
            totalPages: action.payload.meta.totalPages,
          };
        }
      )
      .addCase(fetchStudentApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentApplicationById.pending, (state) => {
        state.currentApplicationLoading = true;
        state.error = null;
      })
      .addCase(
        fetchStudentApplicationById.fulfilled,
        (state, action: PayloadAction<StudentApplicationDetailDto>) => {
          state.currentApplicationLoading = false;
          state.currentApplication = action.payload;
        }
      )
      .addCase(fetchStudentApplicationById.rejected, (state, action) => {
        state.currentApplicationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default studentApplicationsSlice.reducer;
