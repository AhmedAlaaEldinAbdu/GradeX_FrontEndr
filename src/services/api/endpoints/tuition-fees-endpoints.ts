const TuitionFees = '/TuitionFees';

export const TuitionFeesEndpoints = {
  base: TuitionFees,
  create: TuitionFees,
  update: (id: string) => `${TuitionFees}?Id=${encodeURIComponent(id)}`,
  calculationTuitionFees: `${TuitionFees}/CalculationTuitionFees`,
  getById: (id: string) => `${TuitionFees}/${id}`,
  delete: (id: string) => `${TuitionFees}/${id}`,
  getByGradeAndSchoolBranch: (gradId: string, schoolBrancheId: string) =>
    `${TuitionFees}/${gradId}/${schoolBrancheId}`,
  getGradesFeesBySchoolBranch: (schoolBrancheId: string) =>
    `${TuitionFees}/${schoolBrancheId}/grades-fees`,
  getAllInstallments: `${TuitionFees}/GetAllInstallments`,
  getInstallmentPlanByInstallmentId: (installmentId: string) =>
    `${TuitionFees}/InstallmentPlanByInstallmentId${installmentId}`,
};

export default TuitionFeesEndpoints;
