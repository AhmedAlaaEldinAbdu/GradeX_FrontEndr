import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import aiExamApiService from '@/services/api/ai-exam/ai-exam.service';
import type {
  AIExamDashboardStats,
  AIExamDashboardStatsQueryParams,
  AIExamDetailsQueryParams,
  AIExamDetails,
  AIExamGeneratedQuestion,
  AIExamListItem,
  AIExamQuestionStats,
  AIExamResultsDistributionBucket,
  AIExamStudentResult,
  AIExamStudentsResultsData,
  AIExamStudentsResultsQueryParams,
  AIExamSummary,
  AIExamsListData,
  AIExamsListQueryParams,
  CreateAIExamRequest,
  GenerateAIExamQuestionsRequest,
} from '@/services/api/types/ai-exam.types';

export interface AIExamState {
  exams: AIExamListItem[];
  dashboardStats: AIExamDashboardStats;
  currentExamSummary: AIExamSummary | null;
  examQuestionsStats: AIExamQuestionStats[];
  examResultsDistribution: AIExamResultsDistributionBucket[];
  examStudentsResults: AIExamStudentResult[];
  examStudentsPagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  generatedQuestions: AIExamGeneratedQuestion[];
  createdExam: AIExamDetails | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  isLoadingDashboardStats: boolean;
  isLoadingList: boolean;
  isLoadingExamSummary: boolean;
  isLoadingExamQuestionsStats: boolean;
  isLoadingExamResultsDistribution: boolean;
  isLoadingExamStudentsResults: boolean;
  isGenerating: boolean;
  isCreating: boolean;
  error: string | null;
  dashboardStatsError: string | null;
  examSummaryError: string | null;
  examQuestionsStatsError: string | null;
  examResultsDistributionError: string | null;
  examStudentsResultsError: string | null;
  isInitialized: boolean;
}

const initialState: AIExamState = {
  exams: [],
  dashboardStats: {
    successRate: 0,
    activeExamsCount: 0,
  },
  currentExamSummary: null,
  examQuestionsStats: [],
  examResultsDistribution: [],
  examStudentsResults: [],
  examStudentsPagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  generatedQuestions: [],
  createdExam: null,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoadingDashboardStats: false,
  isLoadingList: false,
  isLoadingExamSummary: false,
  isLoadingExamQuestionsStats: false,
  isLoadingExamResultsDistribution: false,
  isLoadingExamStudentsResults: false,
  isGenerating: false,
  isCreating: false,
  error: null,
  dashboardStatsError: null,
  examSummaryError: null,
  examQuestionsStatsError: null,
  examResultsDistributionError: null,
  examStudentsResultsError: null,
  isInitialized: false,
};

export const fetchAIExamDashboardStats = createAsyncThunk<
  AIExamDashboardStats,
  AIExamDashboardStatsQueryParams
