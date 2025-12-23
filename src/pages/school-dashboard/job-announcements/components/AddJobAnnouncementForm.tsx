import { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomCheckbox from '@/shared/components/CustomCheckbox';
import IconButton from '@/shared/components/IconButton';
import Button from '@/shared/components/Button';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useToast } from '@/shared/context/ToastContext';
import {
  fetchAdministrativePositions,
  fetchCountries,
  fetchJobBenefits,
  fetchLanguages,
  fetchLanguageLevels,
  fetchQualifications,
  fetchSchoolStages,
  fetchTeacherLevels,
} from '@/redux/features/lookups/lookupsSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import {
  createJobAdvertisment,
  fetchJobAdvertisments,
} from '@/redux/features/job-advertisments/jobAdvertismentsSlice';
import type {
  CreateJobAdvertismentRequest,
  CreateJobAdvertismentRequestTwo,
} from '@/services/api/types/job-advertisment.types';
import { JobAdvertismentWorkShedule } from '@/services/api/types/job-advertisment.types';
import {
  AddJobAnnouncementSchema,
  type AddJobAnnouncementFormValues,
  ContractType,
  JobCategory,
  NationalityMode,
  SalaryOption,
  WorkStartMode,
} from '@/validations/job-announcements-validations';
import CustomImage from '@/shared/components/CustomImage';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';

interface LocalizedOption {
  value: string;
  labelAr: string;
  labelEn: string;
}

const TECHNICAL_SKILL_OPTIONS: LocalizedOption[] = [
  { value: 'google-classroom', labelAr: 'جوجل كلاس روم', labelEn: 'Google Classroom' },
  { value: 'microsoft-teams', labelAr: 'مايكروسوفت تيمز', labelEn: 'Microsoft Teams' },
  { value: 'smart-board', labelAr: 'السبورة الذكية', labelEn: 'Smart Board' },
];

const PERSONAL_SKILL_OPTIONS: LocalizedOption[] = [
  { value: 'communication', labelAr: 'التواصل', labelEn: 'Communication' },
  { value: 'leadership', labelAr: 'القيادة', labelEn: 'Leadership' },
  { value: 'planning', labelAr: 'التخطيط', labelEn: 'Planning' },
];

const TEACHER_GENDER_OPTIONS = [
  { value: 'MALE', labelKey: 'jobAnnouncement.form.genderMale' },
  { value: 'FEMALE', labelKey: 'jobAnnouncement.form.genderFemale' },
  { value: 'ANY', labelKey: 'jobAnnouncement.form.genderAny' },
];

const CONTRACT_TYPE_OPTIONS = [
  { value: ContractType.FULL_TIME, labelKey: 'jobAnnouncement.form.contractFullTime' },
  { value: ContractType.PART_TIME, labelKey: 'jobAnnouncement.form.contractPartTime' },
];

const SALARY_OPTION_RADIOS = [
  { value: SalaryOption.TBD, labelKey: 'jobAnnouncement.form.toBeDeterminedLater' },
  { value: SalaryOption.RANGE, labelKey: 'jobAnnouncement.form.estimatedSalary' },
];

const WORK_START_OPTIONS = [
  { value: WorkStartMode.IMMEDIATE, labelKey: 'jobAnnouncement.form.workStartImmediate' },
  { value: WorkStartMode.SCHEDULED, labelKey: 'jobAnnouncement.form.workStartScheduled' },
];

const NATIONALITY_OPTIONS = [
  { value: NationalityMode.ALL, labelKey: 'jobAnnouncement.form.nationalityAll' },
  { value: NationalityMode.SPECIFIC, labelKey: 'jobAnnouncement.form.nationalitySpecific' },
];

const DEFAULT_QUALIFICATION_TYPE = '1';

