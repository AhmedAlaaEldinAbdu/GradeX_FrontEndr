import { array, object, string, mixed, type InferType, number } from 'yup';

// Schema for adding a single official holiday
export const AddHolidaysSchema = object({
  holidayType: number()
    .required('officialHolidays.validation.holidayTypeRequired')
    .oneOf([1, 2], 'officialHolidays.validation.holidayTypeRequired')
    .typeError('officialHolidays.validation.holidayTypeRequired'),
  reasonAr: string()
    .required('officialHolidays.validation.reasonRequired')
    .typeError('officialHolidays.validation.reasonRequired'),
  reasonEn: string()
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

// Schema for adding a single fixed holiday
export const AddFixedHolidaySchema = object({
  holidayType: number()
    .required('officialHolidays.validation.holidayTypeRequired')
    .oneOf([1, 2], 'officialHolidays.validation.holidayTypeRequired')
    .typeError('officialHolidays.validation.holidayTypeRequired'),
  day: number()
    .required('officialHolidays.validation.dayRequired')
    .typeError('officialHolidays.validation.dayRequired'),
  country: string()
    .required('officialHolidays.validation.countryRequired')
    .typeError('officialHolidays.validation.countryRequired'),
  reasonAr: string()
    .required('officialHolidays.validation.reasonRequired')
    .typeError('officialHolidays.validation.reasonRequired'),
  reasonEn: string()
    .required('officialHolidays.validation.reasonRequired')
    .typeError('officialHolidays.validation.reasonRequired'),
  officialDocuments: array().of(mixed()).optional(),
});

// Schema for editing a holiday
export const EditHolidaySchema = object({
  holidayType: number()
    .required('officialHolidays.validation.holidayTypeRequired')
    .oneOf([1, 2], 'officialHolidays.validation.holidayTypeRequired')
    .typeError('officialHolidays.validation.holidayTypeRequired'),
  reasonAr: string()
    .required('officialHolidays.validation.reasonRequired')
    .typeError('officialHolidays.validation.reasonRequired'),
  reasonEn: string()
    .required('officialHolidays.validation.reasonRequired')
    .typeError('officialHolidays.validation.reasonRequired'),
  day: number()
    .required('officialHolidays.validation.dayRequired')
    .typeError('officialHolidays.validation.dayRequired'),
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
