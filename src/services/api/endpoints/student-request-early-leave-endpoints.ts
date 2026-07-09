const StudentRequestEarlyLeave = '/StudentRequestEarlyLeave';

export const StudentRequestEarlyLeaveEndpoints = {
  base: StudentRequestEarlyLeave,
  getAll: StudentRequestEarlyLeave,
  getById: (id: string) => `${StudentRequestEarlyLeave}/${id}`,
  create: StudentRequestEarlyLeave,
  update: StudentRequestEarlyLeave,
  approve: `${StudentRequestEarlyLeave}/Approve`,
  delete: StudentRequestEarlyLeave,
};

export default StudentRequestEarlyLeaveEndpoints;
