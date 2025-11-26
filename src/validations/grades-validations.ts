import { array, mixed, number, object, string, type InferType } from "yup";

export const GradesSchema = object({
  academicSystem: string()
    .required("grades.validation.academicSystemRequired")
    .typeError("grades.validation.academicSystemRequired"),
  educationalStage: string()
    .required("grades.validation.educationalStageRequired")
    .typeError("grades.validation.educationalStageRequired"),
  grades: array()
    .of(
      object({
        nameAr: string()
          .required("grades.validation.gradeNameRequired")
          .typeError("grades.validation.gradeNameRequired"),
        nameEn: string()
          .required("grades.validation.gradeNameRequired")
          .typeError("grades.validation.gradeNameRequired"),
        nicknameAr: string().default(""),
        nicknameEn: string().default(""),
        descriptionAr: string().default(""),
        descriptionEn: string().default(""),
        maxStudents: number()
          .required("grades.validation.maxStudentsRequired")
          .positive("grades.validation.maxStudentsMustBePositive")
          .integer("grades.validation.maxStudentsMustBeInteger")
          .typeError("grades.validation.maxStudentsRequired"),
        classImage: mixed().optional(),
      })
    )
    .required("grades.validation.requiredList")
    .min(1, "grades.validation.atLeastOne")
    .typeError("grades.validation.requiredList"),
});

export const EditGradeSchema = object({
  academicSystem: string()
    .required("grades.validation.academicSystemRequired")
    .typeError("grades.validation.academicSystemRequired"),
  educationalStage: string()
    .required("grades.validation.educationalStageRequired")
    .typeError("grades.validation.educationalStageRequired"),
  nameAr: string()
    .required("grades.validation.gradeNameRequired")
    .typeError("grades.validation.gradeNameRequired"),
  nameEn: string()
    .required("grades.validation.gradeNameRequired")
    .typeError("grades.validation.gradeNameRequired"),
  nicknameAr: string().default(""),
  nicknameEn: string().default(""),
  descriptionAr: string().default(""),
  descriptionEn: string().default(""),
  maxStudents: number()
    .required("grades.validation.maxStudentsRequired")
    .positive("grades.validation.maxStudentsMustBePositive")
    .integer("grades.validation.maxStudentsMustBeInteger")
    .typeError("grades.validation.maxStudentsRequired"),
  classImage: mixed().optional(),
});

export type GradesProps = InferType<typeof GradesSchema>;
export type EditGradeProps = InferType<typeof EditGradeSchema>;
