const Material = '/Material';

export const SubjectEndpoints = {
  addSubject: Material,
  getSubjects: Material,
  getSubjectSettings: `${Material}/Settings`,
  setGradeAvailability: `${Material}/Settings/GradeAvailability`,
  editSubject: (id: string) => `${Material}?Id=${id}`,
  getSubjectById: (id: string) => `${Material}/${id}`,
  deleteSubject: (id: string) => `${Material}/${id}`,
};
