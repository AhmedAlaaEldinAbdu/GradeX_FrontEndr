const AcademicSubSystem = '/AcademicSubSystem';

export const AcademicSubSystemEndpoints = {
  addAcademicSubSystem: AcademicSubSystem,
  getAcademicSubSystem: AcademicSubSystem,
  getSchoolAcademicSubSystems: AcademicSubSystem,
  editAcademicSubSystem: AcademicSubSystem,
  getAcademicSubSystemById: (id: string) => `${AcademicSubSystem}/${id}`,
  deleteAcademicSubSystem: (id: string) => `${AcademicSubSystem}/${id}`,
};
