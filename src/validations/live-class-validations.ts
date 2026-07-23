import { array, boolean, object, string } from 'yup';

const V = 'eLearning.liveClasses.add.validation';

const isEmpty = (value?: string | null): boolean => !value || value.trim() === '';

const isPositivePage = (value?: string | null): boolean => isEmpty(value) || Number(value) > 0;

const isPageRangeValid = (from?: string | null, to?: string | null): boolean =>
  isEmpty(from) || isEmpty(to) || Number(from) <= Number(to);

export const LiveClassSchema = object({
  classType: string().oneOf(['inPerson', 'remote']).required(`${V}.classTypeRequired`),
  fromTime: string().trim().required(`${V}.fromTimeRequired`),
  toTime: string()
    .trim()
    .required(`${V}.toTimeRequired`)
    .test('after-from', `${V}.toTimeAfterFrom`, function (value) {
      const { fromTime } = this.parent;
      if (!value || !fromTime) return true;
      return value > fromTime;
    }),
  subject: string().required(`${V}.subjectRequired`),
  teacher: string().required(`${V}.teacherRequired`),
  stage: string().required(`${V}.stageRequired`),
  grade: string().required(`${V}.gradeRequired`),
  book: string().required(`${V}.bookRequired`),
  classWorkFromPage: string().test('greater-than-zero', `${V}.pageGreaterThanZero`, isPositivePage),
  classWorkToPage: string()
    .test('greater-than-zero', `${V}.pageGreaterThanZero`, isPositivePage)
    .test('to-page-after-from', `${V}.toPageAfterFrom`, function (value) {
      return isPageRangeValid(this.parent.classWorkFromPage, value);
    }),
  addHomework: boolean().default(false),
  homeworkFromPage: string().when('addHomework', {
    is: true,
    then: (schema) =>
      schema
        .trim()
        .required(`${V}.homeworkFromPageRequired`)
        .test(
          'greater-than-zero',
          `${V}.homeworkPageGreaterThanZero`,
          (value) => Number(value) > 0
        ),
  }),
  homeworkToPage: string().when('addHomework', {
    is: true,
    then: (schema) =>
      schema
        .trim()
        .required(`${V}.homeworkToPageRequired`)
        .test('greater-than-zero', `${V}.homeworkPageGreaterThanZero`, (value) => Number(value) > 0)
        .test('to-page-after-from', `${V}.toPageAfterFrom`, function (value) {
          return isPageRangeValid(this.parent.homeworkFromPage, value);
        }),
  }),
  sendHomeworkTo: string().oneOf(['all', 'specific']).required(`${V}.sendToRequired`),
  selectedStudents: array()
    .of(object({ id: string().required(), name: string().required() }))
    .default([])
    .when(['addHomework', 'sendHomeworkTo'], {
      is: (addHomework: boolean, sendHomeworkTo: string) =>
        addHomework && sendHomeworkTo === 'specific',
      then: (schema) => schema.min(1, `${V}.studentsRequired`),
    }),
});
