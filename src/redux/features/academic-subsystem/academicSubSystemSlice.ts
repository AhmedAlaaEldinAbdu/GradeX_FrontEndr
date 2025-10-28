import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import type {
  AcademicSubSystemDetailsValue,
  AcademicSubSystemListValue,
  AcademicSubSystemParams,
  CreateAcademicSubSystem,
  UpdateAcademicSubSystemRequest,
  AcademicSubSystemItem,
} from '@/services/api/types/academic-subsystem.types';
import AcademicSubSystemsApiService from '@/services/api/academic-subsystem/academic-subsystem.service';
import { getErrorMessage } from '@/lib/http';
import type { ApiResponseModel, ValidationErrorResponse } from '@/services/api/config';
import type { Pagination } from '@/types/Pagination';

interface AcademicSubSystemsState {
  academicSubSystems: AcademicSubSystemItem[];
  academicSubSystemDetails: AcademicSubSystemDetailsValue | null;
  pagination: Pagination;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: AcademicSubSystemsState = {
  academicSubSystems: [],
  academicSubSystemDetails: null,
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

export const getAcademicSubSystems = createAsyncThunk<
  AcademicSubSystemListValue,
  AcademicSubSystemParams | undefined
>('academicSubSystems/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await AcademicSubSystemsApiService.getAcademicSubSystems(params);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const getAcademicSubSystemById = createAsyncThunk<
  AcademicSubSystemDetailsValue,
  string
>('academicSubSystems/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await AcademicSubSystemsApiService.getAcademicSubSystemById(id);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addAcademicSubSystem = createAsyncThunk<
  ApiResponseModel<null>,
  CreateAcademicSubSystem
>('academicSubSystems/create', async (data, { rejectWithValue }) => {
  try {
    const response = await AcademicSubSystemsApiService.createAcademicSubSystem(data);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editAcademicSubSystem = createAsyncThunk<
  ApiResponseModel<null>,
  UpdateAcademicSubSystemRequest
>('academicSubSystems/update', async (data, { rejectWithValue }) => {
  try {
    const response = await AcademicSubSystemsApiService.updateAcademicSubSystem(data);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteAcademicSubSystem = createAsyncThunk<
  ApiResponseModel<string>,
  string
>('academicSubSystems/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await AcademicSubSystemsApiService.deleteAcademicSubSystem(id);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const academicSubSystemsSlice = createSlice({
  name: 'academicSubSystems',
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<AcademicSubSystemsState>) => {
    builder
      .addCase(getAcademicSubSystems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAcademicSubSystems.fulfilled, (state, action: PayloadAction<AcademicSubSystemListValue>) => {
        state.isLoading = false;
        state.academicSubSystems = action.payload.academicSubSystemDto as AcademicSubSystemItem[];
        state.pagination = {
          pageIndex: action.payload.pageIndex,
          pageSize: action.payload.pageSize,
          totalItems: action.payload.totalItems,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(getAcademicSubSystems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(getAcademicSubSystemById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAcademicSubSystemById.fulfilled, (state, action: PayloadAction<AcademicSubSystemDetailsValue>) => {
        state.isLoading = false;
        state.academicSubSystemDetails = action.payload as AcademicSubSystemDetailsValue;
      })
      .addCase(getAcademicSubSystemById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(addAcademicSubSystem.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(addAcademicSubSystem.fulfilled, (state, action: PayloadAction<ApiResponseModel>) => {
        state.isCreating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess) state.validationErrors = validationErrors;
      })
      .addCase(addAcademicSubSystem.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      .addCase(editAcademicSubSystem.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(editAcademicSubSystem.fulfilled, (state, action: PayloadAction<ApiResponseModel>) => {
        state.isUpdating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess) state.validationErrors = validationErrors;
      })
      .addCase(editAcademicSubSystem.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      .addCase(deleteAcademicSubSystem.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAcademicSubSystem.fulfilled, (state, action: PayloadAction<ApiResponseModel>) => {
        state.isDeleting = false;
        const { isSuccess, value } = action.payload;
        if (isSuccess) {
          state.academicSubSystems = state.academicSubSystems?.filter((s) => s?.id !== value);
          state.pagination.totalItems -= 1;
        }
      })
      .addCase(deleteAcademicSubSystem.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export default academicSubSystemsSlice.reducer;
