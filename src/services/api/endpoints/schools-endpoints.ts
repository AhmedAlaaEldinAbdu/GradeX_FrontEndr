const SCHOOLS = '/school';

export const SchoolsEndpoints = {
  addSchool: SCHOOLS,
  getSchools: SCHOOLS,
  editSchool: (id: string) => `${SCHOOLS}/${id}`,
  getSchoolById: (id: string) => `${SCHOOLS}/${id}`,
  editSchoolStatus: (id: string) => `${SCHOOLS}/${id}/status`,
  addSchoolRequest: (id: string) => `${SCHOOLS}/${id}/update-request`,
  getLocationFilters: `${SCHOOLS}/location/filters`,
};
