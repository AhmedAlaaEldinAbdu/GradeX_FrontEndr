import type { EditClassroomProps } from '@/validations/classrooms-validations';

export const MAX_STUDENTS_LIMIT = 10;

export const EMPTY_CLASSROOM_VALUES: EditClassroomProps = {
  academicSystem: '',
  educationalStage: '',
  name: '',
  nameEn: '',
  alias: '',
  aliasEn: '',
  note: '',
  noteEn: '',
  maxStudents: MAX_STUDENTS_LIMIT,
};
