const SchoolCourse = '/SchoolCourse';

export const SchoolCourseEndpoints = {
  getAll: SchoolCourse,
  create: SchoolCourse,
  // PUT takes the id as a query parameter (mirrors the Material/Subject endpoint).
  update: (id: string) => `${SchoolCourse}?Id=${id}`,
  getById: (id: string) => `${SchoolCourse}/${id}`,
  delete: (id: string) => `${SchoolCourse}/${id}`,
  dashboardOverview: `${SchoolCourse}/dashboard-overview`,
};

export default SchoolCourseEndpoints;
