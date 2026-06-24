const TeacherRequests = '/TeacherRequests';

export const TeacherRequestsEndpoints = {
  getSummary: `${TeacherRequests}/summary`,
  getJobApplications: `${TeacherRequests}/apply-job-advertisment`,
  getJobApplicationById: (applicationJobAdvertismentId: string) =>
    `${TeacherRequests}/apply-job-advertisment/${applicationJobAdvertismentId}`,
  getEarlyLeaves: `${TeacherRequests}/early-leave`,
  getEarlyLeaveById: (id: string) => `${TeacherRequests}/early-leave/${id}`,
  updateEarlyLeaveStatus: `${TeacherRequests}/early-leave/update-status`,
  getMessages: `${TeacherRequests}/message`,
  getMessageById: (id: string) => `${TeacherRequests}/message/${id}`,
  getNotes: `${TeacherRequests}/note`,
  getNoteById: (id: string) => `${TeacherRequests}/note/${id}`,
};

export default TeacherRequestsEndpoints;
