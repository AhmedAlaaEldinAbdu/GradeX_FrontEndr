const TeacherAttendance = '/TeacherAttendance';

export const TeacherAttendanceEndpoints = {
  getByBranch: `${TeacherAttendance}/by-branch`,
  getByTeacher: TeacherAttendance,
  create: TeacherAttendance,
  markAttendance: (id: string) => `${TeacherAttendance}/${id}`,
  updateAttendance: TeacherAttendance,
  bulkCreate: `${TeacherAttendance}/bulk-create`,
};
