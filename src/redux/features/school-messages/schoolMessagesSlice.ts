import { createSlice, type ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { schoolMessageApiService } from '@/services/api/requests/school-message.service';
import type {
  CreateSchoolMessageRequest,
  SchoolMessageDto,
  SchoolMessagesListResponse,
  SchoolMessagesQueryParams,
} from '@/services/api/requests/requests.types';
import { getErrorMessage } from '@/lib/http';

export interface SchoolMessagesState {
  isCreating: boolean;
  error: string | null;
  messages: SchoolMessageDto[];
  isLoading: boolean;
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

const initialState: SchoolMessagesState = {
  isCreating: false,
  error: null,
  messages: [],
  isLoading: false,
  pageIndex: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,
};

export const createSchoolMessage = createAsyncThunk<void, CreateSchoolMessageRequest>(
  'schoolMessages/createSchoolMessage',
  async (data, { rejectWithValue }) => {
    try {
      await schoolMessageApiService.createSchoolMessage(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSchoolMessages = createAsyncThunk<
  SchoolMessagesListResponse,
  SchoolMessagesQueryParams | undefined
>('schoolMessages/fetchSchoolMessages', async (params, { rejectWithValue }) => {
  try {
    return await schoolMessageApiService.getAllSchoolMessages(params);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const schoolMessagesSlice = createSlice({
  name: 'schoolMessages',
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<SchoolMessagesState>) => {
    builder
      .addCase(createSchoolMessage.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSchoolMessage.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(createSchoolMessage.rejected, (state, action) => {
        state.isCreating = false;
        state.error = (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(fetchSchoolMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchoolMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.pageIndex = action.payload.pageIndex;
        state.totalPages = action.payload.totalPages;
        state.totalItems = action.payload.totalItems;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchSchoolMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? null;
      });
  },
});

export default schoolMessagesSlice.reducer;
