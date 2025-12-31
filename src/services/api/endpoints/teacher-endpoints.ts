const Teacher = '/Teacher';
const TeacherAssignment = '/TeacherAssignment';

export const TeacherEndpoints = {
  getTeachers: Teacher,
  getTeacherById: (id: string) => `${Teacher}/${id}`,
  getPersonalDataById: `${Teacher}/GetPersonalDateById`,
  deleteTeacher: (id: string) => `${Teacher}/${id}`,
};

export const TeacherAssignmentEndpoints = {
  getAll: TeacherAssignment,
  getAllTeacherClass: `${TeacherAssignment}/GetAllTeacherClass`,
  create: TeacherAssignment,
  deleteTeacherAssignment: (id: string) => `${TeacherAssignment}/${id}`,
};
