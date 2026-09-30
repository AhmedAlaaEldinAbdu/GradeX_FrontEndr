import { array, object, string, type InferType } from 'yup';

const REQUIRED = 'common.validation.required';
const END_TIME_BEFORE_START = 'academicCalendar.form.errors.endTimeBeforeStart';

const positiveInteger = () =>
  string()
    .required(REQUIRED)
    .test('positive-integer', REQUIRED, (value) => /^\d+$/.test(value ?? '') && Number(value) > 0);

const endTimeAfter = (startKey: string) =>
  string()
    .required(REQUIRED)
    .test('end-after-start', END_TIME_BEFORE_START, function (value) {
      const start = (this.parent as Record<string, string | undefined>)[startKey];
      return !start || !value || value > start;
    });

export const AddAcademicCalendarSchema = object({
  gradeId: string().required(REQUIRED),
  academicSubSystemId: string().required(REQUIRED),
  studyStartDate: string().required(REQUIRED),
  studyEndDate: string()
    .required(REQUIRED)
    .test('end-after-start', 'academicCalendar.form.errors.endDateBeforeStart', function (value) {
      const { studyStartDate } = this.parent as { studyStartDate?: string };
      return !studyStartDate || !value || value > studyStartDate;
    }),
  weeksCount: positiveInteger(),
  lessonDuration: positiveInteger(),
  days: array().of(string().required()).min(1, REQUIRED).default([]),
  dayStartTime: string().required(REQUIRED),
  dayEndTime: endTimeAfter('dayStartTime'),
  breakStartTime: string().required(REQUIRED),
  breakEndTime: endTimeAfter('breakStartTime'),
  assemblyStartTime: string().required(REQUIRED),
  assemblyEndTime: endTimeAfter('assemblyStartTime'),
  breakfastStartTime: string().required(REQUIRED),
  breakfastEndTime: endTimeAfter('breakfastStartTime'),
});

export type AddAcademicCalendarFormValues = InferType<typeof AddAcademicCalendarSchema>;
