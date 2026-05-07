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
  getById: (id: string) => `${TeacherAssignment}/${id}`,
  getAllTeacherClass: `${TeacherAssignment}/GetAllTeacherClass`,
  create: TeacherAssignment,
  update: TeacherAssignment,
  deleteTeacherAssignment: (id: string) => `${TeacherAssignment}/${id}`,
};
