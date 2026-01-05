import { array, mixed, number, object, string, type InferType } from 'yup';

export const JobCategory = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
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
  FULL_TIME: 1,
  PART_TIME: 2,
  BOTH: 3,
} as const;

export type ContractTypeValue = (typeof ContractType)[keyof typeof ContractType];

export const AddJobAnnouncementSchema = object({
  qualificationType: mixed<JobCategoryValue>()
    .oneOf(Object.values(JobCategory))
    .required('jobAnnouncement.validation.jobCategoryRequired'),
  name: string().required('jobAnnouncement.validation.jobNameArRequired'),
  nameEn: string().required('jobAnnouncement.validation.jobNameEnRequired'),
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
  specializationIds: string().when('qualificationType', {
    is: JobCategory.TEACHER,
    then: (schema) => schema.required('jobAnnouncement.validation.specializationRequired'),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  stageIds: string().when('qualificationType', {
    is: JobCategory.TEACHER,
    then: (schema) => schema.required('jobAnnouncement.validation.stageRequired'),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  subjectName: array()
    .of(string().required('jobAnnouncement.validation.subjectNameRequired'))
    .when('qualificationType', {
      is: JobCategory.TEACHER,
      then: (schema) =>
        schema.min(1, 'jobAnnouncement.validation.subjectNameRequired').required(
          'jobAnnouncement.validation.subjectNameRequired'
        ),
      otherwise: (schema) => schema.optional(),
    }),
  educationalStage: array()
    .of(string().required('jobAnnouncement.validation.educationalStageRequired'))
    .when('qualificationType', {
      is: JobCategory.TEACHER,
      then: (schema) =>
        schema.min(1, 'jobAnnouncement.validation.educationalStageRequired').required(
          'jobAnnouncement.validation.educationalStageRequired'
        ),
      otherwise: (schema) => schema.optional(),
    }),
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
  noticePeriod: mixed<WorkStartModeValue>()
    .oneOf(Object.values(WorkStartMode))
    .required('jobAnnouncement.validation.workStartDateRequired'),
  noticePeriodDate: string().when('noticePeriod', {
    is: WorkStartMode.SCHEDULED,
    then: (schema) => schema.required('jobAnnouncement.validation.workStartDateRequired'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  qualificationIds: array()
    .of(string().required('jobAnnouncement.validation.qualificationsRequired'))
    .min(1, 'jobAnnouncement.validation.qualificationsRequired')
    .required('jobAnnouncement.validation.qualificationsRequired'),
  yearsExperience: number()
    .typeError('jobAnnouncement.validation.yearsOfExperienceRequired')
    .min(0)
    .required('jobAnnouncement.validation.yearsOfExperienceRequired'),
  workStartTime: string().required('jobAnnouncement.validation.workingHoursFromRequired'),
  workEndTime: string()
    .required('jobAnnouncement.validation.workingHoursToRequired')
    .test(
      'working-hours-order',
      'jobAnnouncement.validation.workingHoursToAfterFrom',
      function (value) {
        const from = this?.parent?.workStartTime;
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
  contractType: mixed<ContractTypeValue>()
    .oneOf(Object.values(ContractType))
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
