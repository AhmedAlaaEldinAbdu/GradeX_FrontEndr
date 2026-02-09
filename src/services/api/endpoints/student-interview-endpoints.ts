const StudentInterview = '/StudentInterview';

export const StudentInterviewEndpoints = {
  addStudentInterview: StudentInterview,
  getStudentInterviews: StudentInterview,
  editStudentInterview: StudentInterview,
  getStudentInterviewById: (id: string) => `${StudentInterview}/${id}`,
  deleteStudentInterview: (id: string) => `${StudentInterview}/${id}`,
};

export default StudentInterviewEndpoints;
