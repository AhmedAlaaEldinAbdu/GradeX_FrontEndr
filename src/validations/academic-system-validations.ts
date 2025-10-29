import { array, object, string, type InferType } from "yup";

export const AcademicSystemSchema = object({
  academicSystems: array()
    .of(
      object({
        name: string().required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
        subSystemIds: array().of(string()).optional(),
        countryIds: array().of(string())
          .required("academicSystem.validation.countryRequired").typeError("academicSystem.validation.countryRequired"),
      })
    )
    .required("academicSystem.validation.requiredList")
    .min(1, "academicSystem.validation.atLeastOne").typeError("academicSystem.validation.requiredList"),
});

export const EducationalStagesSchema = object({
  educationalStages: array().of(
    object({
      educationalStagesSystemName: string()
        .required("academicSystem.validation.educationalStagesNameRequired").typeError("academicSystem.validation.educationalStagesNameRequired"),
      academicSystem: array()
        .of(string())
        .required("academicSystem.validation.academicSystemRequired").typeError("academicSystem.validation.academicSystemRequired"),
    })
  )
    .required("academicSystem.validation.requiredList")
    .min(1, "academicSystem.validation.atLeastOne").typeError("academicSystem.validation.requiredList"),
});


export type AcademicSystemProps = InferType<
  typeof AcademicSystemSchema
>;
export type EducationalStagesProps = InferType<
  typeof EducationalStagesSchema
>;
