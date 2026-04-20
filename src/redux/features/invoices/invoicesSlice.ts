import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import type { ApiResponseModel, ValidationErrorResponse } from '@/services/api/config';
import type { Pagination } from '@/types/Pagination';
import invoiceApiService from '@/services/api/invoice/invoice.service';
import type {
  CreateInvoiceRequest,
  InvoiceDto,
  InvoiceListData,
  InvoiceQueryParams,
} from '@/services/api/types/invoice.types';

interface InvoicesState {
  invoices: InvoiceDto[];
  invoiceDetails: InvoiceDto | null;
  invoiceNumbers: string[];
  pagination: Pagination;
  isLoading: boolean;
  isLoadingDetails: boolean;
  isLoadingNumbers: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: InvoicesState = {
  invoices: [],
  invoiceDetails: null,
  invoiceNumbers: [],
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  isLoadingDetails: false,
  isLoadingNumbers: false,
  isCreating: false,
  isDeleting: false,
  error: null,
  validationErrors: null,
};

export const fetchInvoices = createAsyncThunk<InvoiceListData, InvoiceQueryParams | undefined>(
  'invoices/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await invoiceApiService.getInvoices(params);

      if (!response?.data || response.isSuccess === false) {
        return {
          invoicesDtos: [],
          pageIndex: params?.pageIndex || params?.PageIndex || 1,
          pageSize: params?.pageSize || params?.PageSize || 10,
          totalItems: 0,
          totalPages: 0,
        };
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchInvoiceById = createAsyncThunk<InvoiceDto, string>(
  'invoices/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await invoiceApiService.getInvoiceById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchInvoiceNumbers = createAsyncThunk<string[]>(
  'invoices/fetchNumbers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoiceApiService.getInvoiceNumbers();
      return Array.isArray(response) ? response : [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createInvoice = createAsyncThunk<ApiResponseModel<InvoiceDto>, CreateInvoiceRequest>(
  'invoices/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await invoiceApiService.createInvoice(data);
      return response;
    } catch (error: any) {
      if (error.isValidationError && error.validationErrors) {
        return rejectWithValue({ validationErrors: error.validationErrors });
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteInvoice = createAsyncThunk<ApiResponseModel<string>, string>(
  'invoices/delete',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await invoiceApiService.deleteInvoice(invoiceId);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearInvoicesError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    clearInvoiceDetails: (state) => {
      state.invoiceDetails = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<InvoicesState>) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action: PayloadAction<InvoiceListData>) => {
        state.isLoading = false;
        state.invoices = Array.isArray(action.payload.invoicesDtos)
          ? action.payload.invoicesDtos
          : [];
        state.pagination = {
          pageIndex: action.payload.pageIndex || 1,
          pageSize: action.payload.pageSize || 10,
          totalItems: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
        state.invoiceDetails = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action: PayloadAction<InvoiceDto>) => {
        state.isLoadingDetails = false;
        state.invoiceDetails = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchInvoiceNumbers.pending, (state) => {
        state.isLoadingNumbers = true;
        state.error = null;
      })
      .addCase(fetchInvoiceNumbers.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.isLoadingNumbers = false;
        state.invoiceNumbers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInvoiceNumbers.rejected, (state, action) => {
        state.isLoadingNumbers = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createInvoice.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createInvoice.fulfilled, (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isCreating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess) {
          state.validationErrors = validationErrors;
        }
      })
      .addCase(createInvoice.rejected, (state, action: any) => {
        state.isCreating = false;
        if (action.payload?.validationErrors) {
          state.validationErrors = action.payload.validationErrors;
          return;
        }
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteInvoice.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(
        deleteInvoice.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<string>>) => {
          state.isDeleting = false;
          const { isSuccess, value } = action.payload;
          if (isSuccess && value) {
            state.invoices = state.invoices.filter((invoice) => invoice.id !== value);
            state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
          }
        }
      )
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearInvoicesError, clearInvoiceDetails } = invoicesSlice.actions;
export default invoicesSlice.reducer;
