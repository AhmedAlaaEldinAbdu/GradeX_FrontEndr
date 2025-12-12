export {
  default as teachersReducer,
  fetchTeachers,
  fetchTeacherById,
  deleteTeacher,
  setFilters,
  clearFilters,
  setCurrentTeacher,
  clearError,
  selectTeacher,
  deselectTeacher,
  selectAllTeachers,
  clearSelection,
} from './teachersSlice';

export type { TeachersState, FetchTeachersPayload, FetchTeachersResponse } from './teachersSlice';
