const TaskStudent = '/TaskStudent';

export const TaskStudentEndpoints = {
  getTaskStudentById: (id: string) => `${TaskStudent}/${id}`,
  deleteTaskStudent: (id: string) => `${TaskStudent}/${id}`,
  getStudentMaterialTasks: (studentId: string) => `${TaskStudent}/student-material-tasks/${studentId}`,
  updateTaskStudent: TaskStudent,
};