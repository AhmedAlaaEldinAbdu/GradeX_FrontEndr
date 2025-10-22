import * as yup from 'yup';

export const NotificationSchema = yup.object({
  sentTo: yup
    .string()
    .required('notifications.validation.sentToRequired')
    .typeError('notifications.validation.sentToRequired'),
  recipientType: yup.string().when('sentTo', {
    is: (val: string) => val && val.includes('دولة'),
    then: (schema) => schema.required('notifications.validation.recipientTypeRequired'),
    otherwise: (schema) => schema.optional(),
  }),
  recipientNames: yup.string().when('sentTo', {
    is: (val: string) => val && (val.includes('مدينة') || val.includes('موظفين')),
    then: (schema) => schema.required('notifications.validation.recipientNamesRequired'),
    otherwise: (schema) => schema.optional(),
  }),
  date: yup
    .string()
    .required('notifications.validation.dateRequired')
    .typeError('notifications.validation.dateRequired'),
  content: yup
    .string()
    .required('notifications.validation.contentRequired')
    .typeError('notifications.validation.contentRequired'),
  attachmentFile: yup.string().optional(),
});

export type NotificationProps = yup.InferType<typeof NotificationSchema>;
