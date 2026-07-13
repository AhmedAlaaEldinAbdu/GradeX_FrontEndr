import { array, boolean, number, object, string, type InferType } from 'yup';

const toFiniteNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return null;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const toDateTime = (value: unknown) => {
  if (typeof value !== 'string' || !value) return null;

  const dateTime = new Date(value).getTime();
  return Number.isNaN(dateTime) ? null : dateTime;
};

export const AIExamBasicInfoSchema = object({
  titleAr: string().trim().required('eLearning.onlineExams.addAI.validation.titleArRequired'),
  titleEn: string().trim().required('eLearning.onlineExams.addAI.validation.titleEnRequired'),
  topic: string().required('eLearning.onlineExams.addAI.validation.topicRequired'),
  language: string().required('eLearning.onlineExams.addAI.validation.languageRequired'),
  subject: string().required('eLearning.onlineExams.addAI.validation.subjectRequired'),
  academicSystem: string().required('grades.validation.academicSystemRequired'),
  grades: array()
    .of(string().required())
    .min(1, 'requests.addMessage.validation.gradesRequired')
    .required('requests.addMessage.validation.gradesRequired'),
  classrooms: array()
    .of(string().required())
    .min(1, 'requests.addMessage.validation.classroomsRequired')
    .required('requests.addMessage.validation.classroomsRequired'),
  bookId: string().required('eLearning.onlineExams.addAI.validation.bookRequired'),
  pageFrom: string()
    .required('eLearning.onlineExams.addAI.validation.pageFromRequired')
    .test('positive-page', 'eLearning.onlineExams.addAI.validation.pageRange', (value) => {
      const pageFrom = toFiniteNumber(value);
      return pageFrom !== null && pageFrom > 0;
    }),
  pageTo: string()
    .required('eLearning.onlineExams.addAI.validation.pageToRequired')
    .test('positive-page', 'eLearning.onlineExams.addAI.validation.pageRange', (value) => {
      const pageTo = toFiniteNumber(value);
      return pageTo !== null && pageTo > 0;
    })
    .test(
      'page-to-after-from',
      'eLearning.onlineExams.addAI.validation.pageToAfterFrom',
      function (value) {
        const pageFrom = toFiniteNumber(this.parent.pageFrom);
        const pageTo = toFiniteNumber(value);

        if (pageFrom === null || pageTo === null) return true;
        return pageTo >= pageFrom;
      }
    ),
  targetAudience: string()
    .default('all')
    .required('eLearning.onlineExams.addAI.validation.targetAudienceRequired'),
  studentIds: array()
    .of(string().required())
    .default([])
    .when('targetAudience', {
      is: 'specific',
      then: (schema) => schema.min(1, 'eLearning.onlineExams.addAI.validation.studentIdsRequired'),
    }),
  startDate: string().required('eLearning.onlineExams.addAI.validation.startDateRequired'),
  endDate: string()
    .required('eLearning.onlineExams.addAI.validation.endDateRequired')
    .test(
      'end-after-start',
      'eLearning.onlineExams.addAI.validation.endDateAfterStart',
      function (value) {
        const startDate = toDateTime(this.parent.startDate);
        const endDate = toDateTime(value);

        if (startDate === null || endDate === null) return true;
        return endDate > startDate;
      }
    ),
});

export type AIExamBasicInfoProps = InferType<typeof AIExamBasicInfoSchema>;

export const AIExamQuestionsSchema = object({
  numberOfQuestions: string().required(
    'eLearning.onlineExams.addAI.validation.numberOfQuestionsRequired'
  ),
  totalPoints: string().required('eLearning.onlineExams.addAI.validation.totalPointsRequired'),
  passingGrade: string()
    .required('eLearning.onlineExams.addAI.validation.passingGradeRequired')
    .test('range', 'eLearning.onlineExams.addAI.validation.passingGradeRange', (value) => {
      const passingGrade = toFiniteNumber(value);
      return passingGrade !== null && passingGrade >= 0 && passingGrade <= 100;
    })
    .test(
      'max-total-points',
      'eLearning.onlineExams.addAI.validation.passingGradeMaxTotalPoints',
      function (value) {
        const passingGrade = toFiniteNumber(value);
        const totalPoints = toFiniteNumber(this.parent.totalPoints);

        if (passingGrade === null || totalPoints === null) return true;
        return passingGrade <= totalPoints;
      }
    ),
  duration: string().default(''),
  resultVisibility: string()
    .default('afterExam')
    .required('eLearning.onlineExams.addAI.validation.resultVisibilityRequired'),
  difficultyEasy: number().min(0).max(100).default(0),
  difficultyMedium: number().min(0).max(100).default(0),
  difficultyHard: number().min(0).max(100).default(0),
  generateExplanation: boolean().default(false),
}).test(
  'difficulty-total',
  'eLearning.onlineExams.addAI.validation.difficultyDistributionTotal',
  function (values) {
    const easy = toFiniteNumber(values?.difficultyEasy) ?? 0;
    const medium = toFiniteNumber(values?.difficultyMedium) ?? 0;
    const hard = toFiniteNumber(values?.difficultyHard) ?? 0;

    if (easy + medium + hard === 100) return true;

    return this.createError({
      path: 'difficultyHard',
      message: 'eLearning.onlineExams.addAI.validation.difficultyDistributionTotal',
    });
  }
);

/** Full wizard schema (basic info + questions) used by the form resolver. */
export const AIExamSchema = AIExamBasicInfoSchema.concat(AIExamQuestionsSchema);

export type AIExamQuestionsProps = InferType<typeof AIExamQuestionsSchema>;
export type AIExamProps = InferType<typeof AIExamSchema>;
