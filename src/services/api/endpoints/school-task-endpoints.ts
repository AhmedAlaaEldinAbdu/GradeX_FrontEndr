const SchoolTask = '/SchoolTask';

export const SchoolTaskEndpoints = {
  getSchoolTasks: SchoolTask,
  addSchoolTask: SchoolTask,
  updateSchoolTask: SchoolTask,
  getSchoolTaskById: (id: string) => `${SchoolTask}/${id}`,
  deleteSchoolTask: (id: string) => `${SchoolTask}/${id}`,
  getSchoolTaskStatusById: `${SchoolTask}/GetTaskStatusbyId`,
  getAllSchoolTasksByStudentId: `${SchoolTask}/GetAllTaskByStudentId`,
};