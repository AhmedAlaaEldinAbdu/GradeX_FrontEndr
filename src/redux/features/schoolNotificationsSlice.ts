import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/lib/http';
import schoolNotificationApiService from '@/services/api/school-notification/school-notification.service';
import { studentsApiService } from '@/services/api/students/students.service';
import type { StudentDto } from '@/services/api/types/students.types';
import {
  SchoolNotificationTarget,
  type GetSchoolNotificationsRequest,
  type GetSchoolNotificationsResponse,
  type SchoolNotificationItem,
  type SchoolNotificationMetrics,
  type SchoolNotificationTargetValue,
  type SendSchoolNotificationRequest,
  type SendSchoolNotificationResponse,
} from '@/services/api/types/school-notification.types';

const DEFAULT_PAGE_SIZE = 10;

interface SchoolNotificationsPagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

interface SchoolNotificationsListState {
  items: SchoolNotificationItem[];
  pagination: SchoolNotificationsPagination;
  isLoading: boolean;
  error: string | null;
  requestId: string | null;
}

interface FetchNotificationStudentsPayload {
  schoolBranchId: string;
  classroomIds: string[];
}

type SendSchoolNotificationRejectValue = Partial<SendSchoolNotificationResponse> | string;

interface SchoolNotificationAxiosError {
  response?: {
    data?: Partial<SendSchoolNotificationResponse>;
  };
}

export interface SchoolNotificationsState {
  employeeNotifications: SchoolNotificationsListState;
  parentNotifications: SchoolNotificationsListState;
  metrics: SchoolNotificationMetrics;
  isSending: boolean;
  sendError: string | null;
  notificationStudents: StudentDto[];
  isLoadingNotificationStudents: boolean;
  notificationStudentsError: string | null;
  notificationStudentsRequestId: string | null;
}

const emptyMetrics = (): SchoolNotificationMetrics => ({
  totalNotifications: 0,
  totalTeacherNotifications: 0,
  totalParentNotifications: 0,
});

const createEmptyPagination = (
  pageIndex = 1,
  pageSize = DEFAULT_PAGE_SIZE
): SchoolNotificationsPagination => ({
  pageIndex,
  totalPages: 0,
  totalItems: 0,
  pageSize,
});

const createEmptyListState = (): SchoolNotificationsListState => ({
  items: [],
  pagination: createEmptyPagination(),
  isLoading: false,
  error: null,
  requestId: null,
});

const createInitialState = (): SchoolNotificationsState => ({
  employeeNotifications: createEmptyListState(),
  parentNotifications: createEmptyListState(),
  metrics: emptyMetrics(),
  isSending: false,
  sendError: null,
  notificationStudents: [],
  isLoadingNotificationStudents: false,
  notificationStudentsError: null,
  notificationStudentsRequestId: null,
});

const getListStateByTarget = (
  state: SchoolNotificationsState,
  target: SchoolNotificationTargetValue
) =>
  target === SchoolNotificationTarget.Parents
    ? state.parentNotifications
    : state.employeeNotifications;

const getSendNotificationRejectValue = (error: unknown): SendSchoolNotificationRejectValue =>
  (error as SchoolNotificationAxiosError)?.response?.data ?? getErrorMessage(error);

const getSendNotificationErrorMessage = (
  payload: SendSchoolNotificationRejectValue | undefined,
  fallback?: string
) => {
  if (!payload) return fallback ?? null;
  if (typeof payload === 'string') return payload;

  return (
    payload.message ?? payload.successMessage ?? payload.errors?.join(', ') ?? fallback ?? null
  );
};

const initialState = createInitialState();

export const fetchSchoolNotifications = createAsyncThunk<
  GetSchoolNotificationsResponse,
  GetSchoolNotificationsRequest,
  { rejectValue: string }
