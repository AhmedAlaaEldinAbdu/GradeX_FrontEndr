const Lessons = '/Lessons';

export const LessonsEndpoints = {
  getLessons: Lessons,
  getLessonById: (id: string) => `${Lessons}/${id}`,
  createLesson: Lessons,
  updateLesson: Lessons,
  deleteLesson: (id: string) => `${Lessons}/${id}`,
};

export default LessonsEndpoints;
