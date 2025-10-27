const AcademicSystem = '/AcademicSystem';

export const AcademicSystemEndpoints = {
  addAcademicSystem: AcademicSystem,
  getAcademicSystem: AcademicSystem,
  editAcademicSystem: AcademicSystem,
  getAcademicSystemById: (id: string) => `${AcademicSystem}/${id}`,
  deleteAcademicSystem: (id: string) => `${AcademicSystem}/${id}`,
};
