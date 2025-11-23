import { array, object, string, mixed, type InferType } from 'yup';

// Schema for adding a single official holiday
export const AddHolidaysSchema = object({
  holidayType: string()
    .required('officialHolidays.validation.holidayTypeRequired')
    .typeError('officialHolidays.validation.holidayTypeRequired'),
  reasonInAr: string()
    .required('officialHolidays.validation.reasonRequired')
    .typeError('officialHolidays.validation.reasonRequired'),
  reasonInEn: string()
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
  country: string()
    .required('officialHolidays.validation.countryRequired')
    .typeError('officialHolidays.validation.countryRequired'),
  officialDocuments: array().of(mixed()).optional(),
});

// Schema for adding a single fixed holiday (or multiple)
export const AddFixedHolidaySchema = object({
  holidayType: string()
    .required('officialHolidays.validation.holidayTypeRequired')
    .typeError('officialHolidays.validation.holidayTypeRequired'),
  holidays: array()
    .of(
      object({
        day: string()
          .required('officialHolidays.validation.dayRequired')
          .typeError('officialHolidays.validation.dayRequired'),
        country: string()
          .required('officialHolidays.validation.countryRequired')
          .typeError('officialHolidays.validation.countryRequired'),
        reasonInAr: string()
          .required('officialHolidays.validation.reasonRequired')
          .typeError('officialHolidays.validation.reasonRequired'),
        reasonInEn: string()
          .required('officialHolidays.validation.reasonRequired')
          .typeError('officialHolidays.validation.reasonRequired'),
        officialDocuments: array().of(mixed()).optional(),
      })
    )
    .required('officialHolidays.validation.requiredList')
    .min(1, 'officialHolidays.validation.atLeastOneHoliday')
    .typeError('officialHolidays.validation.requiredList'),
});

// Schema for editing a holiday
export const EditHolidaySchema = object({
  holidayType: string()
    .required('officialHolidays.validation.holidayTypeRequired')
    .typeError('officialHolidays.validation.holidayTypeRequired'),
  reasonInAr: string()
    .required('officialHolidays.validation.reasonRequired')
    .typeError('officialHolidays.validation.reasonRequired'),
  reasonInEn: string()
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
  country: string()
    .required('officialHolidays.validation.countryRequired')
    .typeError('officialHolidays.validation.countryRequired'),
  officialDocuments: array().of(mixed()).optional(),
});

export type AddHolidaysProps = InferType<typeof AddHolidaysSchema>;
export type AddFixedHolidayProps = InferType<typeof AddFixedHolidaySchema>;
export type EditHolidayProps = InferType<typeof EditHolidaySchema>;
