import { array, mixed, number, object, string, type InferType } from 'yup';
import { JobAdvertismentWorkShedule } from '@/services/api/types/job-advertisment.types';

export const JobCategory = {
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
} as const;

export type JobCategoryValue = (typeof JobCategory)[keyof typeof JobCategory];

export const NationalityMode = {
  ALL: 'ALL',
  SPECIFIC: 'SPECIFIC',
} as const;

export type NationalityModeValue = (typeof NationalityMode)[keyof typeof NationalityMode];

export const WorkStartMode = {
  IMMEDIATE: 'IMMEDIATE',
  SCHEDULED: 'SCHEDULED',
} as const;

export type WorkStartModeValue = (typeof WorkStartMode)[keyof typeof WorkStartMode];

export const SalaryOption = {
  TBD: 'TBD',
  RANGE: 'RANGE',
} as const;

export type SalaryOptionValue = (typeof SalaryOption)[keyof typeof SalaryOption];

export const ContractType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
} as const;

export type ContractTypeValue = (typeof ContractType)[keyof typeof ContractType];

export const AddJobAnnouncementSchema = object({
  jobCategory: mixed<JobCategoryValue>()
    .oneOf(Object.values(JobCategory))
    .required('jobAnnouncement.validation.jobCategoryRequired'),
  teacherLevelId: string().when('jobCategory', {
    is: JobCategory.TEACHER,
    then: (schema) => schema.required('jobAnnouncement.validation.teacherLevelRequired'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  administrativePositionId: string().when('jobCategory', {
    is: JobCategory.ADMIN,
    then: (schema) => schema.required('jobAnnouncement.validation.administrativePositionRequired'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  specializationIds: string().required('jobAnnouncement.validation.specializationRequired'),
  stageIds: string().required('jobAnnouncement.validation.stageRequired'),
  subjectName: array()
    .of(string().required('jobAnnouncement.validation.subjectNameRequired'))
    .min(1, 'jobAnnouncement.validation.subjectNameRequired')
    .required('jobAnnouncement.validation.subjectNameRequired'),
  educationalStage: array()
    .of(string().required('jobAnnouncement.validation.educationalStageRequired'))
    .min(1, 'jobAnnouncement.validation.educationalStageRequired')
    .required('jobAnnouncement.validation.educationalStageRequired'),
  jobDescriptionAr: string().required('jobAnnouncement.validation.jobDescriptionRequired'),
  jobDescriptionEn: string().required('jobAnnouncement.validation.jobDescriptionEnRequired'),
  jobResponsibilitiesAr: string().required('jobAnnouncement.validation.jobResponsibilitiesRequired'),
  jobResponsibilitiesEn: string().required('jobAnnouncement.validation.jobResponsibilitiesEnRequired'),
  applicationStartDate: string().required('jobAnnouncement.validation.applicationStartDateRequired'),
  applicationEndDate: string().required('jobAnnouncement.validation.applicationEndDateRequired'),
  nationalityMode: mixed<NationalityModeValue>()
    .oneOf(Object.values(NationalityMode))
    .required('jobAnnouncement.validation.nationalRequired'),
  nationalityIds: array()
    .of(string().required('jobAnnouncement.validation.nationalityRequired'))
    .when('nationalityMode', {
      is: NationalityMode.SPECIFIC,
      then: (schema) => schema.min(1, 'jobAnnouncement.validation.nationalityRequired'),
      otherwise: (schema) => schema.optional(),
    }),
  workStartMode: mixed<WorkStartModeValue>()
    .oneOf(Object.values(WorkStartMode))
    .required('jobAnnouncement.validation.workStartDateRequired'),
  workStartDate: string().when('workStartMode', {
    is: WorkStartMode.SCHEDULED,
    then: (schema) => schema.required('jobAnnouncement.validation.workStartDateRequired'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  qualificationType: string().required('jobAnnouncement.validation.qualificationTypeRequired'),
  qualificationIds: array()
    .of(string().required('jobAnnouncement.validation.qualificationsRequired'))
    .min(1, 'jobAnnouncement.validation.qualificationsRequired')
    .required('jobAnnouncement.validation.qualificationsRequired'),
  yearsExperience: number()
    .typeError('jobAnnouncement.validation.yearsOfExperienceRequired')
    .min(0)
    .required('jobAnnouncement.validation.yearsOfExperienceRequired'),
  workStartTime: string().required('jobAnnouncement.validation.workStartTimeRequired'),
  workEndTime: string().required('jobAnnouncement.validation.workEndTimeRequired'),
  workingHoursFrom: string().required('jobAnnouncement.validation.workingHoursFromRequired'),
  workingHoursTo: string()
    .required('jobAnnouncement.validation.workingHoursToRequired')
    .test(
      'working-hours-order',
      'jobAnnouncement.validation.workingHoursToAfterFrom',
      function (value) {
        const from = this?.parent?.workingHoursFrom;
        if (!value || !from) {
          return true;
        }

        return value >= from;
      }
    ),
  salary: mixed<SalaryOptionValue>()
    .oneOf(Object.values(SalaryOption))
    .required('jobAnnouncement.validation.salaryRangeRequired'),
  minimumSalary: number()
    .typeError('jobAnnouncement.validation.minimumSalaryRequired')
    .when('salary', {
      is: SalaryOption.RANGE,
      then: (schema) => schema.required('jobAnnouncement.validation.minimumSalaryRequired').min(0),
      otherwise: (schema) => schema.nullable().optional(),
    }),
  maximumSalary: number()
    .typeError('jobAnnouncement.validation.maximumSalaryRequired')
    .when('salary', {
      is: SalaryOption.RANGE,
      then: (schema) =>
        schema
          .required('jobAnnouncement.validation.maximumSalaryRequired')
          .min(0)
          .test('max-greater-min', 'jobAnnouncement.validation.maximumSalaryRequired', function (value) {
            const rawMin = this?.parent?.minimumSalary;
            const min =
              typeof rawMin === 'number'
                ? rawMin
                : rawMin !== undefined && rawMin !== null
                  ? Number(rawMin)
                  : undefined;

            if (value === undefined || value === null) {
              return false;
            }

            if (min === undefined || Number.isNaN(min)) {
              return true;
            }

            return Number(value) >= min;
          }),
      otherwise: (schema) => schema.nullable().optional(),
    }),
  teacherGender: string().required('jobAnnouncement.validation.teacherGenderRequired'),
  contractType: array()
    .of(string().required('jobAnnouncement.validation.contractTypeRequired'))
    .min(1, 'jobAnnouncement.validation.contractTypeRequired')
    .required('jobAnnouncement.validation.contractTypeRequired'),
  technicalSkillIds: string()
    .nullable()
    .required('jobAnnouncement.validation.technicalSkillRequired'),
  personalSkillIds: string()
    .nullable()
    .required('jobAnnouncement.validation.personalSkillRequired'),
  benefitsIds: array().of(string()).optional(),
  languages: array()
    .of(
      object({
        languageId: string().required('jobAnnouncement.validation.languageIdRequired'),
        levelId: string().required('jobAnnouncement.validation.languageLevelRequired'),
      })
    )
    .min(1, 'jobAnnouncement.validation.languagesRequired')
    .required('jobAnnouncement.validation.languagesRequired'),
});

export type AddJobAnnouncementFormValues = InferType<typeof AddJobAnnouncementSchema>;
