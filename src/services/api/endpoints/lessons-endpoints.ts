const Lessons = '/Lessons';

export const LessonsEndpoints = {
  getLessons: Lessons,
  getLessonById: (id: string) => `${Lessons}/${id}`,
  getDirectLessons: `${Lessons}/GetDirectLesson`,
  createLesson: Lessons,
  updateLesson: Lessons,
  startLesson: `${Lessons}/Start`,
  deleteLesson: (id: string, applyToAllWeeks: boolean) =>
    `${Lessons}?Id=${id}&ApplyToAllWeeks=${applyToAllWeeks}`,
};

export default LessonsEndpoints;
