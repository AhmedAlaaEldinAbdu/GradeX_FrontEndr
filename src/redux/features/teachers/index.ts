export {
  default as teachersReducer,
  fetchTeachers,
  fetchTeacherById,
  deleteTeacher,
  fetchTeacherAssignment,
  setFilters,
  clearFilters,
  setCurrentTeacher,
  clearTeacherAssignment,
  clearError,
  selectTeacher,
  deselectTeacher,
  selectAllTeachers,
  clearSelection,
} from './teachersSlice';

export type { TeachersState, FetchTeachersPayload, FetchTeachersResponse } from './teachersSlice';
