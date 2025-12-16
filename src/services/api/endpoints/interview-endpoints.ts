const Interview = '/Interview';

export const InterviewEndpoints = {
  addInterview: Interview,
  getInterviews: Interview,
  editInterview: Interview,
  getInterviewById: (id: string) => `${Interview}/${id}`,
  deleteInterview: (id: string) => `${Interview}/${id}`,
};

export default InterviewEndpoints;