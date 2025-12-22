export {
  default as teachersReducer,
  fetchTeachers,
  fetchTeacherById,
  deleteTeacher,
  fetchTeacherAssignment,
  fetchTeacherAttendanceDetails,
  setFilters,
  clearFilters,
  setCurrentTeacher,
  clearTeacherAssignment,
  clearTeacherAttendance,
  setAttendanceFilters,
  clearAttendanceFilters,
  clearError,
  selectTeacher,
  deselectTeacher,
  selectAllTeachers,
  clearSelection,
} from './teachersSlice';

export type {
  TeachersState,
  FetchTeachersPayload,
  FetchTeachersResponse,
  FetchTeacherAttendancePayload,
  FetchTeacherAttendanceResponse,
} from './teachersSlice';
