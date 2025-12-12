const Teacher = '/Teacher';

export const TeacherEndpoints = {
  getTeachers: Teacher,
  getTeacherById: (id: string) => `${Teacher}/${id}`,
  deleteTeacher: (id: string) => `${Teacher}/${id}`,
};
