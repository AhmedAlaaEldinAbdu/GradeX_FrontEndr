import { createSlice, type ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { schoolMessageApiService } from '@/services/api/requests/school-message.service';
import type { CreateSchoolMessageRequest } from '@/services/api/requests/requests.types';
import { getErrorMessage } from '@/lib/http';

export interface SchoolMessagesState {
  isCreating: boolean;
  error: string | null;
}

const initialState: SchoolMessagesState = {
  isCreating: false,
  error: null,
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
      });
  },
});

export default schoolMessagesSlice.reducer;
