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
import { gradeApiService } from '@/services/api/grades/grades.service';
import { classroomApiService } from '@/services/api/classrooms/classrooms.service';
import type {
  CreateInvoiceRequest,
  InvoiceDto,
  InvoiceItemsData,
  InvoiceListData,
  InvoiceQueryParams,
} from '@/services/api/types/invoice.types';
import type { GradeDetailsDto } from '@/services/api/types/grades.types';
import type { Classroom } from '@/services/api/types/classrooms.types';

interface InvoicesState {
  invoices: InvoiceDto[];
  invoiceDetails: InvoiceDto | null;
  invoiceNumbers: string[];
  invoiceItems: InvoiceItemsData | null;
  gradeDetails: GradeDetailsDto | null;
  classroomDetails: Classroom | null;
  pagination: Pagination;
  isLoading: boolean;
  isLoadingDetails: boolean;
  isLoadingNumbers: boolean;
  isLoadingInvoiceItems: boolean;
  isLoadingGradeDetails: boolean;
  isLoadingClassroomDetails: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: InvoicesState = {
  invoices: [],
  invoiceDetails: null,
  invoiceNumbers: [],
  invoiceItems: null,
  gradeDetails: null,
  classroomDetails: null,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  isLoadingDetails: false,
  isLoadingNumbers: false,
  isLoadingInvoiceItems: false,
  isLoadingGradeDetails: false,
  isLoadingClassroomDetails: false,
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

export const fetchInvoiceById = createAsyncThunk<InvoiceDto, { id: string; language?: string }>(
  'invoices/fetchById',
  async ({ id, language }, { rejectWithValue }) => {
    try {
      const response = await invoiceApiService.getInvoiceById(id, language);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchGradeById = createAsyncThunk<GradeDetailsDto, string>(
  'invoices/fetchGradeById',
  async (gradeId, { rejectWithValue }) => {
    try {
      return await gradeApiService.getGradeById(gradeId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchClassroomById = createAsyncThunk<Classroom, string>(
  'invoices/fetchClassroomById',
  async (classroomId, { rejectWithValue }) => {
    try {
      return await classroomApiService.getClassroomById(classroomId);
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

export const fetchInvoiceItems = createAsyncThunk<InvoiceItemsData, string>(
  'invoices/fetchItems',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await invoiceApiService.getInvoiceItems(studentId);
      if (!response.isSuccess || !response.data) {
        return rejectWithValue(response.message ?? 'Failed to fetch invoice items');
      }
      return response.data;
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
      state.gradeDetails = null;
      state.classroomDetails = null;
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
      .addCase(
        createInvoice.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<InvoiceDto>>) => {
          state.isCreating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess) {
            state.validationErrors = validationErrors;
          }
        }
      )
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

    builder
      .addCase(fetchInvoiceItems.pending, (state) => {
        state.isLoadingInvoiceItems = true;
        state.invoiceItems = null;
        state.error = null;
      })
      .addCase(fetchInvoiceItems.fulfilled, (state, action: PayloadAction<InvoiceItemsData>) => {
        state.isLoadingInvoiceItems = false;
        state.invoiceItems = action.payload;
      })
      .addCase(fetchInvoiceItems.rejected, (state, action) => {
        state.isLoadingInvoiceItems = false;
        state.invoiceItems = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchGradeById.pending, (state) => {
        state.isLoadingGradeDetails = true;
      })
      .addCase(fetchGradeById.fulfilled, (state, action: PayloadAction<GradeDetailsDto>) => {
        state.isLoadingGradeDetails = false;
        state.gradeDetails = action.payload;
      })
      .addCase(fetchGradeById.rejected, (state) => {
        state.isLoadingGradeDetails = false;
        // keep gradeDetails null; component will fall back to invoice value
      });

    builder
      .addCase(fetchClassroomById.pending, (state) => {
        state.isLoadingClassroomDetails = true;
      })
      .addCase(fetchClassroomById.fulfilled, (state, action: PayloadAction<Classroom>) => {
        state.isLoadingClassroomDetails = false;
        state.classroomDetails = action.payload;
      })
      .addCase(fetchClassroomById.rejected, (state) => {
        state.isLoadingClassroomDetails = false;
        // keep classroomDetails null; component will fall back to invoice value
      });
  },
});

export const { clearInvoicesError, clearInvoiceDetails } = invoicesSlice.actions;
export default invoicesSlice.reducer;
