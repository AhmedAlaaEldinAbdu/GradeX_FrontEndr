const AIExam = '/AIExam';

export const AIExamEndpoints = {
  create: AIExam,
  getDashboardStats: `${AIExam}/GetDashboardStats`,
  getAll: `${AIExam}/GetAllExams`,
  generateQuestions: `${AIExam}/GenerateAIExamQuestions`,
};

export default AIExamEndpoints;
