import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import type { ValidationErrorResponse } from '@/services/api/config';
import type { Pagination } from '@/types/Pagination';
import contractsApiService from '@/services/api/contracts/contracts.service';
import type {
  ContractListItem,
  ContractsListData,
  ContractsQueryParams,
  CreateSchoolContractRequest,
  UpdateSchoolContractRequest,
  RequestSignContractPayload,
  ConfirmSignContractPayload,
  SchoolContractDto,
} from '@/services/api/types/contracts.types';

// ============================================================================
// State
// ============================================================================

interface ContractsState {
  contracts: ContractListItem[];
  currentContract: SchoolContractDto | null;
  contractByStudent: SchoolContractDto | null;
  signResult: unknown;
  pagination: Pagination;
  isLoading: boolean;
  isLoadingByStudent: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isRequestingSign: boolean;
  isConfirmingSign: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: ContractsState = {
  contracts: [],
  currentContract: null,
  contractByStudent: null,
  signResult: null,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  isLoadingByStudent: false,
  isCreating: false,
  isUpdating: false,
  isRequestingSign: false,
  isConfirmingSign: false,
  error: null,
  validationErrors: null,
};

// ============================================================================
// Thunks
// ============================================================================

export const fetchContracts = createAsyncThunk<ContractsListData, ContractsQueryParams>(
  'contracts/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await contractsApiService.getAllContractsBySchoolBranchId(params);

      if (!response?.data || response.isSuccess === false) {
        return {
          contracts: [],
          pageIndex: params.PageNumber ?? 1,
          pageNumber: params.PageNumber ?? 1,
          pageSize: params.PageSize ?? 10,
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

export const fetchContractByStudentId = createAsyncThunk<SchoolContractDto, string>(
  'contracts/fetchByStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await contractsApiService.getSchoolContractByStudentId(studentId);
      return (response.data ?? response.value) as SchoolContractDto;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createContract = createAsyncThunk<SchoolContractDto, CreateSchoolContractRequest>(
  'contracts/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await contractsApiService.createSchoolContract(payload);
      if (response.isSuccess === false) {
        return rejectWithValue({
          message: response.message ?? response.errors?.join(', ') ?? response.successMessage ?? null,
          validationErrors: response.validationErrors ?? null,
        });
      }
      return (response.data ?? response.value) as SchoolContractDto;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateContract = createAsyncThunk<SchoolContractDto, UpdateSchoolContractRequest>(
  'contracts/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await contractsApiService.updateSchoolContract(payload);
      if (response.isSuccess === false) {
        return rejectWithValue({
          message: response.message ?? response.errors?.join(', ') ?? response.successMessage ?? null,
          validationErrors: response.validationErrors ?? null,
        });
      }
      return (response.data ?? response.value) as SchoolContractDto;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const requestSignContract = createAsyncThunk<unknown, RequestSignContractPayload>(
  'contracts/requestSign',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await contractsApiService.requestSignContract(payload);
      if (response.isSuccess === false) {
        return rejectWithValue(
          response.message ?? response.errors?.join(', ') ?? response.successMessage ?? 'common.errorOccurred'
        );
      }
      return response.data ?? response.value;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const confirmSignContract = createAsyncThunk<unknown, ConfirmSignContractPayload>(
  'contracts/confirmSign',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await contractsApiService.confirmSignContract(payload);
      if (response.isSuccess === false) {
        return rejectWithValue(
          response.message ?? response.errors?.join(', ') ?? response.successMessage ?? 'common.errorOccurred'
        );
      }
      return response.data ?? response.value;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const contractsSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    clearContracts(state) {
      state.contracts = [];
      state.pagination = initialState.pagination;
    },
    clearCurrentContract(state) {
      state.currentContract = null;
    },
    clearContractByStudent(state) {
      state.contractByStudent = null;
    },
    clearContractsError(state) {
      state.error = null;
      state.validationErrors = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ContractsState>) => {
    builder
      // List
      .addCase(fetchContracts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action: PayloadAction<ContractsListData>) => {
        const data = action.payload ?? {};
        // Accept either `contracts` or `schoolContractDto` until the API
        // response shape is confirmed.
        state.contracts = data.contracts ?? data.schoolContractDto ?? [];
        state.pagination = {
          pageIndex: data.pageNumber ?? data.pageIndex ?? 1,
          pageSize: data.pageSize ?? 10,
          totalItems: data.totalItems ?? 0,
          totalPages: data.totalPages ?? 0,
        };
        state.isLoading = false;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // By student
      .addCase(fetchContractByStudentId.pending, (state) => {
        state.isLoadingByStudent = true;
      })
      .addCase(
        fetchContractByStudentId.fulfilled,
        (state, action: PayloadAction<SchoolContractDto>) => {
          state.contractByStudent = action.payload;
          state.isLoadingByStudent = false;
        }
      )
      .addCase(fetchContractByStudentId.rejected, (state, action) => {
        state.isLoadingByStudent = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createContract.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createContract.fulfilled, (state, action: PayloadAction<SchoolContractDto>) => {
        state.isCreating = false;
        state.currentContract = action.payload;
      })
      .addCase(createContract.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as
          | { message?: string | null; validationErrors?: ValidationErrorResponse[] | string[] | null }
          | string
          | undefined;
        if (typeof payload === 'string') {
          state.error = payload;
        } else if (payload) {
          state.error = payload.message ?? null;
          state.validationErrors = payload.validationErrors ?? null;
        }
      })

      // Update
      .addCase(updateContract.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateContract.fulfilled, (state, action: PayloadAction<SchoolContractDto>) => {
        state.isUpdating = false;
        state.currentContract = action.payload;
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as
          | { message?: string | null; validationErrors?: ValidationErrorResponse[] | string[] | null }
          | string
          | undefined;
        if (typeof payload === 'string') {
          state.error = payload;
        } else if (payload) {
          state.error = payload.message ?? null;
          state.validationErrors = payload.validationErrors ?? null;
        }
      })

      // Sign — request
      .addCase(requestSignContract.pending, (state) => {
        state.isRequestingSign = true;
      })
      .addCase(requestSignContract.fulfilled, (state, action) => {
        state.isRequestingSign = false;
        state.signResult = action.payload;
      })
      .addCase(requestSignContract.rejected, (state, action) => {
        state.isRequestingSign = false;
        state.error = action.payload as string;
      })

      // Sign — confirm
      .addCase(confirmSignContract.pending, (state) => {
        state.isConfirmingSign = true;
      })
      .addCase(confirmSignContract.fulfilled, (state, action) => {
        state.isConfirmingSign = false;
        state.signResult = action.payload;
      })
      .addCase(confirmSignContract.rejected, (state, action) => {
        state.isConfirmingSign = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearContracts,
  clearCurrentContract,
  clearContractByStudent,
  clearContractsError,
} = contractsSlice.actions;

export default contractsSlice.reducer;
