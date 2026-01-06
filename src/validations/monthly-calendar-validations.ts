import { array, boolean, number, object, string, type InferType } from 'yup';

export const MonthlyEventFormSchema = object({
    nameAr: string().trim().required('monthlyCalendar.validation.nameAr'),
    nameEn: string().trim().required('monthlyCalendar.validation.nameEn'),
    grades: array()
        .of(string().required())
        .min(1, 'monthlyCalendar.validation.stageIds'),
    classRomms: array()
        .of(string().required())
        .min(1, 'monthlyCalendar.validation.classroomIds'),
    day: string().required('monthlyCalendar.validation.date'),
    schoolBranchesId: string().trim().required('common.validation.required'),
    isFullDay: boolean().default(true),
    duration: number().oneOf([1, 2]).default(1),
    startTime: string().when('isFullDay', {
        is: false,
        then: (schema) => schema.required('monthlyCalendar.validation.startTime'),
        otherwise: (schema) => schema.nullable().default(''),
    }),
    endTime: string().when('isFullDay', {
        is: false,
        then: (schema) =>
            schema
                .required('monthlyCalendar.validation.endTime')
                .test('ends-after-start', 'monthlyCalendar.validation.endAfterStart', function (value) {
                    const { startTime } = this.parent as { startTime?: string };
                    if (!startTime || !value) {
                        return true;
                    }
                    return value >= startTime;
                }),
        otherwise: (schema) => schema.nullable().default(''),
    }),
});

export type MonthlyEventFormValues = InferType<typeof MonthlyEventFormSchema>;

export const MonthlyCalendarFiltersSchema = object({
    searchTerm: string().trim().max(100).default(''),
    stageId: string().default(''),
    classroomId: string().default(''),
    date: string().default(''),
});

export type MonthlyCalendarFiltersValues = InferType<typeof MonthlyCalendarFiltersSchema>;
