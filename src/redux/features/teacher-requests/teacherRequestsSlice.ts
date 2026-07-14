import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type ActionReducerMapBuilder,
} from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { teacherRequestsApiService } from '@/services/api/teacher-requests/teacher-requests.service';
import type {
  TeacherRequestsSummaryDto,
  TeacherRequestsSummaryParams,
  JobApplicationRequestDto,
  JobApplicationsQueryParams,
  EarlyLeaveRequestDto,
  EarlyLeaveQueryParams,
  UpdateEarlyLeaveStatusRequest,
  TeacherMessageDto,
  TeacherMessagesQueryParams,
  TeacherNoteDto,
  TeacherNotesQueryParams,
  PaginatedList,
  PaginationMeta,
} from '@/services/api/types/teacher-requests.types';

// ============================================================================
// Types
// ============================================================================

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ListResult<T> {
  items: T[];
  pagination: PaginationState;
}

interface JobApplicationsStatsState {
  total: number;
  totalAccepted: number;
  totalRejected: number;
  totalPending: number;
  totalCancelled: number;
  totalArchived: number;
  totalInterviewScheduled: number;
}

interface JobApplicationsResult {
  items: JobApplicationRequestDto[];
  pagination: PaginationState;
  stats: JobApplicationsStatsState;
}

export interface TeacherRequestsState {
  // Summary
  summary: TeacherRequestsSummaryDto | null;

  // Job applications (apply-job-advertisment)
  jobApplications: JobApplicationRequestDto[];
  currentJobApplication: JobApplicationRequestDto | null;
  jobApplicationsPagination: PaginationState;
  jobApplicationsStats: JobApplicationsStatsState;

  // Early leave
  earlyLeaves: EarlyLeaveRequestDto[];
  currentEarlyLeave: EarlyLeaveRequestDto | null;
  earlyLeavesPagination: PaginationState;

  // Messages
  messages: TeacherMessageDto[];
  currentMessage: TeacherMessageDto | null;
  messagesPagination: PaginationState;

  // Notes
  notes: TeacherNoteDto[];
  currentNote: TeacherNoteDto | null;
  notesPagination: PaginationState;

  // Loading states
  isSummaryLoading: boolean;
  isJobApplicationsLoading: boolean;
  isEarlyLeavesLoading: boolean;
  isMessagesLoading: boolean;
  isNotesLoading: boolean;
  isDetailsLoading: boolean;
  isUpdatingStatus: boolean;

  // Error
  error: string | null;
}

const defaultPagination: PaginationState = { page: 1, limit: 10, total: 0, totalPages: 0 };
const defaultJobApplicationsStats: JobApplicationsStatsState = {
  total: 0,
  totalAccepted: 0,
  totalRejected: 0,
  totalPending: 0,
  totalCancelled: 0,
  totalArchived: 0,
  totalInterviewScheduled: 0,
};

const initialState: TeacherRequestsState = {
  summary: null,

  jobApplications: [],
  currentJobApplication: null,
  jobApplicationsPagination: { ...defaultPagination },
  jobApplicationsStats: { ...defaultJobApplicationsStats },

  earlyLeaves: [],
  currentEarlyLeave: null,
  earlyLeavesPagination: { ...defaultPagination },

  messages: [],
  currentMessage: null,
  messagesPagination: { ...defaultPagination },

  notes: [],
  currentNote: null,
  notesPagination: { ...defaultPagination },

  isSummaryLoading: false,
  isJobApplicationsLoading: false,
  isEarlyLeavesLoading: false,
  isMessagesLoading: false,
  isNotesLoading: false,
  isDetailsLoading: false,
  isUpdatingStatus: false,

  error: null,
};

// ============================================================================
// Helpers
// ============================================================================

const buildPagination = (meta?: Partial<PaginationMeta> | null): PaginationState => ({
  page: meta?.pageIndex ?? defaultPagination.page,
  limit: meta?.pageSize ?? defaultPagination.limit,
  total: meta?.totalItems ?? 0,
  totalPages: meta?.totalPages ?? 0,
});

const toListResult = <T>(data?: PaginatedList<T> | null): ListResult<T> => ({
  items: data?.items ?? [],
  pagination: buildPagination(data),
});

// ============================================================================
// Thunks
// ============================================================================

export const fetchTeacherRequestsSummary = createAsyncThunk<
  TeacherRequestsSummaryDto | null,
  TeacherRequestsSummaryParams | void
