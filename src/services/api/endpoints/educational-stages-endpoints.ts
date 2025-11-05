const Grade = '/Grade';

export const EducationalStagesEndpoints = {
  base: Grade,
  list: Grade,
  create: Grade,
  update: Grade,
  getById: (id: string) => `${Grade}/${id}`,
  delete: (id: string) => `${Grade}/${id}`,
  getBySubSystemId: `${Grade}/GetGradeBySubSystemId`,
};
