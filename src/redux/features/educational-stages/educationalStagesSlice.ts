import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import type { ApiResponseModel, ValidationErrorResponse } from '@/services/api/config';
import type { Pagination } from '@/types/Pagination';
import EducationalStagesApiService from '@/services/api/educational-stages/educational-stages.service';
import type {
  EducationalStagesListValue,
  EducationalStageParams,
  EducationalStageResponse,
  LKSchoolStageResponse,
  CreateEducationalStageRequest,
  UpdateEducationalStageRequest,
} from '@/services/api/types/educational-stages.types';

interface EducationalStagesState {
  educationalStages: EducationalStageResponse[];
  lkEducationalStages: LKSchoolStageResponse[];
  educationalStageDetails: EducationalStageResponse | null;
  pagination: Pagination;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: EducationalStagesState = {
  educationalStages: [],
  lkEducationalStages: [],
  educationalStageDetails: null,
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

export const getEducationalStages = createAsyncThunk<
  EducationalStagesListValue,
  Partial<EducationalStageParams> | undefined
>('educationalStages/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await EducationalStagesApiService.fetchEducationalStages(params);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const getEducationalStagesBySubSystemId = createAsyncThunk<
  EducationalStagesListValue,
  { academicSubSystemId: string; params?: Partial<EducationalStageParams> }
>(
  'educationalStages/fetchBySubSystemId',
  async ({ academicSubSystemId, params }, { rejectWithValue }) => {
    try {
      const response = await EducationalStagesApiService.fetchEducationalStagesBySubSystemId(
        academicSubSystemId,
        params
      );
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getEducationalStageBySubsystemId = createAsyncThunk<EducationalStageResponse, string>(
  'educationalStages/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await EducationalStagesApiService.fetchEducationalStageById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getLKSchoolStages = createAsyncThunk<LKSchoolStageResponse[]>(
  'educationalStages/fetchLK',
  async (_, { rejectWithValue }) => {
    try {
      const response = await EducationalStagesApiService.fetchLKSchoolStages();
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addEducationalStage = createAsyncThunk<
  ApiResponseModel<null>,
  CreateEducationalStageRequest[] | any
>('educationalStages/create', async (data, { rejectWithValue }) => {
  try {
    const response = await EducationalStagesApiService.createEducationalStage(data);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editEducationalStage = createAsyncThunk<
  ApiResponseModel<null>,
  UpdateEducationalStageRequest
>('educationalStages/update', async (data, { rejectWithValue }) => {
  try {
    const response = await EducationalStagesApiService.updateEducationalStage(data);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteEducationalStage = createAsyncThunk<ApiResponseModel<string>, string>(
  'educationalStages/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await EducationalStagesApiService.deleteEducationalStage(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const educationalStagesSlice = createSlice({
  name: 'educationalStages',
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<EducationalStagesState>) => {
    builder
      .addCase(getEducationalStages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getEducationalStages.fulfilled,
        (state, action: PayloadAction<EducationalStagesListValue>) => {
          state.isLoading = false;
          if (action.payload && action.payload.gradeDtos) {
            state.educationalStages = Array.isArray(action.payload.gradeDtos)
              ? action.payload.gradeDtos
              : [];
            state.pagination = {
              pageIndex: action.payload.pageIndex || 1,
              pageSize: action.payload.pageSize || 10,
              totalItems: action.payload.totalItems || 0,
              totalPages: action.payload.totalPages || 0,
            };
          } else {
            state.educationalStages = [];
            state.pagination = {
              pageIndex: 1,
              pageSize: 10,
              totalItems: 0,
              totalPages: 0,
            };
          }
        }
      )
      .addCase(getEducationalStages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(getEducationalStagesBySubSystemId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getEducationalStagesBySubSystemId.fulfilled,
        (state, action: PayloadAction<EducationalStagesListValue>) => {
          state.isLoading = false;
          if (action.payload && action.payload.gradeDtos) {
            state.educationalStages = Array.isArray(action.payload.gradeDtos)
              ? action.payload.gradeDtos
              : [];
            state.pagination = {
              pageIndex: action.payload.pageIndex || 1,
              pageSize: action.payload.pageSize || 10,
              totalItems: action.payload.totalItems || 0,
              totalPages: action.payload.totalPages || 0,
            };
          } else {
            state.educationalStages = [];
            state.pagination = {
              pageIndex: 1,
              pageSize: 10,
              totalItems: 0,
              totalPages: 0,
            };
          }
        }
      )
      .addCase(getEducationalStagesBySubSystemId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(getEducationalStageBySubsystemId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getEducationalStageBySubsystemId.fulfilled,
        (state, action: PayloadAction<EducationalStageResponse>) => {
          state.isLoading = false;
          state.educationalStageDetails = action.payload as EducationalStageResponse;
        }
      )
      .addCase(getEducationalStageBySubsystemId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(addEducationalStage.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(addEducationalStage.fulfilled, (state, action: PayloadAction<ApiResponseModel>) => {
        state.isCreating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess) state.validationErrors = validationErrors;
      })
      .addCase(addEducationalStage.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      .addCase(editEducationalStage.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(editEducationalStage.fulfilled, (state, action: PayloadAction<ApiResponseModel>) => {
        state.isUpdating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess) state.validationErrors = validationErrors;
      })
      .addCase(editEducationalStage.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      .addCase(getLKSchoolStages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getLKSchoolStages.fulfilled,
        (state, action: PayloadAction<LKSchoolStageResponse[]>) => {
          state.isLoading = false;
          state.lkEducationalStages = action.payload;
        }
      )
      .addCase(getLKSchoolStages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteEducationalStage.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(
        deleteEducationalStage.fulfilled,
        (state, action: PayloadAction<ApiResponseModel>) => {
          state.isDeleting = false;
          const { isSuccess, value } = action.payload;
          if (isSuccess) {
            state.educationalStages = state.educationalStages?.filter((s) => s?.id !== value);
            if (
              typeof state.pagination.totalItems === 'number' &&
              state.pagination.totalItems > 0
            ) {
              state.pagination.totalItems -= 1 as number;
            }
          }
        }
      )
      .addCase(deleteEducationalStage.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export default educationalStagesSlice.reducer;
