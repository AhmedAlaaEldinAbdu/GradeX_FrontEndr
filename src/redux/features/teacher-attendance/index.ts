export {
  default as teacherAttendanceReducer,
  fetchTeacherAttendance,
  clearFilters,
  setCurrentAttendance,
  clearError,
  selectAttendance,
  deselectAttendance,
  selectAllAttendances,
  clearSelection,
  STATIC_SCHOOL_BRANCH_ID,
} from './teacherAttendanceSlice';

export type {
  TeacherAttendanceState,
  FetchTeacherAttendancePayload,
  FetchTeacherAttendanceResponse,
} from './teacherAttendanceSlice';
