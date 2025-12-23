const Teacher = '/Teacher';
const TeacherAssignment = '/TeacherAssignment';

export const TeacherEndpoints = {
  getTeachers: Teacher,
  getTeacherById: (id: string) => `${Teacher}/${id}`,
  deleteTeacher: (id: string) => `${Teacher}/${id}`,
};

export const TeacherAssignmentEndpoints = {
  getAll: TeacherAssignment,
  getAllTeacherClass: `${TeacherAssignment}/GetAllTeacherClass`,
};