>('aiExam/fetchDashboardStats', async (params, { rejectWithValue }) => {
  try {
    const response = await aiExamApiService.getAIExamDashboardStats(params);
    if (!response.isSuccess) {
      return rejectWithValue(response.message || 'Failed to fetch AI exam dashboard stats');
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAIExams = createAsyncThunk<AIExamsListData, AIExamsListQueryParams>(
  'aiExam/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await aiExamApiService.getAIExams(params);
      if (!response.isSuccess) {
        return rejectWithValue(response.message || 'Failed to fetch AI exams');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAIExamSummary = createAsyncThunk<AIExamSummary | null, AIExamDetailsQueryParams>(
  'aiExam/fetchSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await aiExamApiService.getAIExamSummary(params);
      if (!response.isSuccess) {
        return rejectWithValue(response.message || 'Failed to fetch AI exam summary');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAIExamQuestionsStats = createAsyncThunk<
  AIExamQuestionStats[],
  AIExamDetailsQueryParams
>('aiExam/fetchQuestionsStats', async (params, { rejectWithValue }) => {
  try {
    const response = await aiExamApiService.getAIExamQuestionsStats(params);
    if (!response.isSuccess) {
      return rejectWithValue(response.message || 'Failed to fetch AI exam questions stats');
    }

    return response.data ?? [];
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAIExamResultsDistribution = createAsyncThunk<
  AIExamResultsDistributionBucket[],
  AIExamDetailsQueryParams
>('aiExam/fetchResultsDistribution', async (params, { rejectWithValue }) => {
  try {
    const response = await aiExamApiService.getAIExamResultsDistribution(params);
    if (!response.isSuccess) {
      return rejectWithValue(response.message || 'Failed to fetch AI exam results distribution');
    }

    return response.data ?? [];
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAIExamStudentsResults = createAsyncThunk<
  AIExamStudentsResultsData,
  AIExamStudentsResultsQueryParams
>('aiExam/fetchStudentsResults', async (params, { rejectWithValue }) => {
  try {
    const response = await aiExamApiService.getAIExamStudentsResults(params);
    if (!response.isSuccess) {
      return rejectWithValue(response.message || 'Failed to fetch AI exam students results');
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const generateAIExamQuestions = createAsyncThunk<
  AIExamGeneratedQuestion[],
  GenerateAIExamQuestionsRequest
>('aiExam/generateQuestions', async (payload, { rejectWithValue }) => {
  try {
    const response = await aiExamApiService.generateAIExamQuestions(payload);
    if (!response.isSuccess) {
      return rejectWithValue(response.message || 'Failed to generate exam questions');
    }

    return (response.data ?? []).map((question, index) => ({
      ...question,
      id: `ai-question-${Date.now()}-${index}`,
      order: index + 1,
    }));
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createAIExam = createAsyncThunk<AIExamDetails, CreateAIExamRequest>(
  'aiExam/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await aiExamApiService.createAIExam(payload);
      if (!response.isSuccess) {
        return rejectWithValue(response.message || 'Failed to create AI exam');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const aiExamSlice = createSlice({
  name: 'aiExam',
  initialState,
  reducers: {
    clearAIExamError: (state) => {
      state.error = null;
      state.dashboardStatsError = null;
      state.examSummaryError = null;
      state.examQuestionsStatsError = null;
      state.examResultsDistributionError = null;
      state.examStudentsResultsError = null;
    },
    clearGeneratedQuestions: (state) => {
      state.generatedQuestions = [];
    },
    removeGeneratedQuestion: (state, action: PayloadAction<string>) => {
      state.generatedQuestions = state.generatedQuestions
        .filter((question) => question.id !== action.payload)
        .map((question, index) => ({ ...question, order: index + 1 }));
    },
    updateGeneratedQuestion: (state, action: PayloadAction<AIExamGeneratedQuestion>) => {
      const index = state.generatedQuestions.findIndex(
        (question) => question.id === action.payload.id
      );
      if (index !== -1) {
        state.generatedQuestions[index] = action.payload;
      }
    },
    resetAIExamState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIExamDashboardStats.pending, (state) => {
        state.isLoadingDashboardStats = true;
        state.dashboardStatsError = null;
      })
      .addCase(
        fetchAIExamDashboardStats.fulfilled,
        (state, action: PayloadAction<AIExamDashboardStats>) => {
          state.isLoadingDashboardStats = false;
          state.dashboardStats = {
            successRate: action.payload.successRate ?? 0,
            activeExamsCount: action.payload.activeExamsCount ?? 0,
          };
        }
      )
      .addCase(fetchAIExamDashboardStats.rejected, (state, action) => {
        state.isLoadingDashboardStats = false;
        state.dashboardStatsError = action.payload as string;
      });

    builder
      .addCase(fetchAIExams.pending, (state) => {
        state.isLoadingList = true;
        state.error = null;
      })
      .addCase(fetchAIExams.fulfilled, (state, action: PayloadAction<AIExamsListData>) => {
        state.isLoadingList = false;
        state.exams = action.payload.exams ?? [];
        state.pagination = {
          pageIndex: action.payload.pageIndex ?? 1,
          pageSize: action.payload.pageSize ?? 10,
          totalItems: action.payload.totalItems ?? 0,
          totalPages: action.payload.totalPages ?? 0,
        };
        state.isInitialized = true;
      })
      .addCase(fetchAIExams.rejected, (state, action) => {
        state.isLoadingList = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAIExamSummary.pending, (state) => {
        state.isLoadingExamSummary = true;
        state.examSummaryError = null;
        state.currentExamSummary = null;
      })
      .addCase(
        fetchAIExamSummary.fulfilled,
        (state, action: PayloadAction<AIExamSummary | null>) => {
          state.isLoadingExamSummary = false;
          state.currentExamSummary = action.payload;
        }
      )
      .addCase(fetchAIExamSummary.rejected, (state, action) => {
        state.isLoadingExamSummary = false;
        state.examSummaryError = action.payload as string;
      });

    builder
      .addCase(fetchAIExamQuestionsStats.pending, (state) => {
        state.isLoadingExamQuestionsStats = true;
        state.examQuestionsStatsError = null;
        state.examQuestionsStats = [];
      })
      .addCase(
        fetchAIExamQuestionsStats.fulfilled,
        (state, action: PayloadAction<AIExamQuestionStats[]>) => {
          state.isLoadingExamQuestionsStats = false;
          state.examQuestionsStats = action.payload;
        }
      )
      .addCase(fetchAIExamQuestionsStats.rejected, (state, action) => {
        state.isLoadingExamQuestionsStats = false;
        state.examQuestionsStatsError = action.payload as string;
      });

    builder
      .addCase(fetchAIExamResultsDistribution.pending, (state) => {
        state.isLoadingExamResultsDistribution = true;
        state.examResultsDistributionError = null;
        state.examResultsDistribution = [];
      })
      .addCase(
        fetchAIExamResultsDistribution.fulfilled,
        (state, action: PayloadAction<AIExamResultsDistributionBucket[]>) => {
          state.isLoadingExamResultsDistribution = false;
          state.examResultsDistribution = action.payload;
        }
      )
      .addCase(fetchAIExamResultsDistribution.rejected, (state, action) => {
        state.isLoadingExamResultsDistribution = false;
        state.examResultsDistributionError = action.payload as string;
      });

    builder
      .addCase(fetchAIExamStudentsResults.pending, (state) => {
        state.isLoadingExamStudentsResults = true;
        state.examStudentsResultsError = null;
      })
      .addCase(
        fetchAIExamStudentsResults.fulfilled,
        (state, action: PayloadAction<AIExamStudentsResultsData>) => {
          state.isLoadingExamStudentsResults = false;
          state.examStudentsResults = action.payload.students ?? [];
          state.examStudentsPagination = {
            pageIndex: action.payload.pageIndex ?? 1,
            pageSize: action.payload.pageSize ?? 10,
            totalItems: action.payload.totalItems ?? 0,
            totalPages: action.payload.totalPages ?? 0,
          };
        }
      )
      .addCase(fetchAIExamStudentsResults.rejected, (state, action) => {
        state.isLoadingExamStudentsResults = false;
        state.examStudentsResultsError = action.payload as string;
      });

    builder
      .addCase(generateAIExamQuestions.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(
        generateAIExamQuestions.fulfilled,
        (state, action: PayloadAction<AIExamGeneratedQuestion[]>) => {
          state.isGenerating = false;
          state.generatedQuestions = action.payload;
        }
      )
      .addCase(generateAIExamQuestions.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createAIExam.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAIExam.fulfilled, (state, action: PayloadAction<AIExamDetails>) => {
        state.isCreating = false;
        state.createdExam = action.payload;
      })
      .addCase(createAIExam.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearAIExamError,
  clearGeneratedQuestions,
  removeGeneratedQuestion,
  resetAIExamState,
  updateGeneratedQuestion,
} = aiExamSlice.actions;

export default aiExamSlice.reducer;
