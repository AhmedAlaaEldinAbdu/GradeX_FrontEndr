import * as yup from 'yup';

export const RegistrationAnnouncementSchema = yup.object().shape({
  lkSchoolStageIds: yup
    .array()
    .of(yup.string().required())
    .min(1, 'common.validation.required')
    .required('common.validation.required'),
  startDate: yup
    .string()
    .required('common.validation.required')
    .test('is-future', 'common.validation.startDateInPast', function (value) {
      if (!value) return true;
      const date = new Date(value);
      const now = new Date();
      return date >= new Date(now.setMinutes(now.getMinutes() - 5));
    }),
  endDate: yup
    .string()
    .required('common.validation.required')
    .test('is-future', 'common.validation.endDateInPast', function (value) {
      if (!value) return true;
      const date = new Date(value);
      const now = new Date();
      return date >= new Date(now.setMinutes(now.getMinutes() - 5));
    })
    .test('is-after-start', 'common.validation.endDateAfterStart', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) {
        return true;
      }
      return new Date(value) > new Date(startDate);
    }),
});

export type RegistrationAnnouncementProps = yup.InferType<typeof RegistrationAnnouncementSchema>;
