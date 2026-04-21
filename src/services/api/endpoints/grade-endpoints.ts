const Grade = '/Grade';

export const GradeEndpoints = {
  getGrades: Grade,
  getGradeById: (id: string) => `${Grade}/${id}`,
};
