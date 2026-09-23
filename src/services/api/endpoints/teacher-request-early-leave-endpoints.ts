const TeacherRequestEarlyLeave = '/TeacherRequestEarlyLeave';

export const TeacherRequestEarlyLeaveEndpoints = {
  // List all early leave requests
  getEarlyLeaves: `${TeacherRequestEarlyLeave}`,

  // Create early leave request
  createEarlyLeave: `${TeacherRequestEarlyLeave}`,

  // Update early leave request
  updateEarlyLeave: `${TeacherRequestEarlyLeave}`,

  // Get early leave request details
  getEarlyLeaveById: (id: string) => `${TeacherRequestEarlyLeave}/${id}`,

  // Delete early leave request
  deleteEarlyLeave: `${TeacherRequestEarlyLeave}`,
};

export default TeacherRequestEarlyLeaveEndpoints;
