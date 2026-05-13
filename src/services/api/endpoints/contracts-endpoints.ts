// Contracts endpoints live at the API root (no `/api` segment), unlike the rest
// of the app — so the base is an absolute URL derived from VITE_API_BASE_URL.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://gradexpro.runasp.net/api';
const Contracts = API_BASE_URL.replace(/\/api\/?$/, '');

export const ContractsEndpoints = {
  createSchoolContract: `${Contracts}/CreateSchoolContract`,
  updateSchoolContract: `${Contracts}/UpdateSchoolContract`,
  getByStudent: (studentId: string) => `${Contracts}/student/${studentId}`,
  requestSign: `${Contracts}/request-sign`,
  confirmSign: `${Contracts}/confirm-sign`,
  getAllBySchoolBranchId: `${Contracts}/GetAllContractBySchoolBranchId`,
};

export default ContractsEndpoints;
