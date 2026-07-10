import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import { requestAppointmentApiService } from '@/services/api/requests/request-appointment.service';
import type {
  RequestAppointmentDto,
  RequestAppointmentsListResponse,
  RequestAppointmentsQueryParams,
} from '@/services/api/requests/requests.types';

interface RequestAppointmentState {
  appointments: RequestAppointmentDto[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: RequestAppointmentState = {
  appointments: [],
  pagination: {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

export interface FetchRequestAppointmentsPayload {
  page?: number;
  limit?: number;
}

export const fetchRequestAppointments = createAsyncThunk<
  RequestAppointmentsListResponse,
  FetchRequestAppointmentsPayload | void,
  { rejectValue: string }
>('requestAppointments/fetchAppointments', async (payload, { rejectWithValue }) => {
  try {
    const params: RequestAppointmentsQueryParams = {
      PageIndex: payload?.page ?? 1,
      PageSize: payload?.limit ?? 10,
    };

    return await requestAppointmentApiService.getRequestAppointments(params);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const requestAppointmentSlice = createSlice({
  name: 'requestAppointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequestAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchRequestAppointments.fulfilled,
        (state, action: PayloadAction<RequestAppointmentsListResponse>) => {
          state.isLoading = false;
          state.appointments = action.payload.appointments;
          state.pagination = {
            pageIndex: action.payload.pageIndex,
            pageSize: action.payload.pageSize,
            totalItems: action.payload.totalItems,
            totalPages: action.payload.totalPages,
          };
        }
      )
      .addCase(fetchRequestAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message ?? null;
      });
  },
});

export default requestAppointmentSlice.reducer;
