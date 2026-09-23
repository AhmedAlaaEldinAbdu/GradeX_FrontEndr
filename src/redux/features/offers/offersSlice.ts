import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import type { ApiResponseModel, ValidationErrorResponse } from '@/services/api/config';
import type { Pagination } from '@/types/Pagination';
import offerApiService from '@/services/api/offer/offer.service';
import type { OfferDto, OfferListData, OfferQueryParams } from '@/services/api/types/offer.types';
import type { CreateOfferRequest, UpdateOfferRequest } from '@/services/api/types/offer.types';

interface OffersState {
  offers: OfferDto[];
  offerDetails: OfferDto | null;
  pagination: Pagination;
  isLoading: boolean;
  isLoadingDetails: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  validationErrors: ValidationErrorResponse[] | string[] | null;
}

const initialState: OffersState = {
  offers: [],
  offerDetails: null,
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

export const fetchOffers = createAsyncThunk<OfferListData, OfferQueryParams | undefined>(
  'offers/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await offerApiService.getOffers(params);

      if (!response?.data || response.isSuccess === false) {
        return {
          offerDto: [],
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

export const fetchOfferById = createAsyncThunk<OfferDto, string>(
  'offers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await offerApiService.getOfferById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createOffer = createAsyncThunk<ApiResponseModel<null>, CreateOfferRequest>(
  'offers/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await offerApiService.createOffer(data);
      return response;
    } catch (error: any) {
      if (error.isValidationError && error.validationErrors) {
        return rejectWithValue({ validationErrors: error.validationErrors });
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateOffer = createAsyncThunk<ApiResponseModel<null>, UpdateOfferRequest>(
  'offers/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await offerApiService.updateOffer(data);
      return response;
    } catch (error: any) {
      if (error.isValidationError && error.validationErrors) {
        return rejectWithValue({ validationErrors: error.validationErrors });
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteOffer = createAsyncThunk<ApiResponseModel<string>, string>(
  'offers/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await offerApiService.deleteOffer(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    clearOffersError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    clearOfferDetails: (state) => {
      state.offerDetails = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<OffersState>) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action: PayloadAction<OfferListData>) => {
        state.isLoading = false;
        state.offers = Array.isArray(action.payload.offerDto) ? action.payload.offerDto : [];
        state.pagination = {
          pageIndex: action.payload.pageIndex || 1,
          pageSize: action.payload.pageSize || 10,
          totalItems: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchOfferById.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
        state.offerDetails = null;
      })
      .addCase(fetchOfferById.fulfilled, (state, action: PayloadAction<OfferDto>) => {
        state.isLoadingDetails = false;
        state.offerDetails = action.payload;
      })
      .addCase(fetchOfferById.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createOffer.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(createOffer.fulfilled, (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isCreating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess) state.validationErrors = validationErrors;
      })
      .addCase(createOffer.rejected, (state, action: any) => {
        state.isCreating = false;
        if (action.payload?.validationErrors) {
          state.validationErrors = action.payload.validationErrors;
          return;
        }
        state.error = action.payload as string;
      });

    builder
      .addCase(updateOffer.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(updateOffer.fulfilled, (state, action: PayloadAction<ApiResponseModel<null>>) => {
        state.isUpdating = false;
        const { isSuccess, validationErrors } = action.payload;
        if (!isSuccess) state.validationErrors = validationErrors;
      })
      .addCase(updateOffer.rejected, (state, action: any) => {
        state.isUpdating = false;
        if (action.payload?.validationErrors) {
          state.validationErrors = action.payload.validationErrors;
          return;
        }
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteOffer.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteOffer.fulfilled, (state, action: PayloadAction<ApiResponseModel<string>>) => {
        state.isDeleting = false;
        const { isSuccess, value } = action.payload;
        if (isSuccess && value) {
          state.offers = state.offers.filter((o) => o.id !== value);
          state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        }
      })
      .addCase(deleteOffer.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOffersError, clearOfferDetails } = offersSlice.actions;
export default offersSlice.reducer;
