const TeacherAttendance = '/TeacherAttendance';

export const TeacherAttendanceEndpoints = {
  getByBranch: `${TeacherAttendance}/by-branch`,
  getByTeacher: TeacherAttendance,
  markAttendance: (id: string) => `${TeacherAttendance}/${id}`,
  updateAttendance: TeacherAttendance,
};
