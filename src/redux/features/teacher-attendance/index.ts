export {
  default as teacherAttendanceReducer,
  fetchTeacherAttendance,
  bulkCreateAttendance,
  clearFilters,
  setCurrentAttendance,
  clearError,
  selectAttendance,
  deselectAttendance,
  selectAllAttendances,
  clearSelection,
} from './teacherAttendanceSlice';

export type {
  TeacherAttendanceState,
  FetchTeacherAttendancePayload,
  FetchTeacherAttendanceResponse,
} from './teacherAttendanceSlice';
