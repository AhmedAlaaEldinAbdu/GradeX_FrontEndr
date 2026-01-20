import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import type { ApiResponseModel, ValidationErrorResponse } from '@/services/api/config';
import type { Pagination } from '@/types/Pagination';
import lkPaymentMethodApiService from '@/services/api/lk-payment-method/lk-payment-method.service';
import type {
  LKPaymentMethodDto,
  LKPaymentMethodListResponse,
  LKPaymentMethodQueryParams,
  CreateLKPaymentMethodRequest,
  UpdateLKPaymentMethodRequest,
} from '@/services/api/types/lk-payment-method.types';

interface LKPaymentMethodState {
  paymentMethods: LKPaymentMethodDto[];
  paymentMethodDetails: LKPaymentMethodDto | null;
  pagination: Pagination;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: LKPaymentMethodState = {
  paymentMethods: [],
  paymentMethodDetails: null,
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

export const fetchLKPaymentMethods = createAsyncThunk<
  LKPaymentMethodListResponse,
  LKPaymentMethodQueryParams | undefined
>('lkPaymentMethod/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await lkPaymentMethodApiService.getLKPaymentMethods(params);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchLKPaymentMethodById = createAsyncThunk<LKPaymentMethodDto, string>(
  'lkPaymentMethod/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await lkPaymentMethodApiService.getLKPaymentMethodById(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createLKPaymentMethodThunk = createAsyncThunk<
  ApiResponseModel<null>,
  CreateLKPaymentMethodRequest
>('lkPaymentMethod/create', async (data, { rejectWithValue }) => {
  try {
    return await lkPaymentMethodApiService.createLKPaymentMethod(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateLKPaymentMethodThunk = createAsyncThunk<
  ApiResponseModel<null>,
  UpdateLKPaymentMethodRequest
>('lkPaymentMethod/update', async (data, { rejectWithValue }) => {
  try {
    return await lkPaymentMethodApiService.updateLKPaymentMethod(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteLKPaymentMethodThunk = createAsyncThunk<ApiResponseModel<string>, string>(
  'lkPaymentMethod/delete',
  async (id, { rejectWithValue }) => {
    try {
      return await lkPaymentMethodApiService.deleteLKPaymentMethod(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const lkPaymentMethodSlice = createSlice({
  name: 'lkPaymentMethod',
  initialState,
  reducers: {
    clearLKPaymentMethodError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    clearLKPaymentMethodDetails: (state) => {
      state.paymentMethodDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLKPaymentMethods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchLKPaymentMethods.fulfilled,
        (state, action: PayloadAction<LKPaymentMethodListResponse>) => {
          state.isLoading = false;

          const payload = action.payload;
          const list = payload?.data?.lkPaymentMethodDto ?? [];

          state.paymentMethods = Array.isArray(list) ? list : [];
          state.pagination = {
            pageIndex: payload?.data?.pageIndex ?? 1,
            pageSize: payload?.data?.pageSize ?? 10,
            totalItems: payload?.data?.totalItems ?? 0,
            totalPages: payload?.data?.totalPages ?? 0,
          };
        }
      )
      .addCase(fetchLKPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchLKPaymentMethodById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLKPaymentMethodById.fulfilled, (state, action: PayloadAction<LKPaymentMethodDto>) => {
        state.isLoading = false;
        state.paymentMethodDetails = action.payload;
      })
      .addCase(fetchLKPaymentMethodById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createLKPaymentMethodThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createLKPaymentMethodThunk.fulfilled, (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isCreating = false;
        if (!action.payload.isSuccess) {
          state.validationErrors = action.payload.validationErrors;
        }
      })
      .addCase(createLKPaymentMethodThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      .addCase(updateLKPaymentMethodThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateLKPaymentMethodThunk.fulfilled, (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isUpdating = false;
        if (!action.payload.isSuccess) {
          state.validationErrors = action.payload.validationErrors;
        }
      })
      .addCase(updateLKPaymentMethodThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      .addCase(deleteLKPaymentMethodThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteLKPaymentMethodThunk.fulfilled, (state, action: PayloadAction<ApiResponseModel<string>>) => {
        state.isDeleting = false;
        const { isSuccess, value } = action.payload;
        if (isSuccess && value) {
          state.paymentMethods = state.paymentMethods.filter((m) => m.id !== value);
          if (typeof state.pagination.totalItems === 'number' && state.pagination.totalItems > 0) {
            state.pagination.totalItems -= 1;
          }
        }
      })
      .addCase(deleteLKPaymentMethodThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLKPaymentMethodError, clearLKPaymentMethodDetails } = lkPaymentMethodSlice.actions;

export default lkPaymentMethodSlice.reducer;
