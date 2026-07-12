import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import aiExamApiService from '@/services/api/ai-exam/ai-exam.service';
import type {
  AIExamDetails,
  AIExamGeneratedQuestion,
  AIExamListItem,
  AIExamsListData,
  AIExamsListQueryParams,
  CreateAIExamRequest,
  GenerateAIExamQuestionsRequest,
} from '@/services/api/types/ai-exam.types';

export interface AIExamState {
  exams: AIExamListItem[];
  generatedQuestions: AIExamGeneratedQuestion[];
  createdExam: AIExamDetails | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  isLoadingList: boolean;
  isGenerating: boolean;
  isCreating: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AIExamState = {
  exams: [],
  generatedQuestions: [],
  createdExam: null,
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoadingList: false,
  isGenerating: false,
  isCreating: false,
  error: null,
  isInitialized: false,
};

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
