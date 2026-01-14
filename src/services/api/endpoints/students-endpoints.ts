const Student = '/Student';

export const StudentEndpoints = {
  getStudents: Student,
  getStudentById: (id: string) => `${Student}/${id}`,
  createStudent: Student,
  updateStudent: Student,
  deleteStudent: (id: string) => `${Student}/${id}`,
};

export default StudentEndpoints;
