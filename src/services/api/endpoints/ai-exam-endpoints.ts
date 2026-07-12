const AIExam = '/AIExam';

export const AIExamEndpoints = {
  create: AIExam,
  getAll: `${AIExam}/GetAllExams`,
  generateQuestions: `${AIExam}/GenerateAIExamQuestions`,
};

export default AIExamEndpoints;
