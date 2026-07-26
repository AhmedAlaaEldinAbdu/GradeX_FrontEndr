import { object, string, ref, type InferType } from 'yup';

export const LoginSchema = object({
  email: string()
    .email('login.emailInvalid')
    .required('login.emailRequired')
    .typeError('login.emailInvalid'),
  password: string().min(6, 'login.passwordInvalid').required('login.passwordRequired'),
});

export const EmailSchema = object({
  email: string()
    .email('login.emailInvalid')
    .required('login.emailRequired')
    .typeError('login.emailInvalid'),
});

export const ChangePasswordSchema = object({
  // currentPassword: string()
  //   .required("login.currentPasswordRequired"),
  newPassword: string().required('login.passwordInvalid').typeError('login.passwordInvalid'),
  confirmPassword: string()
    .required('login.confirmPassword')
    .oneOf([ref('login.newPassword')], 'login.passwordsNotMatch')
    .typeError('login.passwordInvalid'),
});

export const ChangeMyPasswordSchema = object({
  currentPassword: string()
    .required('changePassword.currentPasswordRequired')
    .typeError('changePassword.currentPasswordRequired'),
  newPassword: string()
    .min(6, 'login.passwordInvalid')
    .required('login.passwordInvalid')
    .typeError('login.passwordInvalid'),
  confirmPassword: string()
    .required('login.confirmPassword')
    .oneOf([ref('newPassword')], 'login.passwordsNotMatch')
    .typeError('login.passwordInvalid'),
});

export const DeleteAccountSchema = object({
  password: string().min(6, 'login.passwordInvalid').required('login.passwordRequired'),
});

export type LoginProps = InferType<typeof LoginSchema>;
export type EmaileProps = InferType<typeof EmailSchema>;
export type ChangePasswordProps = InferType<typeof ChangePasswordSchema>;
export type ChangeMyPasswordProps = InferType<typeof ChangeMyPasswordSchema>;
export type DeleteAccountProps = InferType<typeof DeleteAccountSchema>;