const DEFAULT_VALUES: AddJobAnnouncementFormValues = {
  jobCategory: JobCategory.TEACHER,
  teacherLevelId: '',
  administrativePositionId: '',
  specializationIds: [],
  stageIds: [],
  jobDescriptionAr: '',
  jobDescriptionEn: '',
  jobResponsibilitiesAr: '',
  jobResponsibilitiesEn: '',
  applicationStartDate: '',
  applicationEndDate: '',
  nationalityMode: NationalityMode.ALL,
  nationalityIds: [],
  workStartMode: WorkStartMode.IMMEDIATE,
  workStartDate: '',
  qualificationType: DEFAULT_QUALIFICATION_TYPE,
  qualificationIds: [],
  yearsOfExperience: 0,
  workStartTime: '',
  workEndTime: '',
  salaryOption: SalaryOption.TBD,
  minimumSalary: 0,
  maximumSalary: 0,
  teacherGender: 'ANY',
  contractType: [ContractType.FULL_TIME],
  technicalSkillIds: [],
  personalSkillIds: [],
  benefitsIds: [],
  languages: [{ languageId: '', levelId: '' }],
};

function getLocalizedOptions(options: LocalizedOption[], lang: 'ar' | 'en') {
  return options.map((option) => ({
    value: option.value,
    label: lang === 'ar' ? option.labelAr : option.labelEn,
  }));
}

