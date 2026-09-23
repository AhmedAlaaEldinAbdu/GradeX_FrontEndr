import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import type {
  AcademicSystemDetailsValue,
  AcademicSystemListValue,
  AcademicSubSystemParams,
  CreateAcademicSystem,
  UpdateAcademicSystemRequest,
  AcademicSubSystemResponse,
} from '@/services/api/types/academic-system.types';
import AcademicSystemsApiService from '@/services/api/academic-system/academic-system.service';
import { getErrorMessage } from '@/lib/http';
import type { ApiResponseModel, ValidationErrorResponse } from '@/services/api/config';
import type { Pagination } from '@/types/Pagination';

interface AcademicSystemsState {
  academicSystems: AcademicSubSystemResponse[];
  academicSystemDetails: AcademicSystemDetailsValue | null;
  pagination: Pagination;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: AcademicSystemsState = {
  academicSystems: [],
  academicSystemDetails: null,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: null,
};

export const getAcademicSystems = createAsyncThunk<
  AcademicSystemListValue,
  AcademicSubSystemParams | undefined
>('academicSystems/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await AcademicSystemsApiService.getAcademicSystem(params);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const getAcademicSystemById = createAsyncThunk<AcademicSystemDetailsValue, string>(
  'academicSystems/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await AcademicSystemsApiService.getAcademicSystemById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addAcademicSystem = createAsyncThunk<
  ApiResponseModel<null>,
  CreateAcademicSystem[] | any
>('academicSystems/create', async (data, { rejectWithValue }) => {
  try {
    const response = await AcademicSystemsApiService.createAcademicSystem(data);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editAcademicSystem = createAsyncThunk<
  ApiResponseModel<null>,
  UpdateAcademicSystemRequest
>('academicSystems/update', async (data, { rejectWithValue }) => {
  try {
    const response = await AcademicSystemsApiService.updateAcademicSystem(data);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteAcademicSystem = createAsyncThunk<ApiResponseModel<string>, string>(
  'academicSystems/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await AcademicSystemsApiService.deleteAcademicSystem(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const academicSystemsSlice = createSlice({
  name: 'academicSystems',
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<AcademicSystemsState>) => {
    builder

      .addCase(getAcademicSystems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getAcademicSystems.fulfilled,
        (state, action: PayloadAction<AcademicSystemListValue>) => {
          state.isLoading = false;
          if (action.payload && action.payload.academicSubSystemResponse) {
            state.academicSystems = Array.isArray(action.payload.academicSubSystemResponse)
              ? action.payload.academicSubSystemResponse
              : [];
            state.pagination = {
              pageIndex: action.payload.pageIndex || 1,
              pageSize: action.payload.pageSize || 10,
              totalItems: action.payload.totalItems || 0,
              totalPages: action.payload.totalPages || 0,
            };
          } else {
            state.academicSystems = [];
            state.pagination = {
              pageIndex: 1,
              pageSize: 10,
              totalItems: 0,
              totalPages: 0,
            };
          }
        }
      )
      .addCase(getAcademicSystems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(getAcademicSystemById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getAcademicSystemById.fulfilled,
        (state, action: PayloadAction<AcademicSystemDetailsValue>) => {
          state.isLoading = false;
          state.academicSystemDetails = action.payload as AcademicSystemDetailsValue;
        }
      )
      .addCase(getAcademicSystemById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(addAcademicSystem.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(addAcademicSystem.fulfilled, (state, action: PayloadAction<ApiResponseModel>) => {
        state.isCreating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess) state.validationErrors = validationErrors;
      })
      .addCase(addAcademicSystem.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      .addCase(editAcademicSystem.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(editAcademicSystem.fulfilled, (state, action: PayloadAction<ApiResponseModel>) => {
        state.isUpdating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess) state.validationErrors = validationErrors;
      })
      .addCase(editAcademicSystem.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      .addCase(deleteAcademicSystem.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAcademicSystem.fulfilled, (state, action: PayloadAction<ApiResponseModel>) => {
        state.isDeleting = false;
        const { isSuccess, value } = action.payload;
        if (isSuccess) {
          state.academicSystems = state.academicSystems?.filter((s) => s?.id !== value);
          state.pagination.pageSize -= 1;
        }
      })
      .addCase(deleteAcademicSystem.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export default academicSystemsSlice.reducer;
