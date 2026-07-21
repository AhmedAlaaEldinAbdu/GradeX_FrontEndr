import { array, object, string } from 'yup';

const V = 'eLearning.liveClasses.add.validation';

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
  sendHomeworkTo: string().oneOf(['all', 'specific']).required(`${V}.sendToRequired`),
  selectedStudents: array()
    .of(object({ id: string().required(), name: string().required() }))
    .default([])
    .when('sendHomeworkTo', {
      is: 'specific',
      then: (schema) => schema.min(1, `${V}.studentsRequired`),
    }),
});
