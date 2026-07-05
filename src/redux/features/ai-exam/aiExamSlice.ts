import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import aiExamApiService from '@/services/api/ai-exam/ai-exam.service';
import type {
  AIExamDetails,
  AIExamGeneratedQuestion,
  CreateAIExamRequest,
  GenerateAIExamQuestionsRequest,
} from '@/services/api/types/ai-exam.types';

export interface AIExamState {
  generatedQuestions: AIExamGeneratedQuestion[];
  createdExam: AIExamDetails | null;
  isGenerating: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: AIExamState = {
  generatedQuestions: [],
  createdExam: null,
  isGenerating: false,
  isCreating: false,
  error: null,
};

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
