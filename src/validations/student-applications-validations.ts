import * as yup from 'yup';

export interface ScheduleAppointmentFormProps {
  appointmentDate: string;
  appointmentTime: string;
}

export const ScheduleAppointmentFormSchema = yup.object().shape({
  appointmentDate: yup
    .string()
    .required('common.validation.required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  appointmentTime: yup
    .string()
    .required('common.validation.required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
});
