import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import type { ApiResponseModel, ValidationErrorResponse } from '@/services/api/config';
import type { Pagination } from '@/types/Pagination';
import customerApiService from '@/services/api/customer/customer.service';
import type {
  CreateCustomerRequest,
  CustomerDto,
  CustomerListData,
  CustomerQueryParams,
  UpdateCustomerRequest,
} from '@/services/api/types/customer.types';

interface CustomersState {
  customers: CustomerDto[];
  customerDetails: CustomerDto | null;
  pagination: Pagination;
  isLoading: boolean;
  isLoadingDetails: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: CustomersState = {
  customers: [],
  customerDetails: null,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  isLoadingDetails: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: null,
};

export const fetchCustomers = createAsyncThunk<CustomerListData, CustomerQueryParams | undefined>(
  'customers/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await customerApiService.getCustomers(params);

      if (!response?.data || response.isSuccess === false) {
        return {
          customerDto: [],
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

export const fetchCustomerById = createAsyncThunk<CustomerDto, string>(
  'customers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerApiService.getCustomerById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createCustomer = createAsyncThunk<ApiResponseModel<null>, CreateCustomerRequest>(
  'customers/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await customerApiService.createCustomer(data);
      return response;
    } catch (error: any) {
      if (error.isValidationError && error.validationErrors) {
        return rejectWithValue({ validationErrors: error.validationErrors });
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCustomer = createAsyncThunk<ApiResponseModel<null>, UpdateCustomerRequest>(
  'customers/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await customerApiService.updateCustomer(data);
      return response;
    } catch (error: any) {
      if (error.isValidationError && error.validationErrors) {
        return rejectWithValue({ validationErrors: error.validationErrors });
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteCustomer = createAsyncThunk<ApiResponseModel<string>, string>(
  'customers/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerApiService.deleteCustomer(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomersError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    clearCustomerDetails: (state) => {
      state.customerDetails = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<CustomersState>) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<CustomerListData>) => {
        state.isLoading = false;
        state.customers = Array.isArray(action.payload.customerDto)
          ? action.payload.customerDto
          : [];
        state.pagination = {
          pageIndex: action.payload.pageIndex || 1,
          pageSize: action.payload.pageSize || 10,
          totalItems: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
        state.customerDetails = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<CustomerDto>) => {
        state.isLoadingDetails = false;
        state.customerDetails = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createCustomer.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        createCustomer.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isCreating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess) state.validationErrors = validationErrors;
        }
      )
      .addCase(createCustomer.rejected, (state, action: any) => {
        state.isCreating = false;
        if (action.payload?.validationErrors) {
          state.validationErrors = action.payload.validationErrors;
          return;
        }
        state.error = action.payload as string;
      });

    builder
      .addCase(updateCustomer.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        updateCustomer.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isUpdating = false;
          const { isSuccess, validationErrors } = action.payload;
          if (!isSuccess) state.validationErrors = validationErrors;
        }
      )
      .addCase(updateCustomer.rejected, (state, action: any) => {
        state.isUpdating = false;
        if (action.payload?.validationErrors) {
          state.validationErrors = action.payload.validationErrors;
          return;
        }
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(
        deleteCustomer.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<string>>) => {
          state.isDeleting = false;
          const { isSuccess, value } = action.payload;
          if (isSuccess && value) {
            state.customers = state.customers.filter((customer) => customer.id !== value);
            state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
          }
        }
      )
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCustomersError, clearCustomerDetails } = customersSlice.actions;
export default customersSlice.reducer;
