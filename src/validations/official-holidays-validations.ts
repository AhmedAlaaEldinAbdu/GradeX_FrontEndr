import { array, object, string, mixed, type InferType } from 'yup';

// Schema for adding multiple holidays (dynamic case)
export const AddHolidaysSchema = object({
  holidays: array()
    .of(
      object({
        holidayType: string()
          .required('officialHolidays.validation.holidayTypeRequired')
          .typeError('officialHolidays.validation.holidayTypeRequired'),
        reason: string()
          .required('officialHolidays.validation.reasonRequired')
          .typeError('officialHolidays.validation.reasonRequired'),
        startDate: string()
          .required('officialHolidays.validation.startDateRequired')
          .typeError('officialHolidays.validation.startDateRequired'),
        endDate: string()
          .required('officialHolidays.validation.endDateRequired')
          .typeError('officialHolidays.validation.endDateRequired')
          .test('is-after-start', 'officialHolidays.validation.endDateAfterStart', function (value) {
            const { startDate } = this.parent;
            if (!startDate || !value) return true;
            return new Date(value) >= new Date(startDate);
          }),
        duration: string()
          .required('officialHolidays.validation.durationRequired')
          .typeError('officialHolidays.validation.durationRequired'),
        officialDocument: mixed().optional(),
      })
    )
    .required('officialHolidays.validation.requiredList')
    .min(1, 'officialHolidays.validation.atLeastOneHoliday')
    .typeError('officialHolidays.validation.requiredList'),
});

// Schema for adding a single static holiday
export const AddStaticHolidaySchema = object({
  holidayType: string()
    .required('officialHolidays.validation.holidayTypeRequired')
    .typeError('officialHolidays.validation.holidayTypeRequired'),
  dayName: string()
    .required('officialHolidays.validation.dayNameRequired')
    .typeError('officialHolidays.validation.dayNameRequired'),
  reason: string()
    .required('officialHolidays.validation.reasonRequired')
    .typeError('officialHolidays.validation.reasonRequired'),
  officialDocument: mixed().notRequired(),
});

// Schema for editing a holiday
export const EditHolidaySchema = object({
  holidayType: string()
    .required('officialHolidays.validation.holidayTypeRequired')
    .typeError('officialHolidays.validation.holidayTypeRequired'),
  reason: string()
    .required('officialHolidays.validation.reasonRequired')
    .typeError('officialHolidays.validation.reasonRequired'),
  startDate: string()
    .required('officialHolidays.validation.startDateRequired')
    .typeError('officialHolidays.validation.startDateRequired'),
  endDate: string()
    .required('officialHolidays.validation.endDateRequired')
    .typeError('officialHolidays.validation.endDateRequired')
    .test('is-after-start', 'officialHolidays.validation.endDateAfterStart', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      return new Date(value) >= new Date(startDate);
    }),
  duration: string()
    .required('officialHolidays.validation.durationRequired')
    .typeError('officialHolidays.validation.durationRequired'),
  officialDocument: mixed().optional(),
});

export type AddHolidaysProps = InferType<typeof AddHolidaysSchema>;
export type AddStaticHolidayProps = InferType<typeof AddStaticHolidaySchema>;
export type EditHolidayProps = InferType<typeof EditHolidaySchema>;
