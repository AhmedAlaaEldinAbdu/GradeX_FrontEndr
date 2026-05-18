const StudentDelegation = '/StudentDelegation';

export const StudentDelegationEndpoints = {
  base: StudentDelegation,
  list: StudentDelegation,
  create: StudentDelegation,
  update: StudentDelegation,
  getById: (id: string) => `${StudentDelegation}/${id}`,
  delete: (id: string) => `${StudentDelegation}/${id}`,
};

export default StudentDelegationEndpoints;
