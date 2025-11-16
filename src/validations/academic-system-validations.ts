import { array, object, string, type InferType } from "yup";

export const AcademicSystemSchema = object({
  academicSystems: array()
    .of(
      object({
        nameAr: string().required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
        nameEn: string().required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
        subSystemIds: array().of(string()).min(1, "academicSystem.validation.systemTypeRequired").required("academicSystem.validation.systemTypeRequired").typeError("academicSystem.validation.systemTypeRequired"),
        countryIds: array().of(string()).min(1, "academicSystem.validation.countryRequired")
          .required("academicSystem.validation.countryRequired").typeError("academicSystem.validation.countryRequired"),
      })
    )
    .required("academicSystem.validation.requiredList")
    .min(1, "academicSystem.validation.atLeastOne").typeError("academicSystem.validation.requiredList"),
});
export const EditAcademicSystemSchema = object({
  nameAr: string().required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
  nameEn: string().required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
  subSystemIds: array().of(string()).min(1, "academicSystem.validation.systemTypeRequired").required("academicSystem.validation.systemTypeRequired").typeError("academicSystem.validation.systemTypeRequired"),
  countryIds: array().of(string()).min(1, "academicSystem.validation.countryRequired").required("academicSystem.validation.countryRequired").typeError("academicSystem.validation.countryRequired"),
})

export const EducationalStagesSchema = object({
  educationalStages: array().of(
    object({
      nameAr: string()
        .required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
      nameEn: string()
        .required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
      academicSystem: string()
        .required("academicSystem.validation.academicSystemRequired").typeError("academicSystem.validation.academicSystemRequired"),
    })
  )
    .required("academicSystem.validation.requiredList")
    .min(1, "academicSystem.validation.atLeastOne").typeError("academicSystem.validation.requiredList"),
});
export const EditEducationalStagesSchema = object({
  nameAr: string()
    .required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
  nameEn: string()
    .required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
  academicSystem: string()
    .required("academicSystem.validation.academicSystemRequired").typeError("academicSystem.validation.academicSystemRequired"),
})


export type AcademicSystemProps = InferType<
  typeof AcademicSystemSchema
>;
export type EditAcademicSystemProps = InferType<
  typeof EditAcademicSystemSchema
>;
export type EducationalStagesProps = InferType<
  typeof EducationalStagesSchema
>;
export type EditEducationalStagesProps = InferType<
  typeof EditEducationalStagesSchema
>;
