import * as yup from "yup";

export const AcademicSystemSchema = yup.object({
  academicSystems: yup
    .array()
    .of(
      yup.object({
        academicSystemName: yup
          .string()
          .required("academicSystem.validation.academicSystemNameRequired").typeError("academicSystem.validation.academicSystemNameRequired"),
        systemType: yup.array().of(yup.string()).optional(),
        countryId: yup
          .array()
          .of(yup.string())
          .required("academicSystem.validation.countryRequired").typeError("academicSystem.validation.countryRequired"),
      })
    )
    .required("academicSystem.validation.requiredList")
    .min(1, "academicSystem.validation.atLeastOne").typeError("academicSystem.validation.requiredList"),
});

export const EducationalStagesSchema = yup.object({
  educationalStages: yup
    .array()
    .of(
      yup.object({
        educationalStagesSystemName: yup
          .string()
          .required("academicSystem.validation.educationalStagesNameRequired").typeError("academicSystem.validation.educationalStagesNameRequired"),
        academicSystem: yup
          .array()
          .of(yup.string())
          .required("academicSystem.validation.academicSystemRequired").typeError("academicSystem.validation.academicSystemRequired"),
      })
    )
    .required("academicSystem.validation.requiredList")
    .min(1, "academicSystem.validation.atLeastOne").typeError("academicSystem.validation.requiredList"),
});


export type AcademicSystemProps = yup.InferType<
  typeof AcademicSystemSchema
>;
export type EducationalStagesProps = yup.InferType<
  typeof EducationalStagesSchema
>;