>('schoolNotifications/fetchSchoolNotifications', async (params, { rejectWithValue }) => {
  try {
    return await schoolNotificationApiService.getSchoolNotifications(params);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const sendSchoolNotification = createAsyncThunk<
  SendSchoolNotificationResponse,
  SendSchoolNotificationRequest,
  { rejectValue: SendSchoolNotificationRejectValue }
>('schoolNotifications/sendSchoolNotification', async (payload, { rejectWithValue }) => {
  try {
    const response = await schoolNotificationApiService.sendSchoolNotification(payload);

    if (response?.isSuccess === false) {
      return rejectWithValue(response);
    }

    return response;
  } catch (error) {
    return rejectWithValue(getSendNotificationRejectValue(error));
  }
});

export const fetchNotificationStudents = createAsyncThunk<
  StudentDto[],
  FetchNotificationStudentsPayload,
  { rejectValue: string }
>(
  'schoolNotifications/fetchNotificationStudents',
  async ({ schoolBranchId, classroomIds }, { rejectWithValue }) => {
    try {
      const uniqueClassroomIds = Array.from(new Set(classroomIds.filter(Boolean)));
      const responses = await Promise.all(
        uniqueClassroomIds.map((classroomId) =>
          studentsApiService.getStudents({
            PageIndex: 1,
            PageSize: 10000,
            SchoolBranchId: schoolBranchId,
            SchoolBrancheId: schoolBranchId,
            ClassroomId: classroomId,
          })
        )
      );

      const studentsById = new Map<string, StudentDto>();
      responses
        .flatMap((response) => response.data?.studentDto ?? [])
        .forEach((student) => {
          if (student.id) studentsById.set(student.id, student);
        });

      return Array.from(studentsById.values());
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const schoolNotificationsSlice = createSlice({
  name: 'schoolNotifications',
  initialState,
  reducers: {
    resetSchoolNotifications: () => createInitialState(),
    clearNotificationStudents(state) {
      state.notificationStudents = [];
      state.isLoadingNotificationStudents = false;
      state.notificationStudentsError = null;
      state.notificationStudentsRequestId = null;
    },
    clearSchoolNotificationSendError(state) {
      state.sendError = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<SchoolNotificationsState>) => {
    builder
      .addCase(fetchSchoolNotifications.pending, (state, action) => {
        const listState = getListStateByTarget(state, action.meta.arg.Target);
        listState.isLoading = true;
        listState.error = null;
        listState.requestId = action.meta.requestId;
      })
      .addCase(fetchSchoolNotifications.fulfilled, (state, action) => {
        const listState = getListStateByTarget(state, action.meta.arg.Target);
        if (listState.requestId !== action.meta.requestId) return;

        const data = action.payload.data;
        listState.items = data?.items ?? [];
        listState.pagination = {
          pageIndex: data?.pageIndex ?? action.meta.arg.PageIndex ?? 1,
          totalPages: data?.totalPages ?? 0,
          totalItems: data?.totalItems ?? 0,
          pageSize: data?.pageSize ?? action.meta.arg.PageSize ?? DEFAULT_PAGE_SIZE,
        };
        listState.isLoading = false;
        listState.requestId = null;
        state.metrics = {
          totalNotifications: data?.totalNotifications ?? 0,
          totalTeacherNotifications: data?.totalTeacherNotifications ?? 0,
          totalParentNotifications: data?.totalParentNotifications ?? 0,
        };
      })
      .addCase(fetchSchoolNotifications.rejected, (state, action) => {
        const listState = getListStateByTarget(state, action.meta.arg.Target);
        if (listState.requestId !== action.meta.requestId) return;

        listState.items = [];
        listState.pagination = createEmptyPagination(
          action.meta.arg.PageIndex ?? 1,
          action.meta.arg.PageSize ?? DEFAULT_PAGE_SIZE
        );
        listState.isLoading = false;
        listState.error = action.payload ?? action.error.message ?? null;
        listState.requestId = null;
      })
      .addCase(sendSchoolNotification.pending, (state) => {
        state.isSending = true;
        state.sendError = null;
      })
      .addCase(sendSchoolNotification.fulfilled, (state) => {
        state.isSending = false;
      })
      .addCase(sendSchoolNotification.rejected, (state, action) => {
        state.isSending = false;
        state.sendError = getSendNotificationErrorMessage(action.payload, action.error.message);
      })
      .addCase(fetchNotificationStudents.pending, (state, action) => {
        state.isLoadingNotificationStudents = true;
        state.notificationStudents = [];
        state.notificationStudentsError = null;
        state.notificationStudentsRequestId = action.meta.requestId;
      })
      .addCase(fetchNotificationStudents.fulfilled, (state, action) => {
        if (state.notificationStudentsRequestId !== action.meta.requestId) return;

        state.notificationStudents = action.payload;
        state.isLoadingNotificationStudents = false;
        state.notificationStudentsRequestId = null;
      })
      .addCase(fetchNotificationStudents.rejected, (state, action) => {
        if (state.notificationStudentsRequestId !== action.meta.requestId) return;

        state.notificationStudents = [];
        state.isLoadingNotificationStudents = false;
        state.notificationStudentsError = action.payload ?? action.error.message ?? null;
        state.notificationStudentsRequestId = null;
      });
  },
});

export const {
  resetSchoolNotifications,
  clearNotificationStudents,
  clearSchoolNotificationSendError,
} = schoolNotificationsSlice.actions;

export default schoolNotificationsSlice.reducer;
