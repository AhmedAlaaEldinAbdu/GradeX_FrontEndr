const TaskCorrection = '/TaskCorrection';

export const TaskCorrectionEndpoints = {
  getTaskCorrectionByTaskStudentId: (taskStudentId: string) => `${TaskCorrection}/${taskStudentId}`,
  addTaskCorrection: TaskCorrection,
  updateTaskCorrection: TaskCorrection,
  deleteTaskCorrection: (id: string) => `${TaskCorrection}/${id}`,
};
