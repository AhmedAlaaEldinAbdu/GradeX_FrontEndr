import * as yup from 'yup';

export const RegistrationAnnouncementSchema = yup.object().shape({
  lkSchoolStageId: yup.string().required('common.validation.required'),
  startDate: yup.string().required('common.validation.required'),
  endDate: yup
    .string()
    .required('common.validation.required')
    .test('is-after-start', 'validation.endDateAfterStart', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) {
        return true;
      }
      return new Date(value) >= new Date(startDate);
    }),
});

export type RegistrationAnnouncementProps = yup.InferType<typeof RegistrationAnnouncementSchema>;
