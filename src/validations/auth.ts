import { object, string, ref, type InferType } from "yup";

export const LoginSchema = object({
  email: string().email("login.emailInvalid").required("login.emailRequired").typeError("login.emailInvalid"),
  password: string().min(6, "login.passwordInvalid").required("login.passwordRequired"),
});

export const ChangePasswordSchema = object({
  // currentPassword: string()
  //   .required("login.currentPasswordRequired"),
  newPassword: string()
    .required("login.passwordInvalid")
    .typeError("login.passwordInvalid"),
  confirmPassword: string()
    .required("login.confirmPassword")
    .oneOf([ref("login.newPassword")], "login.passwordsNotMatch").typeError("login.passwordInvalid"),
});


export type LoginProps = InferType<typeof LoginSchema>;
export type ChangePasswordProps = InferType<typeof ChangePasswordSchema>;