>('teacherRequests/fetchSummary', async (params, { rejectWithValue }) => {
  try {
    const response = await teacherRequestsApiService.getTeacherRequestsSummary(params || undefined);
    return response.data ?? response.value ?? null;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchJobApplications = createAsyncThunk<
  JobApplicationsResult,
  JobApplicationsQueryParams | void
>('teacherRequests/fetchJobApplications', async (params, { rejectWithValue }) => {
  try {
    const response = await teacherRequestsApiService.getJobApplications(params || undefined);
    const data = response.data;
    return {
      items: data?.teacherRequestsApplyJobAdvertisments ?? [],
      pagination: buildPagination(data),
      stats: {
        total: data?.total ?? 0,
        totalAccepted: data?.totalAccepted ?? 0,
        totalRejected: data?.totalRejected ?? 0,
        totalPending: data?.totalPending ?? 0,
        totalCancelled: data?.totalCancelled ?? 0,
        totalArchived: data?.totalArchived ?? 0,
        totalInterviewScheduled: data?.totalInterviewScheduled ?? 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchJobApplicationById = createAsyncThunk<JobApplicationRequestDto, string>(
  'teacherRequests/fetchJobApplicationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teacherRequestsApiService.getJobApplicationById(id);
      return response.data ?? response.value;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchEarlyLeaves = createAsyncThunk<
  ListResult<EarlyLeaveRequestDto>,
  EarlyLeaveQueryParams | void
>('teacherRequests/fetchEarlyLeaves', async (params, { rejectWithValue }) => {
  try {
    const response = await teacherRequestsApiService.getEarlyLeaves(params || undefined);
    const data = response.data;
    return {
      items: data?.teacherRequestsEarlyLeaves ?? [],
      pagination: buildPagination(data),
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchEarlyLeaveById = createAsyncThunk<EarlyLeaveRequestDto, string>(
  'teacherRequests/fetchEarlyLeaveById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teacherRequestsApiService.getEarlyLeaveById(id);
      return response.data ?? response.value;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateEarlyLeaveStatus = createAsyncThunk<
  UpdateEarlyLeaveStatusRequest,
  UpdateEarlyLeaveStatusRequest
>('teacherRequests/updateEarlyLeaveStatus', async (body, { rejectWithValue }) => {
  try {
    await teacherRequestsApiService.updateEarlyLeaveStatus(body);
    return body;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchTeacherMessages = createAsyncThunk<
  ListResult<TeacherMessageDto>,
  TeacherMessagesQueryParams | void
>('teacherRequests/fetchMessages', async (params, { rejectWithValue }) => {
  try {
    const response = await teacherRequestsApiService.getTeacherMessages(params || undefined);
    const data = response.data;
    return {
      items: data?.teacherRequestMessages ?? [],
      pagination: buildPagination(data),
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchTeacherMessageById = createAsyncThunk<TeacherMessageDto, string>(
  'teacherRequests/fetchMessageById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teacherRequestsApiService.getTeacherMessageById(id);
      return response.data ?? response.value;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTeacherNotes = createAsyncThunk<
  ListResult<TeacherNoteDto>,
  TeacherNotesQueryParams | void
>('teacherRequests/fetchNotes', async (params, { rejectWithValue }) => {
  try {
    const response = await teacherRequestsApiService.getTeacherNotes(params || undefined);
    const data = response.data;
    return {
      items: data?.notes ?? [],
      pagination: buildPagination(data),
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchTeacherNoteById = createAsyncThunk<TeacherNoteDto, string>(
  'teacherRequests/fetchNoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teacherRequestsApiService.getTeacherNoteById(id);
      return response.data ?? response.value;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const teacherRequestsSlice = createSlice({
  name: 'teacherRequests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentJobApplication: (state) => {
      state.currentJobApplication = null;
    },
    clearCurrentEarlyLeave: (state) => {
      state.currentEarlyLeave = null;
    },
    clearCurrentMessage: (state) => {
      state.currentMessage = null;
    },
    clearCurrentNote: (state) => {
      state.currentNote = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<TeacherRequestsState>) => {
    // Summary
    builder
      .addCase(fetchTeacherRequestsSummary.pending, (state) => {
        state.isSummaryLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacherRequestsSummary.fulfilled, (state, action) => {
        state.isSummaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchTeacherRequestsSummary.rejected, (state, action) => {
        state.isSummaryLoading = false;
        state.error = action.payload as string;
      });

    // Job applications list
    builder
      .addCase(fetchJobApplications.pending, (state) => {
        state.isJobApplicationsLoading = true;
        state.error = null;
      })
      .addCase(
        fetchJobApplications.fulfilled,
        (state, action: PayloadAction<JobApplicationsResult>) => {
          state.isJobApplicationsLoading = false;
          state.jobApplications = action.payload.items;
          state.jobApplicationsPagination = action.payload.pagination;
          state.jobApplicationsStats = action.payload.stats;
        }
      )
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.isJobApplicationsLoading = false;
        state.error = action.payload as string;
      });

    // Job application details
    builder
      .addCase(fetchJobApplicationById.pending, (state) => {
        state.isDetailsLoading = true;
        state.error = null;
      })
      .addCase(
        fetchJobApplicationById.fulfilled,
        (state, action: PayloadAction<JobApplicationRequestDto>) => {
          state.isDetailsLoading = false;
          state.currentJobApplication = action.payload;
        }
      )
      .addCase(fetchJobApplicationById.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.error = action.payload as string;
      });

    // Early leaves list
    builder
      .addCase(fetchEarlyLeaves.pending, (state) => {
        state.isEarlyLeavesLoading = true;
        state.error = null;
      })
      .addCase(
        fetchEarlyLeaves.fulfilled,
        (state, action: PayloadAction<ListResult<EarlyLeaveRequestDto>>) => {
          state.isEarlyLeavesLoading = false;
          state.earlyLeaves = action.payload.items;
          state.earlyLeavesPagination = action.payload.pagination;
        }
      )
      .addCase(fetchEarlyLeaves.rejected, (state, action) => {
        state.isEarlyLeavesLoading = false;
        state.error = action.payload as string;
      });

    // Early leave details
    builder
      .addCase(fetchEarlyLeaveById.pending, (state) => {
        state.isDetailsLoading = true;
        state.error = null;
      })
      .addCase(
        fetchEarlyLeaveById.fulfilled,
        (state, action: PayloadAction<EarlyLeaveRequestDto>) => {
          state.isDetailsLoading = false;
          state.currentEarlyLeave = action.payload;
        }
      )
      .addCase(fetchEarlyLeaveById.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.error = action.payload as string;
      });

    // Update early leave status
    builder
      .addCase(updateEarlyLeaveStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.error = null;
      })
      .addCase(
        updateEarlyLeaveStatus.fulfilled,
        (state, action: PayloadAction<UpdateEarlyLeaveStatusRequest>) => {
          state.isUpdatingStatus = false;
          const { id, status } = action.payload;
          state.earlyLeaves = state.earlyLeaves.map((item) =>
            item.id === id ? { ...item, requestStatus: status } : item
          );
          if (state.currentEarlyLeave?.id === id) {
            state.currentEarlyLeave = { ...state.currentEarlyLeave, requestStatus: status };
          }
        }
      )
      .addCase(updateEarlyLeaveStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.error = action.payload as string;
      });

    // Messages list
    builder
      .addCase(fetchTeacherMessages.pending, (state) => {
        state.isMessagesLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTeacherMessages.fulfilled,
        (state, action: PayloadAction<ListResult<TeacherMessageDto>>) => {
          state.isMessagesLoading = false;
          state.messages = action.payload.items;
          state.messagesPagination = action.payload.pagination;
        }
      )
      .addCase(fetchTeacherMessages.rejected, (state, action) => {
        state.isMessagesLoading = false;
        state.error = action.payload as string;
      });

    // Message details
    builder
      .addCase(fetchTeacherMessageById.pending, (state) => {
        state.isDetailsLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTeacherMessageById.fulfilled,
        (state, action: PayloadAction<TeacherMessageDto>) => {
          state.isDetailsLoading = false;
          state.currentMessage = action.payload;
        }
      )
      .addCase(fetchTeacherMessageById.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.error = action.payload as string;
      });

    // Notes list
    builder
      .addCase(fetchTeacherNotes.pending, (state) => {
        state.isNotesLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTeacherNotes.fulfilled,
        (state, action: PayloadAction<ListResult<TeacherNoteDto>>) => {
          state.isNotesLoading = false;
          state.notes = action.payload.items;
          state.notesPagination = action.payload.pagination;
        }
      )
      .addCase(fetchTeacherNotes.rejected, (state, action) => {
        state.isNotesLoading = false;
        state.error = action.payload as string;
      });

    // Note details
    builder
      .addCase(fetchTeacherNoteById.pending, (state) => {
        state.isDetailsLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacherNoteById.fulfilled, (state, action: PayloadAction<TeacherNoteDto>) => {
        state.isDetailsLoading = false;
        state.currentNote = action.payload;
      })
      .addCase(fetchTeacherNoteById.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentJobApplication,
  clearCurrentEarlyLeave,
  clearCurrentMessage,
  clearCurrentNote,
} = teacherRequestsSlice.actions;

export default teacherRequestsSlice.reducer;
