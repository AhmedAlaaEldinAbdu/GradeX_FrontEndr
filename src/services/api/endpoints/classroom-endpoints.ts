const Classroom = '/Classroom';

export const ClassroomEndpoints = {
  addClassroom: Classroom,
  getClassrooms: Classroom,
  editClassroom: Classroom,
  getClassroomById: (id: string) => `${Classroom}/${id}`,
  deleteClassroom: (id: string) => `${Classroom}/${id}`,
};