export default function AddJobAnnouncementForm() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const {
    countries,
    schoolStages,
    teacherLevels,
    administrativePositions,
    qualifications,
    jobBenefits,
    languages: lookupLanguages,
    languageLevels,
    isLoadingCountries,
    isLoadingSchoolStages,
    isLoadingTeacherLevels,
    isLoadingAdministrativePositions,
    isLoadingQualifications,
    isLoadingJobBenefits,
    isLoadingLanguages,
    isLoadingLanguageLevels,
  } = useAppSelector((state) => state.lookups);
  const { subjects, isLoading: isLoadingSubjects } = useAppSelector((state) => state.subjects);
  const { isCreating } = useAppSelector((state) => state.jobAdvertisments);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddJobAnnouncementFormValues>({
    resolver: yupResolver(AddJobAnnouncementSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: 'languages',
  });

  const jobCategory = watch('jobCategory');
  const nationalityMode = watch('nationalityMode');
  const workStartMode = watch('workStartMode');
  const salaryOption = watch('salaryOption');
  const contractType = watch('contractType');
  const selectedBenefits = watch('benefitsIds');

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchSchoolStages());
    dispatch(fetchQualifications());
    dispatch(fetchLanguages());
    dispatch(fetchLanguageLevels());
    dispatch(fetchJobBenefits());
    dispatch(fetchSubjects({ page: 1, limit: 10000 }));
  }, [dispatch]);

  useEffect(() => {
    if (jobCategory === JobCategory.TEACHER) {
      dispatch(fetchTeacherLevels());
    } else {
      dispatch(fetchAdministrativePositions());
    }
  }, [dispatch, jobCategory]);

  useEffect(() => {
    if (jobCategory === JobCategory.TEACHER) {
      setValue('administrativePositionId', '');
    } else {
      setValue('teacherLevelId', '');
    }
  }, [jobCategory, setValue]);

  useEffect(() => {
    if (nationalityMode === NationalityMode.ALL) {
      setValue('nationalityIds', []);
    }
  }, [nationalityMode, setValue]);

  useEffect(() => {
    if (workStartMode === WorkStartMode.IMMEDIATE) {
      setValue('workStartDate', '');
      setValue('noticePeriodDate', '');
    }
  }, [workStartMode, setValue]);

  useEffect(() => {
    if (salaryOption === SalaryOption.TBD) {
      setValue('minimumSalary', 0);
      setValue('maximumSalary', 0);
    }
  }, [salaryOption, setValue]);

  const countryOptions = useMemo(() => {
    if (!Array.isArray(countries)) return [];
    return countries.map((country) => ({
      value: country.id,
      label: currentLang === 'ar' ? country.arabicName : country.englishName,
    }));
  }, [countries, currentLang]);

  const stageOptions = useMemo(() => {
    if (!Array.isArray(schoolStages)) return [];
    return schoolStages.map((stage) => ({
      value: stage.id,
      label: currentLang === 'ar' ? stage.nameAR : stage.nameEN,
    }));
  }, [schoolStages, currentLang]);

  const subjectOptions = useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    return subjects.map((subject) => ({
      value: subject.id,
      label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
    }));
  }, [subjects, currentLang]);

  const qualificationOptions = useMemo(() => {
    if (!Array.isArray(qualifications)) return [];
    return qualifications.map((qualification) => ({
      value: qualification.id,
      label:
        currentLang === 'ar' ? qualification.nameAr : qualification.nameEn || qualification.nameAr,
    }));
  }, [qualifications, currentLang]);

  const teacherLevelOptions = useMemo(() => {
    if (!Array.isArray(teacherLevels)) return [];
    return teacherLevels.map((level) => ({
      value: level.id,
      label: currentLang === 'ar' ? level.arabicName : level.englishName || level.arabicName,
    }));
  }, [teacherLevels, currentLang]);

  const adminPositionOptions = useMemo(() => {
    if (!Array.isArray(administrativePositions)) return [];
    return administrativePositions.map((position) => ({
      value: position.id,
      label:
        currentLang === 'ar' ? position.arabicName : position.englishName || position.arabicName,
    }));
  }, [administrativePositions, currentLang]);

  const technicalSkillOptions = useMemo(
    () => getLocalizedOptions(TECHNICAL_SKILL_OPTIONS, currentLang),
    [currentLang]
  );

  const personalSkillOptions = useMemo(
    () => getLocalizedOptions(PERSONAL_SKILL_OPTIONS, currentLang),
    [currentLang]
  );

  const benefitOptions = useMemo(() => {
    if (!Array.isArray(jobBenefits)) return [];
    return jobBenefits.map((benefit) => ({
      value: benefit.id,
      label: currentLang === 'ar' ? benefit.nameAr : benefit.nameEn || benefit.nameAr,
    }));
  }, [jobBenefits, currentLang]);

  const languageOptions = useMemo(() => {
    if (!Array.isArray(lookupLanguages)) return [];
    return lookupLanguages.map((language) => ({
      value: language.id,
      label:
        currentLang === 'ar' ? language.arabicName : language.englishName || language.arabicName,
    }));
  }, [lookupLanguages, currentLang]);

  const languageLevelOptions = useMemo(() => {
    if (!Array.isArray(languageLevels)) return [];
    return languageLevels.map((level) => ({
      value: level.id,
      label: currentLang === 'ar' ? level.nameAr : level.nameEn || level.nameAr,
    }));
  }, [languageLevels, currentLang]);

  const toggleContractType = (value: string, isChecked: boolean) => {
    const current = contractType || [];
    if (isChecked) {
      if (!current.includes(value)) {
        setValue('contractType', [...current, value]);
      }
      return;
    }

    setValue(
      'contractType',
      current.filter((item) => item !== value)
    );
  };

  const toggleBenefit = (value: string, isChecked: boolean) => {
    const current = selectedBenefits || [];
    if (isChecked) {
      if (!current.includes(value)) {
        setValue('benefitsIds', [...current, value]);
      }
      return;
    }

    setValue(
      'benefitsIds',
      current.filter((item) => item !== value)
    );
  };

  const onSubmit = async (values: AddJobAnnouncementFormValues) => {
    const primarySubjectId = values.specializationIds[0] || '';
    const qualificationTypeNumber = Number(values.qualificationType) || 0;
    const nationalityValue = values.nationalityMode === NationalityMode.ALL ? 0 : 1;

    const salaryMin = Number(values.minimumSalary || 0);
    const salaryMax = Number(values.maximumSalary || 0);
    const salaryAverage =
      values.salaryOption === SalaryOption.RANGE ? (salaryMin + salaryMax) / 2 : 0;

    const payload: CreateJobAdvertismentRequestTwo = {
      qualificationType: qualificationTypeNumber,
      materialId: primarySubjectId,
      jobDescription: values.jobDescriptionAr,
      jobDescriptionEn: values.jobDescriptionEn,
      jobResponsibilities: values.jobResponsibilitiesAr,
      jobResponsibilitiesEn: values.jobResponsibilitiesEn,
      advertisementStartDate: values.applicationStartDate,
      advertisementEndDate: values.applicationEndDate,
      nationality: nationalityValue,
      salary: salaryAverage,
      minimumSalary: values.salaryOption === SalaryOption.RANGE ? salaryMin : 0,
      maximumSalary: values.salaryOption === SalaryOption.RANGE ? salaryMax : 0,
      teacherGender:
        values.teacherGender === 'MALE' ? 0 : values.teacherGender === 'FEMALE' ? 1 : 2,
      yearsExperience: Number(values.yearsOfExperience || 0),
      workShedule: workSchedule,
      workStartTime: values.workStartTime,
      workEndTime: values.workEndTime,
      lkAdministrativePositionId: values.administrativePositionId || '',
      lkTeacherLevelId: values.teacherLevelId || '',
      //
      jobAdvertismentTechnicalSkillsDto: values.technicalSkillIds.map((skillId) => {
        const label = TECHNICAL_SKILL_OPTIONS.find((option) => option.value === skillId);
        return { technicalAppName: label ? label.labelEn : skillId };
      }),
      jobAdvertismentPersonalSkillsDto: values.personalSkillIds.map((skillId) => {
        const label = PERSONAL_SKILL_OPTIONS.find((option) => option.value === skillId);
        return { personalSkillName: label ? label.labelEn : skillId };
      }),
      //
      jobAdvertismentMaterialDto: values.specializationIds.map((subjectId) => ({
        materialId: subjectId,
      })),
      jobAdvertisementCountryDto:
        values.nationalityMode === NationalityMode.ALL
          ? []
          : values.nationalityIds.map((countryId) => ({ lkCountryId: countryId })),
      jobAdvertisementQualificationDto: values.qualificationIds.map((qualificationId) => ({
        lkQualificationId: qualificationId,
      })),
      jobAdvertisementSchoolStageDto: values.stageIds.map((stageId) => ({
        lkSchoolStageId: stageId,
      })),
      jobAdvertisementLanguageDto: values.languages
        .filter((language) => language.languageId && language.levelId)
        .map((language) => ({
          lkLanguageId: language.languageId,
          lkLanguageLevelId: language.levelId,
        })),
      jobAdvertisementJobBenefitDto: values.benefitsIds.map((benefitId) => ({
        lkJobBenefitId: benefitId,
      })),
      jobAdvertisementLanguageDto2: undefined,
    } as CreateJobAdvertismentRequestTwo;

    try {
      await dispatch(createJobAdvertisment(payload))
        .unwrap()
        .then((res) => {
          if (res.isSuccess) {
            showToast({ type: 'success', message: 'jobAnnouncement.form.successMessage' });
          } else {
            showToast({ type: 'error', message: 'common.errorOccurred' });
          }
        });
      await dispatch(fetchJobAdvertisments({ page: 1, limit: 10 }));
      navigate('/job-announcements');
    } catch (error) {
      showToast({ type: 'error', message: 'common.errorOccurred' });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label={t('jobAnnouncement.form.jobCategory')} required htmlFor="jobCategory">
              <div className="flex flex-wrap items-center gap-6 p-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value={String(JobCategory.ADMIN)}
                    checked={jobCategory === JobCategory.ADMIN}
                    onChange={() => setValue('jobCategory', JobCategory.ADMIN)}
                    className="h-4 w-4 accent-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t('jobAnnouncement.form.jobCategoryAdmin')}
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value={String(JobCategory.TEACHER)}
                    checked={jobCategory === JobCategory.TEACHER}
                    onChange={() => setValue('jobCategory', JobCategory.TEACHER)}
                    className="h-4 w-4 accent-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t('jobAnnouncement.form.jobCategoryTeacher')}
                  </span>
                </label>
              </div>
            </FormField>

            {jobCategory === JobCategory.TEACHER ? (
              <FormField
                label={t('jobAnnouncement.form.teacherLevel')}
                required
                error={errors.teacherLevelId?.toString()}
                htmlFor="teacherLevelId"
              >
                <Controller
                  name="teacherLevelId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      id="teacherLevelId"
                      value={field.value || ''}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                      options={teacherLevelOptions}
                      placeholder={
                        isLoadingTeacherLevels
                          ? t('common.loading')
                          : t('jobAnnouncement.form.selectTeacherLevel')
                      }
                      error={!!errors.teacherLevelId}
                      disabled={isLoadingTeacherLevels}
                    />
                  )}
                />
              </FormField>
            ) : (
              <FormField
                label={t('jobAnnouncement.form.administrativePosition')}
                required
                error={errors.administrativePositionId?.toString()}
                htmlFor="administrativePositionId"
              >
                <Controller
                  name="administrativePositionId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      id="administrativePositionId"
                      value={field.value || ''}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                      options={adminPositionOptions}
                      placeholder={
                        isLoadingAdministrativePositions
                          ? t('common.loading')
                          : t('jobAnnouncement.form.selectAdministrativePosition')
                      }
                      error={!!errors.administrativePositionId}
                      disabled={isLoadingAdministrativePositions}
                    />
                  )}
                />
              </FormField>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.specialization')}
              required
              error={errors.specializationIds?.toString()}
              htmlFor="specializationIds"
            >
              <Controller
                name="specializationIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="specializationIds"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={subjectOptions}
                    placeholder={
                      isLoadingSubjects
                        ? t('common.loading')
                        : t('jobAnnouncement.form.selectSpecialization')
                    }
                    isMulti
                    error={!!errors.specializationIds}
                    disabled={isLoadingSubjects}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.stage')}
              required
              error={errors.stageIds?.toString()}
              htmlFor="stageIds"
            >
              <Controller
                name="stageIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="stageIds"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={stageOptions}
                    placeholder={
                      isLoadingSchoolStages
                        ? t('common.loading')
                        : t('jobAnnouncement.form.selectStage')
                    }
                    isMulti
                    error={!!errors.stageIds}
                    disabled={isLoadingSchoolStages}
                  />
                )}
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.jobDescriptionAr')}
              optional
              error={errors.jobDescriptionAr?.toString()}
              htmlFor="jobDescriptionAr"
            >
              <Controller
                name="jobDescriptionAr"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id="jobDescriptionAr"
                    {...field}
                    placeholder={t('jobAnnouncement.form.enterJobDescription')}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.jobDescriptionEn')}
              optional
              error={errors.jobDescriptionEn?.toString()}
              htmlFor="jobDescriptionEn"
            >
              <Controller
                name="jobDescriptionEn"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id="jobDescriptionEn"
                    {...field}
                    placeholder={t('jobAnnouncement.form.enterJobDescription')}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.jobResponsibilitiesAr')}
              optional
              error={errors.jobResponsibilitiesAr?.toString()}
              htmlFor="jobResponsibilitiesAr"
            >
              <Controller
                name="jobResponsibilitiesAr"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id="jobResponsibilitiesAr"
                    {...field}
                    placeholder={t('jobAnnouncement.form.describeJobResponsibilities')}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.jobResponsibilitiesEn')}
              optional
              error={errors.jobResponsibilitiesEn?.toString()}
              htmlFor="jobResponsibilitiesEn"
            >
              <Controller
                name="jobResponsibilitiesEn"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id="jobResponsibilitiesEn"
                    {...field}
                    placeholder={t('jobAnnouncement.form.describeJobResponsibilities')}
                  />
                )}
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.applicationStartDate')}
              required
              error={errors.applicationStartDate?.toString()}
              htmlFor="applicationStartDate"
            >
              <Input id="applicationStartDate" type="date" {...register('applicationStartDate')} />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.applicationEndDate')}
              required
              error={errors.applicationEndDate?.toString()}
              htmlFor="applicationEndDate"
            >
              <Input id="applicationEndDate" type="date" {...register('applicationEndDate')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <FormField
              label={t('jobAnnouncement.form.nationality')}
              required
              error={errors.national?.toString()}
              htmlFor="nationalityMode"
            >
              <div className="flex items-center gap-6 p-2">
                {NATIONALITY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name="nationalityMode"
                      value={option.value}
                      checked={nationalityMode === option.value}
                      onChange={() => setValue('nationalityMode', option.value)}
                      className="h-4 w-4 text-green-600"
                    />
                    {t(option.labelKey)}
                  </label>
                ))}
              </div>
            </FormField>

            {nationalityMode === NationalityMode.SPECIFIC && (
              <FormField
                label={t('jobAnnouncement.form.nationalitySpecific')}
                required
                error={errors.nationality?.toString()}
                htmlFor="nationalityMode"
              >
                <Controller
                  name="nationalityIds"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      options={countryOptions}
                      placeholder={
                        isLoadingCountries
                          ? t('common.loading')
                          : t('jobAnnouncement.form.selectNationalities')
                      }
                      isMulti
                      error={!!errors.nationalityIds}
                      disabled={isLoadingCountries}
                    />
                  )}
                />
                {errors.nationalityIds && (
                  <p className="mt-1 text-sm text-red-600">
                    {t(errors.nationalityIds.message as string)}
                  </p>
                )}
              </FormField>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.workStart')}
              required
              error={errors.workStartDate?.toString()}
            >
              <div className="flex items-center gap-6 p-2">
                {WORK_START_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name="workStartMode"
                      value={option.value}
                      checked={workStartMode === option.value}
                      onChange={() => setValue('workStartMode', option.value)}
                      className="h-4 w-4 text-green-600"
                    />
                    {t(option.labelKey)}
                  </label>
                ))}
              </div>
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.workStartDate')}
              required
              error={errors.workStartDate?.toString()}
            >
              <div>
                <Input type="date" {...register('workStartDate')} />
                {errors.workStartDate && (
                  <p className="text-sm text-red-600">
                    {t(errors.workStartDate.message as string)}
                  </p>
                )}
              </div>
            </FormField>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <FormField
              label={t('jobAnnouncement.form.academicQualification')}
              required
              error={errors.qualificationIds?.toString()}
              htmlFor="qualificationIds"
            >
              <Controller
                name="qualificationIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="qualificationIds"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={qualificationOptions}
                    placeholder={
                      isLoadingQualifications
                        ? t('common.loading')
                        : t('jobAnnouncement.form.selectAcademicQualification')
                    }
                    isMulti
                    error={!!errors.qualificationIds}
                    disabled={isLoadingQualifications}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1">
            <FormField label={t('jobAnnouncement.salary')} required htmlFor="salaryOption">
              <div className="flex items-center gap-6 p-2">
                {SALARY_OPTION_RADIOS.map((option) => (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      value={option.value}
                      checked={salaryOption === option.value}
                      onChange={() => setValue('salaryOption', option.value)}
                      className="h-4 w-4 accent-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{t(option.labelKey)}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>
          {salaryOption === SalaryOption.RANGE && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                label={t('jobAnnouncement.form.minimumSalary')}
                required
                error={errors.minimumSalary?.toString()}
                htmlFor="minimumSalary"
              >
                <Input id="minimumSalary" type="number" min={0} {...register('minimumSalary')} />
              </FormField>
              <FormField
                label={t('jobAnnouncement.form.maximumSalary')}
                required
                error={errors.maximumSalary?.toString()}
                htmlFor="maximumSalary"
              >
                <Input id="maximumSalary" type="number" min={0} {...register('maximumSalary')} />
              </FormField>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.teacherGender')}
              required
              error={errors.teacherGender?.toString()}
              htmlFor="teacherGender"
            >
              <Controller
                name="teacherGender"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-4">
                    {TEACHER_GENDER_OPTIONS.map((option) => (
                      <CustomCheckbox
                        key={option.value}
                        label={t(option.labelKey)}
                        checked={field.value === option.value}
                        name="teacherGender"
                        onChange={(checked) => {
                          if (checked) {
                            field.onChange(option.value);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              />
              {errors.teacherGender && (
                <p className="mt-1 text-sm text-red-600">
                  {t(errors.teacherGender.message as string)}
                </p>
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.yearsOfExperience')}
              required
              error={errors.yearsOfExperience?.toString()}
              htmlFor="yearsOfExperience"
            >
              <Input
                id="yearsOfExperience"
                type="number"
                min={0}
                {...register('yearsOfExperience')}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.contractType')}
              required
              error={errors.contractType?.toString()}
              htmlFor="contractType"
            >
              <div className="mt-3 flex flex-wrap gap-4">
                {CONTRACT_TYPE_OPTIONS.map((option) => (
                  <CustomCheckbox
                    key={option.value}
                    label={t(option.labelKey)}
                    checked={contractType?.includes(option.value)}
                    onChange={(checked) => toggleContractType(option.value, checked)}
                  />
                ))}
              </div>
              {errors.contractType && (
                <p className="mt-1 text-sm text-red-600">
                  {t(errors.contractType.message as string)}
                </p>
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.workingHoursFrom')}
              required
              error={errors.workingHoursFrom?.toString()}
              htmlFor="workingHoursFrom"
            >
              <Input id="workingHoursFrom" type="time" {...register('workingHoursFrom')} />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.workingHoursTo')}
              required
              error={errors.workingHoursTo?.toString()}
              htmlFor="workingHoursTo"
            >
              <Input id="workingHoursTo" type="time" {...register('workingHoursTo')} />
            </FormField>
          </div>
        </section>

        <section className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
            <FormField
              label={t('jobAnnouncement.form.technicalSkills')}
              error={errors.technicalSkillIds?.toString()}
              htmlFor="technicalSkillIds"
            >
              <Controller
                name="technicalSkillIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="technicalSkillIds"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={technicalSkillOptions}
                    placeholder={t('jobAnnouncement.form.technicalSkills')}
                    isMulti
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.personalSkills')}
              error={errors.personalSkillIds?.toString()}
              htmlFor="personalSkillIds"
            >
              <Controller
                name="personalSkillIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="personalSkillIds"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={personalSkillOptions}
                    placeholder={t('jobAnnouncement.form.personalSkills')}
                    isMulti
                  />
                )}
              />
            </FormField>
          </div>

          <div>
            <div className="mb-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="text-xl font-bold text-gray-700">
                {t('jobAnnouncement.form.languages')}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => appendLanguage({ languageId: '', levelId: '' })}
                >
                  <CustomImage src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
                </button>
              </div>
            </div>
            <div className="rounded-md border p-4">
              <div className="flex flex-col gap-4">
                {languageFields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <FormField
                      label={t('jobAnnouncement.form.language')}
                      required
                      error={errors.languages?.[index]?.languageId?.toString()}
                    >
                      <Controller
                        name={`languages.${index}.languageId`}
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value}
                            onChange={(value) =>
                              field.onChange(Array.isArray(value) ? value[0] : value)
                            }
                            options={languageOptions}
                            placeholder={
                              isLoadingLanguages
                                ? t('common.loading')
                                : t('jobAnnouncement.form.language')
                            }
                            error={!!errors.languages?.[index]?.languageId}
                            disabled={isLoadingLanguages}
                          />
                        )}
                      />
                    </FormField>

                    <FormField
                      label={t('jobAnnouncement.form.languageLevel')}
                      required
                      error={errors.languages?.[index]?.levelId?.toString()}
                    >
                      <Controller
                        name={`languages.${index}.levelId`}
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value}
                            onChange={(value) =>
                              field.onChange(Array.isArray(value) ? value[0] : value)
                            }
                            options={languageLevelOptions}
                            placeholder={
                              isLoadingLanguageLevels
                                ? t('common.loading')
                                : t('jobAnnouncement.form.languageLevel')
                            }
                            error={!!errors.languages?.[index]?.levelId}
                            disabled={isLoadingLanguageLevels}
                          />
                        )}
                      />
                    </FormField>

                    {languageFields.length > 1 && (
                      <div className="flex items-center justify-end">
                        <IconButton
                          status="delete"
                          ariaLabel={t('jobAnnouncement.form.removeLanguage')}
                          onClick={() => removeLanguage(index)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <div className="mb-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="text-xl font-bold text-gray-700">
                {t('jobAnnouncement.form.jobBenefits')}
              </div>
            </div>
            {isLoadingJobBenefits ? (
              <p className="text-sm text-gray-500">{t('common.loading')}</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {benefitOptions.map((benefit) => (
                  <CustomCheckbox
                    key={benefit.value}
                    label={benefit.label}
                    checked={selectedBenefits?.includes(benefit.value)}
                    onChange={(checked) => toggleBenefit(benefit.value, checked)}
                    className="p-2"
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isCreating}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isCreating}>
            {isCreating ? t('common.saving') : t('common.add')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
