const Material = '/Material';

export const SubjectEndpoints = {
  addSubject: Material,
  getSubjects: Material,
  editSubject: Material,
  getSubjectById: (id: string) => `${Material}/${id}`,
  deleteSubject: (id: string) => `${Material}/${id}`,
};
