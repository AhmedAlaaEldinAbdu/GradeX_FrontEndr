import { array, mixed, object, string } from 'yup';

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

export const CourseBasicInfoSchema = object({
  nameAr: string().trim().required('eLearning.courses.add.validation.nameArRequired'),
  nameEn: string().trim().required('eLearning.courses.add.validation.nameEnRequired'),
  descAr: string().default(''),
  descEn: string().default(''),
  subject: string().required('eLearning.courses.add.validation.subjectRequired'),
  teacher: string().required('eLearning.courses.add.validation.teacherRequired'),
  startDate: string().required('eLearning.courses.add.validation.startDateRequired'),
  endDate: string()
    .default('')
    .test('end-after-start', 'eLearning.courses.add.validation.endDateAfterStart', function (value) {
      if (!value) return true;

      const startDate = toDateTime(this.parent.startDate);
      const endDate = toDateTime(value);

      if (startDate === null || endDate === null) return true;
      return endDate > startDate;
    }),
  lessonsCount: string()
    .required('eLearning.courses.add.validation.lessonsCountRequired')
    .test('positive-lessons', 'eLearning.courses.add.validation.lessonsCountPositive', (value) => {
      const lessonsCount = toFiniteNumber(value);
      return lessonsCount !== null && lessonsCount > 0;
    }),
  lessonDuration: string().default(''),
  coverImage: mixed<File>().nullable().default(null),
  coverImageUrl: string().optional(),
}).test('cover-required', 'eLearning.courses.add.validation.coverRequired', function (value) {
  if (value?.coverImage || value?.coverImageUrl) return true;

  return this.createError({
    path: 'coverImage',
    message: 'eLearning.courses.add.validation.coverRequired',
  });
});

export const CourseStudentsSchema = object({
  stage: array()
    .of(string().required())
    .min(1, 'eLearning.courses.add.validation.stageRequired')
    .required('eLearning.courses.add.validation.stageRequired'),
  grades: array()
    .of(string().required())
    .min(1, 'eLearning.courses.add.validation.classroomsRequired')
    .required('eLearning.courses.add.validation.classroomsRequired'),
  audience: string().oneOf(['all', 'specific']).required(),
  selectedStudents: array()
    .of(object({ id: string().required(), name: string().required() }))
    .default([])
    .when('audience', {
      is: 'specific',
      then: (schema) => schema.min(1, 'eLearning.courses.add.validation.studentsRequired'),
    }),
});

export const CourseLectureSchema = object({
  id: string().required(),
  nameAr: string().trim().required('eLearning.courses.add.validation.lectureNameArRequired'),
  nameEn: string().trim().required('eLearning.courses.add.validation.lectureNameEnRequired'),
  duration: string().default(''),
  video: mixed<File>().nullable().default(null),
  videoUrl: string().optional(),
  attachments: array().of(mixed<File>().required()).default([]),
  existingAttachments: array()
    .of(object({ fileName: string().required(), fileUrl: string().required() }))
    .optional(),
}).test('video-required', 'eLearning.courses.add.validation.lectureVideoRequired', function (value) {
  if (value?.video || value?.videoUrl) return true;

  return this.createError({
    path: `${this.path}.video`,
    message: 'eLearning.courses.add.validation.lectureVideoRequired',
  });
});

export const CourseLecturesSchema = object({
  source: string().oneOf(['manual']).default('manual'),
  selectedCourseId: string().default(''),
  items: array()
    .of(CourseLectureSchema)
    .min(1, 'eLearning.courses.add.validation.lecturesRequired')
    .required('eLearning.courses.add.validation.lecturesRequired'),
});
