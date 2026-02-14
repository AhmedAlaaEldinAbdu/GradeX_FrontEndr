const Grade = '/Grade';

export const EducationalStagesEndpoints = {
  base: Grade,
  create: Grade,
  update: Grade,
  getById: (id: string) => `${Grade}/${id}`,
  delete: (id: string) => `${Grade}/${id}`,
  getGradeBySubSystemId: `${Grade}/GetGradeBySubSystemId`,
  lkSchoolStage: '/LKSchoolStage',
};
