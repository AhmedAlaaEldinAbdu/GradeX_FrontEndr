import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { parentApiService } from '@/services/api/parent/parent.service';
import type {
  ParentApiResponse,
  RegisterParentRequest,
  ParentLoginRequest,
  ParentResendOtpRequest,
  ParentConfirmOtpRequest,
  ParentChangePasswordRequest,
  ParentResetPasswordRequest,
  UpdateParentRequest,
  LikeFavoriteSchoolBranchRequest,
  DisLikeFavoriteSchoolBranchRequest,
  ParentProfile,
  ParentListItem,
  DeleteParentAccountRequest,
} from '@/services/api/types/parent.types';
import { getErrorMessage } from '@/lib/http';

// ============================================================================
// Types
// ============================================================================

interface ListPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface ParentState {
  profile: ParentProfile | null;
  parents: ParentListItem[];
  parentsPagination: ListPagination;

  isProfileLoading: boolean;
  isParentsLoading: boolean;
  isSubmitting: boolean;

  error: string | null;
  isDeleting: boolean;
}

export interface FetchParentsByBranchPayload {
  schoolBranchId: string;
  pageIndex?: number;
  pageSize?: number;
}

const emptyPagination: ListPagination = {
  pageIndex: 1,
  totalPages: 0,
  totalItems: 0,
  pageSize: 10,
};

const initialState: ParentState = {
  profile: null,
  parents: [],
  parentsPagination: emptyPagination,
  isProfileLoading: false,
  isParentsLoading: false,
  isSubmitting: false,
  error: null,
  isDeleting: false,
};

// ============================================================================
// Async Thunks — auth / account (thin: just call the API and return)
// ============================================================================

export const registerParent = createAsyncThunk<ParentApiResponse, RegisterParentRequest>(
  'parent/registerParent',
  async (data, { rejectWithValue }) => {
    try {
      return await parentApiService.registerParent(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loginParent = createAsyncThunk<ParentApiResponse, ParentLoginRequest>(
  'parent/loginParent',
  async (data, { rejectWithValue }) => {
    try {
      return await parentApiService.loginParent(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const resendParentOtp = createAsyncThunk<ParentApiResponse, ParentResendOtpRequest>(
  'parent/resendParentOtp',
  async (data, { rejectWithValue }) => {
    try {
      return await parentApiService.resendParentOtp(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const confirmParentOtp = createAsyncThunk<ParentApiResponse, ParentConfirmOtpRequest>(
  'parent/confirmParentOtp',
  async (data, { rejectWithValue }) => {
    try {
      return await parentApiService.confirmParentOtp(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const changeParentPassword = createAsyncThunk<
  ParentApiResponse,
  ParentChangePasswordRequest
>('parent/changeParentPassword', async (data, { rejectWithValue }) => {
  try {
    return await parentApiService.changeParentPassword(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const resetParentPassword = createAsyncThunk<
  ParentApiResponse,
  ParentResetPasswordRequest
>('parent/resetParentPassword', async (data, { rejectWithValue }) => {
  try {
    return await parentApiService.resetParentPassword(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ============================================================================
// Async Thunks — profile / favorites / list
// ============================================================================

export const updateParent = createAsyncThunk<ParentApiResponse, UpdateParentRequest>(
  'parent/updateParent',
  async (data, { rejectWithValue }) => {
    try {
      return await parentApiService.updateParent(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchParentProfile = createAsyncThunk<ParentProfile | null, void>(
  'parent/fetchParentProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await parentApiService.getParentProfile();
      if (!response?.isSuccess) {
        return rejectWithValue(response?.message || 'Failed to fetch parent profile');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const likeFavoriteSchoolBranch = createAsyncThunk<
  ParentApiResponse,
  LikeFavoriteSchoolBranchRequest
>('parent/likeFavoriteSchoolBranch', async (data, { rejectWithValue }) => {
  try {
    return await parentApiService.likeFavoriteSchoolBranch(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const dislikeFavoriteSchoolBranch = createAsyncThunk<
  ParentApiResponse,
  DisLikeFavoriteSchoolBranchRequest
>('parent/dislikeFavoriteSchoolBranch', async (data, { rejectWithValue }) => {
  try {
    return await parentApiService.dislikeFavoriteSchoolBranch(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchParentsByBranch = createAsyncThunk<
  { parents: ParentListItem[]; pagination: ListPagination },
  FetchParentsByBranchPayload
>('parent/fetchParentsByBranch', async (payload, { rejectWithValue }) => {
  try {
    const response = await parentApiService.getParentsByBranchId(payload.schoolBranchId, {
      pageIndex: payload.pageIndex,
      pageSize: payload.pageSize,
    });

    if (!response?.isSuccess || !response.data) {
      return { parents: [], pagination: emptyPagination };
    }

    return {
      parents: response.data.parents || [],
      pagination: {
        pageIndex: response.data.pageIndex || 1,
        totalPages: response.data.totalPages || 0,
        totalItems: response.data.totalItems || 0,
        pageSize: response.data.pageSize || 10,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});


export const deleteParentAccount = createAsyncThunk<
  void,
  DeleteParentAccountRequest
>(
  'parent/deleteParentAccount',
  async (payload, { rejectWithValue }) => {
    try {
      await parentApiService.deleteParentAccount(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const parentSlice = createSlice({
  name: 'parent',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ParentState>) => {
    // Thin mutation thunks share generic submitting/error handling.
    const mutationThunks = [
      registerParent,
      loginParent,
      resendParentOtp,
      confirmParentOtp,
      changeParentPassword,
      resetParentPassword,
      updateParent,
      likeFavoriteSchoolBranch,
      dislikeFavoriteSchoolBranch,
    ];

    mutationThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.isSubmitting = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.isSubmitting = false;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.isSubmitting = false;
          state.error = action.payload as string;
        });
    });

    builder
      .addCase(fetchParentProfile.pending, (state) => {
        state.isProfileLoading = true;
        state.error = null;
      })
      .addCase(
        fetchParentProfile.fulfilled,
        (state, action: PayloadAction<ParentProfile | null>) => {
          state.isProfileLoading = false;
          state.profile = action.payload;
        }
      )
      .addCase(fetchParentProfile.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchParentsByBranch.pending, (state) => {
        state.isParentsLoading = true;
        state.error = null;
      })
      .addCase(fetchParentsByBranch.fulfilled, (state, action) => {
        state.isParentsLoading = false;
        state.parents = action.payload.parents;
        state.parentsPagination = action.payload.pagination;
      })
      .addCase(fetchParentsByBranch.rejected, (state, action) => {
        state.isParentsLoading = false;
        state.error = action.payload as string;
      });
    // Delete Parent Account
    builder
      .addCase(deleteParentAccount.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteParentAccount.fulfilled, (state) => {
        state.isDeleting = false;
      })
      .addCase(deleteParentAccount.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// Exports
// ============================================================================

export const { clearError } = parentSlice.actions;

export default parentSlice.reducer;
