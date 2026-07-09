const StudentRequestEarlyLeave = '/StudentRequestEarlyLeave';

export const StudentRequestEarlyLeaveEndpoints = {
  base: StudentRequestEarlyLeave,
  getAll: StudentRequestEarlyLeave,
  getById: (id: string) => `${StudentRequestEarlyLeave}/${id}`,
  create: StudentRequestEarlyLeave,
  updateStatus: `${StudentRequestEarlyLeave}/update-status`,
  updateStatusById: (id: string) => `${StudentRequestEarlyLeave}/UpdateStatus/${id}`,
};

export default StudentRequestEarlyLeaveEndpoints;
