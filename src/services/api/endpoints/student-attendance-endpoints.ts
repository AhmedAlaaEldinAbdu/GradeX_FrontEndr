const StudentAttendance = '/StudentAttendance';

export const StudentAttendanceEndpoints = {
  getByBranch: `${StudentAttendance}/by-branch`,
  bulkCreate: `${StudentAttendance}/bulk-create`,
  getByStudent: StudentAttendance,
};
