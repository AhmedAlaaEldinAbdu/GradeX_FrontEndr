const Student = '/Student';

export const StudentEndpoints = {
  getStudents: Student,
  getStudentById: (id: string) => `${Student}/${id}`,
  getByClassroomId: `${Student}/GetByClassroomId`,
  createStudent: Student,
  updateStudent: Student,
  deleteStudent: (id: string) => `${Student}/${id}`,
  assignToClassroom: `${Student}/AssignToClassroomCommand`,
  searchByFullName: `${Student}/GetStudentByFullName`,
};

export default StudentEndpoints;
