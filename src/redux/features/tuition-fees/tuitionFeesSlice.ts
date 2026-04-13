import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import type { ApiResponseModel, ValidationErrorResponse } from '@/services/api/config';
import type { Pagination } from '@/types/Pagination';
import tuitionFeesApiService from '@/services/api/tuition-fees/tuition-fees.service';
import type {
  TuitionFeesDto,
  TuitionFeesListData,
  TuitionFeesQueryParams,
  CreateTuitionFeesRequest,
  UpdateTuitionFeesRequest,
  TuitionFeesGradeFeesItem,
  InstallmentDto,
  InstallmentQueryParams,
  InstallmentPlanByIdDto,
} from '@/services/api/types/tuition-fees.types';

interface TuitionFeesState {
  tuitionFees: TuitionFeesDto[];
  tuitionFeesDetails: TuitionFeesDto | null;
  tuitionFeesByGradeAndBranch: TuitionFeesDto | null;
  gradesFees: TuitionFeesGradeFeesItem[];
  installments: InstallmentDto[];
  installmentPlan: InstallmentPlanByIdDto | null;
  calculationResult: unknown;
  pagination: Pagination;
  isLoading: boolean;
  isLoadingDetails: boolean;
  isLoadingGradesFees: boolean;
  isLoadingInstallments: boolean;
  isCalculating: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: TuitionFeesState = {
  tuitionFees: [],
  tuitionFeesDetails: null,
  tuitionFeesByGradeAndBranch: null,
  gradesFees: [],
  installments: [],
  installmentPlan: null,
  calculationResult: null,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  isLoadingDetails: false,
  isLoadingGradesFees: false,
  isLoadingInstallments: false,
  isCalculating: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: null,
};

export const fetchTuitionFees = createAsyncThunk<
  TuitionFeesListData,
  Partial<TuitionFeesQueryParams> | undefined
>('tuitionFees/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await tuitionFeesApiService.getTuitionFees(params as TuitionFeesQueryParams);

    if (!response?.data || response.isSuccess === false) {
      return {
        tuitionFees: [],
        pageIndex: params?.PageIndex || 1,
        pageSize: params?.PageSize || 10,
        totalItems: 0,
        totalPages: 0,
      };
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchTuitionFeesById = createAsyncThunk<TuitionFeesDto, string>(
  'tuitionFees/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tuitionFeesApiService.getTuitionFeesById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTuitionFeesByGradeAndSchoolBranch = createAsyncThunk<
  TuitionFeesDto,
  { gradId: string; schoolBrancheId: string }
>('tuitionFees/fetchByGradeAndBranch', async ({ gradId, schoolBrancheId }, { rejectWithValue }) => {
  try {
    const response = await tuitionFeesApiService.getTuitionFeesByGradeAndSchoolBranch(
      gradId,
      schoolBrancheId
    );
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchGradesFeesBySchoolBranch = createAsyncThunk<TuitionFeesGradeFeesItem[], string>(
  'tuitionFees/fetchGradesFeesBySchoolBranch',
  async (schoolBrancheId, { rejectWithValue }) => {
    try {
      const response = await tuitionFeesApiService.getGradesFeesBySchoolBranch(schoolBrancheId);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAllInstallments = createAsyncThunk<InstallmentDto[], InstallmentQueryParams>(
  'tuitionFees/fetchAllInstallments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tuitionFeesApiService.getAllInstallments(params);
      if (!response?.isSuccess || !response.data) {
        return [];
      }
      return response.data.getAllInstallmentDtos ?? [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchInstallmentPlanById = createAsyncThunk<InstallmentPlanByIdDto, string>(
  'tuitionFees/fetchInstallmentPlanById',
  async (installmentId, { rejectWithValue }) => {
    try {
      const response = await tuitionFeesApiService.getInstallmentPlanByInstallmentId(installmentId);
      if (!response?.isSuccess || !response.data) {
        return rejectWithValue('No data returned');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const calculateTuitionFees = createAsyncThunk<
  unknown,
  Record<string, string | number | boolean | undefined | null> | undefined
>('tuitionFees/calculate', async (params, { rejectWithValue }) => {
  try {
    const response = await tuitionFeesApiService.calculationTuitionFees(params);
    return response.data ?? response.value;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createTuitionFees = createAsyncThunk<ApiResponseModel<null>, CreateTuitionFeesRequest>(
  'tuitionFees/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await tuitionFeesApiService.createTuitionFees(data);
      return response;
    } catch (error: any) {
      if (error.isValidationError && error.validationErrors) {
        return rejectWithValue({ validationErrors: error.validationErrors });
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateTuitionFees = createAsyncThunk<ApiResponseModel<null>, UpdateTuitionFeesRequest>(
  'tuitionFees/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await tuitionFeesApiService.updateTuitionFees(data);
      return response;
    } catch (error: any) {
      if (error.isValidationError && error.validationErrors) {
        return rejectWithValue({ validationErrors: error.validationErrors });
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteTuitionFees = createAsyncThunk<ApiResponseModel<string>, string>(
  'tuitionFees/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tuitionFeesApiService.deleteTuitionFees(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const tuitionFeesSlice = createSlice({
  name: 'tuitionFees',
  initialState,
  reducers: {
    clearTuitionFeesError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    clearTuitionFeesDetails: (state) => {
      state.tuitionFeesDetails = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<TuitionFeesState>) => {
    builder
      .addCase(fetchTuitionFees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTuitionFees.fulfilled, (state, action: PayloadAction<TuitionFeesListData>) => {
        state.isLoading = false;
        state.tuitionFees = Array.isArray(action.payload.tuitionFees)
          ? action.payload.tuitionFees
          : [];
        state.pagination = {
          pageIndex: action.payload.pageIndex || 1,
          pageSize: action.payload.pageSize || 10,
          totalItems: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchTuitionFees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTuitionFeesById.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
        state.tuitionFeesDetails = null;
      })
      .addCase(fetchTuitionFeesById.fulfilled, (state, action: PayloadAction<TuitionFeesDto>) => {
        state.isLoadingDetails = false;
        state.tuitionFeesDetails = action.payload;
      })
      .addCase(fetchTuitionFeesById.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTuitionFeesByGradeAndSchoolBranch.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
        state.tuitionFeesByGradeAndBranch = null;
      })
      .addCase(
        fetchTuitionFeesByGradeAndSchoolBranch.fulfilled,
        (state, action: PayloadAction<TuitionFeesDto>) => {
          state.isLoadingDetails = false;
          state.tuitionFeesByGradeAndBranch = action.payload;
        }
      )
      .addCase(fetchTuitionFeesByGradeAndSchoolBranch.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchGradesFeesBySchoolBranch.pending, (state) => {
        state.isLoadingGradesFees = true;
        state.error = null;
      })
      .addCase(
        fetchGradesFeesBySchoolBranch.fulfilled,
        (state, action: PayloadAction<TuitionFeesGradeFeesItem[]>) => {
          state.isLoadingGradesFees = false;
          state.gradesFees = Array.isArray(action.payload) ? action.payload : [];
        }
      )
      .addCase(fetchGradesFeesBySchoolBranch.rejected, (state, action) => {
        state.isLoadingGradesFees = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAllInstallments.pending, (state) => {
        state.isLoadingInstallments = true;
        state.error = null;
      })
      .addCase(fetchAllInstallments.fulfilled, (state, action: PayloadAction<InstallmentDto[]>) => {
        state.isLoadingInstallments = false;
        state.installments = action.payload;
      })
      .addCase(fetchAllInstallments.rejected, (state, action) => {
        state.isLoadingInstallments = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchInstallmentPlanById.pending, (state) => {
        state.installmentPlan = null;
      })
      .addCase(
        fetchInstallmentPlanById.fulfilled,
        (state, action: PayloadAction<InstallmentPlanByIdDto>) => {
          state.installmentPlan = action.payload;
        }
      )
      .addCase(fetchInstallmentPlanById.rejected, (state) => {
        state.installmentPlan = null;
      });

    builder
      .addCase(calculateTuitionFees.pending, (state) => {
        state.isCalculating = true;
        state.error = null;
      })
      .addCase(calculateTuitionFees.fulfilled, (state, action: PayloadAction<unknown>) => {
        state.isCalculating = false;
        state.calculationResult = action.payload;
      })
      .addCase(calculateTuitionFees.rejected, (state, action) => {
        state.isCalculating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createTuitionFees.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        createTuitionFees.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isCreating = false;
          if (!action.payload.isSuccess) {
            state.validationErrors = action.payload.validationErrors;
          }
        }
      )
      .addCase(createTuitionFees.rejected, (state, action) => {
        state.isCreating = false;
        const payload = action.payload as {
          validationErrors?: ValidationErrorResponse[] | string[];
        };
        state.validationErrors = payload?.validationErrors ?? null;
        state.error = typeof action.payload === 'string' ? (action.payload as string) : state.error;
      });

    builder
      .addCase(updateTuitionFees.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(
        updateTuitionFees.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<null>>) => {
          state.isUpdating = false;
          if (!action.payload.isSuccess) {
            state.validationErrors = action.payload.validationErrors;
          }
        }
      )
      .addCase(updateTuitionFees.rejected, (state, action) => {
        state.isUpdating = false;
        const payload = action.payload as {
          validationErrors?: ValidationErrorResponse[] | string[];
        };
        state.validationErrors = payload?.validationErrors ?? null;
        state.error = typeof action.payload === 'string' ? (action.payload as string) : state.error;
      });

    builder
      .addCase(deleteTuitionFees.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(
        deleteTuitionFees.fulfilled,
        (state, action: PayloadAction<ApiResponseModel<string>>) => {
          state.isDeleting = false;
          if (action.payload.isSuccess) {
            const deletedId = action.payload.data ?? action.payload.value;
            if (typeof deletedId === 'string') {
              state.tuitionFees = state.tuitionFees.filter((t) => t.id !== deletedId);
            }
          }
        }
      )
      .addCase(deleteTuitionFees.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTuitionFeesError, clearTuitionFeesDetails } = tuitionFeesSlice.actions;

export default tuitionFeesSlice.reducer;
