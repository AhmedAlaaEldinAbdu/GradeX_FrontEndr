import {
  createSlice,
  type PayloadAction,
  type ActionReducerMapBuilder,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { teacherApiService } from '@/services/api/teachers/teachers.service';
import { teacherAttendanceApiService } from '@/services/api/teacher-attendance/teacher-attendance.service';
import type { Teacher, TeacherQueryParams, TeacherFilters } from '@/types/teachers';
import type { TeacherAssignmentData, TeacherAssignmentListItem } from '@/types/teacherAssignment';
import type { TeacherPersonalDataDetails } from '@/types/teacherPersonalData';
import type {
  TeacherAttendanceDetailRecord,
  TeacherAttendanceSummary,
  TeacherAttendanceDetailFilters,
} from '@/types/teacherAttendanceDetail';
import type { TeacherAttendanceUpdateRequest } from '@/types/teacherAttendance';
import { getErrorMessage } from '@/lib/http';

// ============================================================================
// Types
// ============================================================================

export interface TeachersState {
  // Data
  teachers: Teacher[];
  teacherAssignmentList: TeacherAssignmentListItem[];
  currentTeacher: Teacher | null;
  teacherPersonalData: TeacherPersonalDataDetails | null;
  teacherAssignment: TeacherAssignmentData | null;
  teacherAttendanceRecords: TeacherAttendanceDetailRecord[];
  teacherAttendanceSummary: TeacherAttendanceSummary;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Attendance Pagination
  attendancePagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: TeacherFilters;
  attendanceFilters: TeacherAttendanceDetailFilters;

  // Loading States
  isLoading: boolean;
  isLoadingAssignmentList: boolean;
  isLoadingPersonalData: boolean;
  isDeleting: boolean;
  isLoadingAssignment: boolean;
  isLoadingAttendance: boolean;

  // Error States
  error: string | null;
  personalDataError: string | null;
  assignmentError: string | null;
  attendanceError: string | null;

  // UI States
  selectedTeacherIds: string[];
  isInitialized: boolean;
}

export interface FetchTeachersPayload {
  page?: number;
  limit?: number;
  filters?: TeacherFilters;
}

export interface FetchTeachersResponse {
  data: Teacher[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FetchTeacherAttendancePayload {
  teacherId: string;
  page?: number;
  limit?: number;
  filters?: TeacherAttendanceDetailFilters;
}

export interface FetchTeacherAttendanceResponse {
  records: TeacherAttendanceDetailRecord[];
  summary: TeacherAttendanceSummary;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FetchTeacherAssignmentListPayload {
  schoolBranchesId: string;
  teacherId?: string;
  teacherName?: string;
  grageId?: string;
  classId?: string;
  materialId?: string;
  page?: number;
  limit?: number;
}

export interface FetchTeacherAssignmentListResponse {
  data: TeacherAssignmentListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: TeachersState = {
  // Data
  teachers: [],
  teacherAssignmentList: [],
  currentTeacher: null,
  teacherPersonalData: null,
  teacherAssignment: null,
  teacherAttendanceRecords: [],
  teacherAttendanceSummary: {
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalLeave: 0,
  },

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Attendance Pagination
  attendancePagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Filters
  filters: {},
  attendanceFilters: {},

  // Loading States
  isLoading: false,
  isLoadingAssignmentList: false,
  isLoadingPersonalData: false,
  isDeleting: false,
  isLoadingAssignment: false,
  isLoadingAttendance: false,

  // Error States
  error: null,
  personalDataError: null,
  assignmentError: null,
  attendanceError: null,

  // UI States
  selectedTeacherIds: [],
  isInitialized: false,
};

export const fetchTeachers = createAsyncThunk<FetchTeachersResponse, FetchTeachersPayload | void>(
  'teachers/fetchTeachers',
  async (payload, { rejectWithValue }) => {
    try {
      const params: Partial<TeacherQueryParams> = {};

      if (payload) {
        if (payload.page) params.PageIndex = payload.page;
        if (payload.limit) params.PageSize = payload.limit;

        if (payload.filters) {
          const normalizedSchoolBranchId =
            payload.filters.schoolBranchId ||
            payload.filters.schoolBranchesId ||
            payload.filters.SchoolBranchId ||
            payload.filters.SchoolBranchesId;

          if (payload.filters.searchName) params.SearchName = payload.filters.searchName;
          if (payload.filters.subjectId) params.SubjectId = payload.filters.subjectId;
          if (payload.filters.educationalStageId)
            params.EducationalStageId = payload.filters.educationalStageId;
          if (payload.filters.classroomId) params.ClassroomId = payload.filters.classroomId;
          if (normalizedSchoolBranchId) {
            params.SchoolBranchId = normalizedSchoolBranchId;
            params.SchoolBranchesId = normalizedSchoolBranchId;
          }
        }
      }

      const response = await teacherApiService.getTeachers(params as TeacherQueryParams);

      if (!response?.isSuccess || !response.data) {
        return {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        };
      }

      return {
        data: response.data.teachers || [],
        meta: {
          total: response.data.totalItems || 0,
          page: response.data.pageIndex || 1,
          limit: response.data.pageSize || 10,
          totalPages: response.data.totalPages || 0,
        },
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTeacherById = createAsyncThunk<Teacher, string>(
  'teachers/fetchTeacherById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teacherApiService.getTeacherById(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTeacherPersonalData = createAsyncThunk<TeacherPersonalDataDetails, string>(
  'teachers/fetchTeacherPersonalData',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teacherApiService.getTeacherPersonalData(id);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteTeacher = createAsyncThunk<string, string>(
  'teachers/deleteTeacher',
  async (id, { rejectWithValue }) => {
    try {
      await teacherApiService.deleteTeacher(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTeacherAssignment = createAsyncThunk<TeacherAssignmentData, string>(
  'teachers/fetchTeacherAssignment',
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await teacherApiService.getTeacherAssignment(teacherId);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTeacherAttendanceDetails = createAsyncThunk<
  FetchTeacherAttendanceResponse,
  FetchTeacherAttendancePayload
>('teachers/fetchTeacherAttendanceDetails', async (payload, { rejectWithValue }) => {
  try {
    const response = await teacherAttendanceApiService.getTeacherAttendanceByTeacher({
      TeacherId: payload.teacherId,
      PageIndex: payload.page || 1,
      PageSize: payload.limit || 10,
      Status: payload.filters?.status,
    });

    return {
      records: response.attendances || [],
      summary: {
        totalPresent: response.totalAttendance || 0,
        totalAbsent: response.totalAbsence || 0,
        totalLate: response.totalLate || 0,
        totalLeave: response.totalLeave || 0,
      },
      meta: {
        total: response.totalItems || 0,
        page: response.pageIndex || 1,
        limit: response.pageSize || 10,
        totalPages: response.totalPages || 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateTeacherAttendance = createAsyncThunk<void, TeacherAttendanceUpdateRequest>(
  'teachers/updateTeacherAttendance',
  async (payload, { rejectWithValue }) => {
    try {
      await teacherApiService.updateTeacherAttendance(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTeacherAssignmentList = createAsyncThunk<
  FetchTeacherAssignmentListResponse,
  FetchTeacherAssignmentListPayload
>('teachers/fetchTeacherAssignmentList', async (payload, { rejectWithValue }) => {
  try {
    const response = await teacherApiService.getTeacherAssignmentList({
      SchoolBranchesId: payload.schoolBranchesId,
      TeacherId: payload.teacherId,
      TeacherName: payload.teacherName,
      GrageId: payload.grageId,
      ClassId: payload.classId,
      MaterialId: payload.materialId,
      PageIndex: payload.page || 1,
      PageSize: payload.limit || 10,
    });

    return {
      data: response.teacherAssignmentDto || [],
      meta: {
        total: response.totalItems || 0,
        page: response.pageIndex || 1,
        limit: response.pageSize || 10,
        totalPages: response.totalPages || 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export interface CreateTeacherAssignmentPayload {
  schoolBranchesId: string;
  teacherId: string;
  gradeId: string;
  materialId: string;
  classroomIds: string[];
  bookIds: string[];
}

export const createTeacherAssignment = createAsyncThunk<
  { success: boolean; message: string },
  CreateTeacherAssignmentPayload
>('teachers/createTeacherAssignment', async (payload, { rejectWithValue }) => {
  try {
    const result = await teacherApiService.createTeacherAssignment(payload);
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export interface UpdateTeacherAssignmentPayload {
  id: string;
  schoolBranchesId: string;
  teacherId: string;
  gradeId: string;
  materialId: string;
  classroomIds: string[];
  bookIds: string[];
}

export const updateTeacherAssignment = createAsyncThunk<
  { success: boolean; message: string },
  UpdateTeacherAssignmentPayload
>('teachers/updateTeacherAssignment', async (payload, { rejectWithValue }) => {
  try {
    const result = await teacherApiService.updateTeacherAssignment(payload);
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TeachersState['filters']>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentTeacher: (state, action: PayloadAction<Teacher | null>) => {
      state.currentTeacher = action.payload;
    },
    clearTeacherPersonalData: (state) => {
      state.teacherPersonalData = null;
      state.personalDataError = null;
    },
    clearTeacherAssignment: (state) => {
      state.teacherAssignment = null;
      state.assignmentError = null;
    },
    clearTeacherAttendance: (state) => {
      state.teacherAttendanceRecords = [];
      state.teacherAttendanceSummary = {
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        totalLeave: 0,
      };
      state.attendanceError = null;
      state.attendanceFilters = {};
    },
    setAttendanceFilters: (state, action: PayloadAction<TeacherAttendanceDetailFilters>) => {
      state.attendanceFilters = action.payload;
    },
    clearAttendanceFilters: (state) => {
      state.attendanceFilters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    selectTeacher: (state, action: PayloadAction<string>) => {
      if (!state.selectedTeacherIds.includes(action.payload)) {
        state.selectedTeacherIds.push(action.payload);
      }
    },
    deselectTeacher: (state, action: PayloadAction<string>) => {
      state.selectedTeacherIds = state.selectedTeacherIds.filter((id) => id !== action.payload);
    },
    selectAllTeachers: (state) => {
      state.selectedTeacherIds = state.teachers.map((teacher) => teacher.id);
    },
    clearSelection: (state) => {
      state.selectedTeacherIds = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<TeachersState>) => {
    // Fetch Teachers
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action: PayloadAction<FetchTeachersResponse>) => {
        state.isLoading = false;
        state.teachers = action.payload.data;
        state.pagination = {
          page: action.payload.meta.page,
          limit: action.payload.meta.limit,
          total: action.payload.meta.total,
          totalPages: action.payload.meta.totalPages,
        };
        state.isInitialized = true;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Teacher By ID
    builder
      .addCase(fetchTeacherById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacherById.fulfilled, (state, action: PayloadAction<Teacher>) => {
        state.isLoading = false;
        state.currentTeacher = action.payload;
      })
      .addCase(fetchTeacherById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Teacher Personal Data
    builder
      .addCase(fetchTeacherPersonalData.pending, (state) => {
        state.isLoadingPersonalData = true;
        state.personalDataError = null;
      })
      .addCase(
        fetchTeacherPersonalData.fulfilled,
        (state, action: PayloadAction<TeacherPersonalDataDetails>) => {
          state.isLoadingPersonalData = false;
          state.teacherPersonalData = action.payload;
        }
      )
      .addCase(fetchTeacherPersonalData.rejected, (state, action) => {
        state.isLoadingPersonalData = false;
        state.personalDataError = action.payload as string;
      });

    // Delete Teacher
    builder
      .addCase(deleteTeacher.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteTeacher.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.teachers = state.teachers.filter((teacher) => teacher.id !== action.payload);
        state.selectedTeacherIds = state.selectedTeacherIds.filter((id) => id !== action.payload);
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Fetch Teacher Assignment
    builder
      .addCase(fetchTeacherAssignment.pending, (state) => {
        state.isLoadingAssignment = true;
        state.assignmentError = null;
      })
      .addCase(
        fetchTeacherAssignment.fulfilled,
        (state, action: PayloadAction<TeacherAssignmentData>) => {
          state.isLoadingAssignment = false;
          state.teacherAssignment = action.payload;
        }
      )
      .addCase(fetchTeacherAssignment.rejected, (state, action) => {
        state.isLoadingAssignment = false;
        state.assignmentError = action.payload as string;
      });

    // Fetch Teacher Attendance Details
    builder
      .addCase(fetchTeacherAttendanceDetails.pending, (state) => {
        state.isLoadingAttendance = true;
        state.attendanceError = null;
      })
      .addCase(
        fetchTeacherAttendanceDetails.fulfilled,
        (state, action: PayloadAction<FetchTeacherAttendanceResponse>) => {
          state.isLoadingAttendance = false;
          state.teacherAttendanceRecords = action.payload.records;
          state.teacherAttendanceSummary = action.payload.summary;
          state.attendancePagination = {
            page: action.payload.meta.page,
            limit: action.payload.meta.limit,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
        }
      )
      .addCase(fetchTeacherAttendanceDetails.rejected, (state, action) => {
        state.isLoadingAttendance = false;
        state.attendanceError = action.payload as string;
      });

    // Fetch Teacher Assignment List
    builder
      .addCase(fetchTeacherAssignmentList.pending, (state) => {
        state.isLoadingAssignmentList = true;
        state.error = null;
      })
      .addCase(
        fetchTeacherAssignmentList.fulfilled,
        (state, action: PayloadAction<FetchTeacherAssignmentListResponse>) => {
          state.isLoadingAssignmentList = false;
          state.teacherAssignmentList = action.payload.data;
          state.pagination = {
            page: action.payload.meta.page,
            limit: action.payload.meta.limit,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
          state.isInitialized = true;
        }
      )
      .addCase(fetchTeacherAssignmentList.rejected, (state, action) => {
        state.isLoadingAssignmentList = false;
        state.error = action.payload as string;
      });

    // Update Teacher Attendance
    builder
      .addCase(updateTeacherAttendance.pending, (state) => {
        state.isLoadingAttendance = true;
        state.attendanceError = null;
      })
      .addCase(updateTeacherAttendance.fulfilled, (state) => {
        state.isLoadingAttendance = false;
      })
      .addCase(updateTeacherAttendance.rejected, (state, action) => {
        state.isLoadingAttendance = false;
        state.attendanceError = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentTeacher,
  clearTeacherPersonalData,
  clearTeacherAssignment,
  clearTeacherAttendance,
  setAttendanceFilters,
  clearAttendanceFilters,
  clearError,
  selectTeacher,
  deselectTeacher,
  selectAllTeachers,
  clearSelection,
} = teachersSlice.actions;

export default teachersSlice.reducer;
