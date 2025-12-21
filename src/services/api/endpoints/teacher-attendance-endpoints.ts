const TeacherAttendance = '/TeacherAttendance';

export const TeacherAttendanceEndpoints = {
  getByBranch: `${TeacherAttendance}/by-branch`,
  markAttendance: (id: string) => `${TeacherAttendance}/${id}`,
};
