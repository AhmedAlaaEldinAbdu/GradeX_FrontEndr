const AIExam = '/AIExam';

export const AIExamEndpoints = {
  create: AIExam,
  getDashboardStats: `${AIExam}/GetDashboardStats`,
  getAll: `${AIExam}/GetAllExams`,
  getExamSummary: `${AIExam}/GetExamSummary`,
  getExamQuestionsStats: `${AIExam}/GetExamQuestionsStats`,
  getExamResultsDistribution: `${AIExam}/GetExamResultsDistribution`,
  generateQuestions: `${AIExam}/GenerateAIExamQuestions`,
};

export default AIExamEndpoints;
