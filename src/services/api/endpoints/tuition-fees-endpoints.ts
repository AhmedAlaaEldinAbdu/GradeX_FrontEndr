const TuitionFees = '/TuitionFees';

export const TuitionFeesEndpoints = {
  base: TuitionFees,
  create: TuitionFees,
  update: TuitionFees,
  calculationTuitionFees: `${TuitionFees}/CalculationTuitionFees`,
  getById: (id: string) => `${TuitionFees}/${id}`,
  delete: (id: string) => `${TuitionFees}/${id}`,
  getByGradeAndSchoolBranch: (gradId: string, schoolBrancheId: string) =>
    `${TuitionFees}/${gradId}/${schoolBrancheId}`,
  getGradesFeesBySchoolBranch: (schoolBrancheId: string) =>
    `${TuitionFees}/${schoolBrancheId}/grades-fees`,
};

export default TuitionFeesEndpoints;
