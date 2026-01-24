import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { InferType } from 'yup';
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
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import {
  createJobAdvertisment,
  editJobAdvertisment,
  fetchJobAdvertismentById,
} from '@/redux/features/job-advertisments/jobAdvertismentsSlice';
import {
  JobAdvertismentWorkShedule,
  type CreateJobAdvertismentRequest,
} from '@/services/api/types/job-advertisment.types';
import {
  AddJobAnnouncementSchema,
  ContractType,
  JobCategory,
  NationalityMode,
  SalaryOption,
  WorkStartMode,
  type ContractTypeValue,
} from '@/validations/job-announcements-validations';
import CustomImage from '@/shared/components/CustomImage';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
import { USE_MOCK_DATA, getMockJobAdvertismentById } from '../mock';
import { PopupMessage } from '@/shared/popups/popups';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

const TEACHER_GENDER_OPTIONS = [
  { value: 'MALE', labelKey: 'jobAnnouncement.form.genderMale' },
  { value: 'FEMALE', labelKey: 'jobAnnouncement.form.genderFemale' },
  { value: 'ANY', labelKey: 'jobAnnouncement.form.genderAny' },
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

type AddJobAnnouncementFormValues = InferType<typeof AddJobAnnouncementSchema>;

const DEFAULT_VALUES: AddJobAnnouncementFormValues = {
  qualificationType: JobCategory.TEACHER,
  name: '',
  nameEn: '',
  teacherLevelId: '',
  administrativePositionId: '',
  specializationIds: '',
  stageIds: '',
  subjectName: [],
  educationalStage: [],
  jobDescriptionAr: '',
  jobDescriptionEn: '',
  jobResponsibilitiesAr: '',
  jobResponsibilitiesEn: '',
  applicationStartDate: '',
  applicationEndDate: '',
  nationalityMode: NationalityMode.ALL,
  nationalityIds: [],
  noticePeriod: WorkStartMode.IMMEDIATE,
  noticePeriodDate: '',
  qualificationIds: [],
  yearsExperience: 0,
  workStartTime: '',
  workEndTime: '',
  salary: SalaryOption.TBD,
  minimumSalary: 0,
  maximumSalary: undefined,
  teacherGender: 'ANY',
  contractType: ContractType.FULL_TIME as ContractTypeValue,
  technicalSkillIds: '',
  personalSkillIds: '',
  benefitsIds: [],
  languages: [{ languageId: '', levelId: '' }],
};

const isEmptyValue = (value: unknown): boolean => {
  if (value === '' || value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (value instanceof Date) {
    return false;
  }

  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }

  return false;
};

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const sanitizedArray = value
      .map((item) => sanitizeValue(item))
      .filter((item) => !isEmptyValue(item));
    return sanitizedArray.length ? sanitizedArray : undefined;
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const sanitizedObject = Object.entries(value as Record<string, unknown>).reduce<
      Record<string, unknown>
    >((acc, [key, val]) => {
      const sanitizedChild = sanitizeValue(val);
      if (!isEmptyValue(sanitizedChild)) {
        acc[key] = sanitizedChild;
      }
      return acc;
    }, {});

    return isEmptyValue(sanitizedObject) ? undefined : sanitizedObject;
  }

  return value;
};

const sanitizePayload = <T,>(payload: T): T => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const sanitizedEntries = Object.entries(payload as Record<string, unknown>).reduce<
    Record<string, unknown>
  >((acc, [key, value]) => {
    const sanitizedValue = sanitizeValue(value);
    if (!isEmptyValue(sanitizedValue)) {
      acc[key] = sanitizedValue;
    }
    return acc;
  }, {});

  return sanitizedEntries as T;
};

const extractListFromInput = (value?: string | null): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const mapContractTypeToWorkSchedule = (type?: ContractTypeValue): JobAdvertismentWorkShedule => {
  switch (type) {
    case ContractType.PART_TIME:
      return JobAdvertismentWorkShedule.PART_TIME;
    case ContractType.BOTH:
      return JobAdvertismentWorkShedule.BOTH;
    case ContractType.FULL_TIME:
    default:
      return JobAdvertismentWorkShedule.FULL_TIME;
  }
};

interface AddJobAnnouncementFormProps {
  jobId?: string;
}

type SkillFieldName = 'technicalSkillIds' | 'personalSkillIds';
type SkillType = 'technical' | 'personal';

export default function AddJobAnnouncementForm({ jobId }: AddJobAnnouncementFormProps) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const DummySchoolBranchId = '471D89C1-61A8-4B13-D682-08DE1657ABAD';
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

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
  const { educationalStages: grades, isLoading: isLoadingEducationalStages } = useAppSelector(
    (state) => state.educationalStages
  );
  const { subjects, isLoading: isLoadingSubjects } = useAppSelector((state) => state.subjects);
  const { isCreating, currentJobAdvertisment } = useAppSelector((state) => state.jobAdvertisments);

  const isEditMode = Boolean(jobId);
  const [isFormReady, setIsFormReady] = useState(!isEditMode);
  const [isFullTimeChecked, setIsFullTimeChecked] = useState(false);
  const [isPartTimeChecked, setIsPartTimeChecked] = useState(false);
  const [technicalSkillInput, setTechnicalSkillInput] = useState('');
  const [personalSkillInput, setPersonalSkillInput] = useState('');

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddJobAnnouncementFormValues>({
    resolver: yupResolver(AddJobAnnouncementSchema) as any,
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

  const jobCategory = watch('qualificationType');
  const nationalityMode = watch('nationalityMode');
  const noticePeriod = watch('noticePeriod');
  const salaryOption = watch('salary');
  const contractType = watch('contractType');
  const selectedBenefits = watch('benefitsIds');
  const technicalSkillsValue = watch('technicalSkillIds') || '';
  const personalSkillsValue = watch('personalSkillIds') || '';
  const isTeacherCategory = jobCategory === JobCategory.TEACHER;

  const technicalSkillsList = useMemo(
    () => extractListFromInput(technicalSkillsValue),
    [technicalSkillsValue]
  );
  const personalSkillsList = useMemo(
    () => extractListFromInput(personalSkillsValue),
    [personalSkillsValue]
  );
  const canAddTechnicalSkill = Boolean(technicalSkillInput.trim());
  const canAddPersonalSkill = Boolean(personalSkillInput.trim());

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchSchoolStages());
    dispatch(fetchQualifications());
    dispatch(fetchLanguages());
    dispatch(fetchLanguageLevels());
    dispatch(fetchJobBenefits());
    dispatch(fetchSubjects({ page: 1, limit: 10000 }));
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000 }));
  }, [dispatch]);

  // Helper function to populate form with job data
  const populateFormWithJobData = (job: typeof currentJobAdvertisment) => {
    if (!job) return;

    // Determine job category based on which position field is set
    const isTeacher = Boolean(job.lkTeacherLevelId);

    // Map work schedule to work start mode
    const workMode = job.noticePeriod === 1 ? WorkStartMode.IMMEDIATE : WorkStartMode.SCHEDULED;

    // Map nationality
    const natMode = job.nationality === 1 ? NationalityMode.ALL : NationalityMode.SPECIFIC;

    // Map salary option
    const salOption = job.salary === 1 ? SalaryOption.RANGE : SalaryOption.TBD;

    // Map gender
    const gender = job.teacherGender === 1 ? 'MALE' : job.teacherGender === 2 ? 'FEMALE' : 'ANY';

    const workSchedule =
      job.workShedule === JobAdvertismentWorkShedule.PART_TIME
        ? ContractType.PART_TIME
        : job.workShedule === JobAdvertismentWorkShedule.BOTH
          ? ContractType.BOTH
          : ContractType.FULL_TIME;

    const subjectIds =
      job.jobAdvertismentMaterialDto
        ?.map((material) => material.materialId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0) ?? [];
    const primarySubjectId = job.materialId || subjectIds[0] || '';
    if (primarySubjectId && !subjectIds.includes(primarySubjectId)) {
      subjectIds.unshift(primarySubjectId);
    }

    const stageIdsList =
      job.jobAdvertisementSchoolStageDto
        ?.map((stage) => stage.lkSchoolStageId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0) ?? [];
    const primaryStageId = stageIdsList[0] || '';

    const nationalityIds =
      job.jobAdvertisementCountryDto
        ?.map((country) => country.lkCountryId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0) ?? [];

    const qualificationIds =
      job.jobAdvertisementQualificationDto
        ?.map((qualification) => qualification.lkQualificationId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0) ?? [];

    const technicalSkillsText =
      job.jobAdvertismentTechnicalSkillsDto
        ?.map((skill) => skill.technicalAppName?.trim())
        .filter((name): name is string => Boolean(name))
        .join('\n') || '';

    const personalSkillsText =
      job.jobAdvertismentPersonalSkillsDto
        ?.map((skill) => skill.personalSkillName?.trim())
        .filter((name): name is string => Boolean(name))
        .join('\n') || '';

    const benefitIds =
      job.jobAdvertisementJobBenefitDto
        ?.map((benefit) => benefit.lkJobBenefitId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0) ?? [];

    const languagesList =
      job.jobAdvertisementLanguageDto
        ?.map((language) => ({
          languageId: language.lkLanguageId,
          levelId: language.lkLanguageLevelId,
        }))
        .filter(
          (language): language is { languageId: string; levelId: string } =>
            Boolean(language.languageId) && Boolean(language.levelId)
        ) ?? [];

    setValue('contractType', workSchedule);

    // Set form values
    setValue('qualificationType', isTeacher ? JobCategory.TEACHER : JobCategory.ADMIN);
    setValue('name', job.name || '');
    setValue('nameEn', job.nameEn || '');
    setValue('teacherLevelId', job.lkTeacherLevelId ?? '');
    setValue('administrativePositionId', job.lkAdministrativePositionId ?? '');
    setValue('specializationIds', primarySubjectId);
    setValue('subjectName', subjectIds);
    setValue('stageIds', primaryStageId);
    setValue('educationalStage', stageIdsList);
    setValue('jobDescriptionAr', job.jobDescription || '');
    setValue('jobDescriptionEn', job.jobDescriptionEn || '');
    setValue('jobResponsibilitiesAr', job.jobResponsibilities || '');
    setValue('jobResponsibilitiesEn', job.jobResponsibilitiesEn || '');
    setValue('applicationStartDate', job.advertisementStartDate?.split('T')[0] || '');
    setValue('applicationEndDate', job.advertisementEndDate?.split('T')[0] || '');
    setValue('nationalityMode', natMode);
    setValue('nationalityIds', natMode === NationalityMode.SPECIFIC ? nationalityIds : []);
    setValue('noticePeriod', workMode);
    setValue('noticePeriodDate', job.noticePeriodDate ? job.noticePeriodDate.split('T')[0] : '');
    setValue('qualificationIds', qualificationIds);
    setValue('yearsExperience', job.yearsExperience ?? 0);
    setValue('workStartTime', job.workStartTime ?? '');
    setValue('workEndTime', job.workEndTime ?? '');
    setValue('salary', salOption);
    setValue('minimumSalary', job.minimumSalary ?? 0);
    setValue('maximumSalary', job.maximumSalary ?? undefined);
    setValue('teacherGender', gender);
    setValue('technicalSkillIds', technicalSkillsText);
    setValue('personalSkillIds', personalSkillsText);
    setValue('benefitsIds', benefitIds);
    setValue('languages', languagesList.length ? languagesList : [{ languageId: '', levelId: '' }]);

    setIsFormReady(true);
  };

  // Fetch job data when in edit mode
  useEffect(() => {
    if (isEditMode && jobId && !isFormReady) {
      if (USE_MOCK_DATA) {
        // Use mock data directly - no API call
        const mockJob = getMockJobAdvertismentById(jobId);
        if (mockJob) {
          populateFormWithJobData(mockJob);
        }
      } else {
        dispatch(fetchJobAdvertismentById(jobId));
      }
    }
  }, [dispatch, isEditMode, jobId, isFormReady]);

  // Populate form with existing job data when editing (for API response)
  useEffect(() => {
    if (isEditMode && currentJobAdvertisment && !isFormReady && !USE_MOCK_DATA) {
      populateFormWithJobData(currentJobAdvertisment);
    }
  }, [isEditMode, currentJobAdvertisment, isFormReady]);

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
    if (noticePeriod === WorkStartMode.IMMEDIATE) {
      setValue('noticePeriodDate', '');
    }
  }, [noticePeriod, setValue]);

  useEffect(() => {
    if (salaryOption === SalaryOption.TBD) {
      setValue('minimumSalary', 0);
      setValue('maximumSalary', undefined);
    }
  }, [salaryOption, setValue]);

  useEffect(() => {
    // Sync checkbox state with contractType value
    if (contractType === ContractType.FULL_TIME) {
      setIsFullTimeChecked(true);
      setIsPartTimeChecked(false);
    } else if (contractType === ContractType.PART_TIME) {
      setIsFullTimeChecked(false);
      setIsPartTimeChecked(true);
    } else if (contractType === ContractType.BOTH) {
      setIsFullTimeChecked(true);
      setIsPartTimeChecked(true);
    }
  }, [contractType]);

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

  const educationalStageOptions = useMemo(() => {
    if (!Array.isArray(grades)) return [];
    return grades.map((grade) => ({
      value: grade.id,
      label: currentLang === 'ar' ? grade.nameAr : grade.nameEn || grade.nameAr,
    }));
  }, [grades, currentLang]);

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

  const handleContractTypeChange = (type: 'FULL_TIME' | 'PART_TIME', checked: boolean) => {
    if (type === 'FULL_TIME') {
      setIsFullTimeChecked(checked);
      if (checked && isPartTimeChecked) {
        setValue('contractType', ContractType.BOTH);
      } else if (checked) {
        setValue('contractType', ContractType.FULL_TIME);
      } else if (isPartTimeChecked) {
        setValue('contractType', ContractType.PART_TIME);
      }
    } else {
      setIsPartTimeChecked(checked);
      if (checked && isFullTimeChecked) {
        setValue('contractType', ContractType.BOTH);
      } else if (checked) {
        setValue('contractType', ContractType.PART_TIME);
      } else if (isFullTimeChecked) {
        setValue('contractType', ContractType.FULL_TIME);
      }
    }
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

  const updateSkillsField = (field: SkillFieldName, items: string[]) => {
    setValue(field, items.length ? items.join('\n') : '', {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleSkillAdd = (type: SkillType) => {
    const inputValue =
      type === 'technical' ? technicalSkillInput.trim() : personalSkillInput.trim();

    if (!inputValue) {
      return;
    }

    const currentList = type === 'technical' ? technicalSkillsList : personalSkillsList;
    const field: SkillFieldName = type === 'technical' ? 'technicalSkillIds' : 'personalSkillIds';

    updateSkillsField(field, [...currentList, inputValue]);

    if (type === 'technical') {
      setTechnicalSkillInput('');
    } else {
      setPersonalSkillInput('');
    }
  };

  const handleSkillRemove = (type: SkillType, index: number) => {
    const currentList = type === 'technical' ? technicalSkillsList : personalSkillsList;

    if (index < 0 || index >= currentList.length) {
      return;
    }

    const updatedList = currentList.filter((_, skillIndex) => skillIndex !== index);
    const field: SkillFieldName = type === 'technical' ? 'technicalSkillIds' : 'personalSkillIds';

    updateSkillsField(field, updatedList);
  };

  const onSubmit = async (values: AddJobAnnouncementFormValues) => {
    const selectedSpecializationId = values.specializationIds || '';
    const selectedStageId = values.stageIds || '';
    const specializationList = selectedSpecializationId ? [selectedSpecializationId] : [];
    const stageList = selectedStageId ? [selectedStageId] : [];
    const primarySubjectId = selectedSpecializationId;
    const qualificationTypeNumber = Number(
      values.qualificationType === JobCategory.TEACHER ? 2 : 1
    );
    const nationalityValue = values.nationalityMode === NationalityMode.ALL ? 1 : 2;
    const technicalSkills = extractListFromInput(values.technicalSkillIds);
    const personalSkills = extractListFromInput(values.personalSkillIds);

    const salaryMin = Number(values.minimumSalary || 0);
    const salaryMax =
      typeof values.maximumSalary === 'number' && !Number.isNaN(values.maximumSalary)
        ? values.maximumSalary
        : undefined;

    const rawPayload: CreateJobAdvertismentRequest = {
      name: values.name,
      nameEn: values.nameEn,
      schoolBranchId: DummySchoolBranchId, // Temporary static value for school branch ID
      qualificationType: qualificationTypeNumber,
      materialId: primarySubjectId,
      jobDescription: values.jobDescriptionAr,
      jobDescriptionEn: values.jobDescriptionEn,
      jobResponsibilities: values.jobResponsibilitiesAr,
      jobResponsibilitiesEn: values.jobResponsibilitiesEn,
      advertisementStartDate: values.applicationStartDate,
      advertisementEndDate: values.applicationEndDate,
      nationality: nationalityValue,
      salary: values.salary === SalaryOption.RANGE ? 2 : 1,
      minimumSalary: values.salary === SalaryOption.RANGE ? salaryMin : 0,
      maximumSalary: values.salary === SalaryOption.RANGE ? salaryMax : undefined,
      teacherGender:
        values.teacherGender === 'MALE' ? 1 : values.teacherGender === 'FEMALE' ? 2 : 3,
      yearsExperience: Number(values.yearsExperience || 0),
      noticePeriod: values.noticePeriod === WorkStartMode.IMMEDIATE ? 1 : 2,
      noticePeriodDate: values.noticePeriodDate || '',
      workShedule: mapContractTypeToWorkSchedule(values.contractType),
      workStartTime: values.workStartTime,
      workEndTime: values.workEndTime,
      lkAdministrativePositionId: values.administrativePositionId || '',
      lkTeacherLevelId: values.teacherLevelId || '',
      jobAdvertismentTechnicalSkillsDto: technicalSkills.map((skill) => ({
        technicalAppName: skill,
      })),
      jobAdvertismentPersonalSkillsDto: personalSkills.map((skill) => ({
        personalSkillName: skill,
      })),
      jobAdvertismentMaterialDto: specializationList.map((subjectId) => ({
        materialId: subjectId,
      })),
      jobAdvertisementCountryDto:
        values.nationalityMode === NationalityMode.ALL
          ? []
          : (values.nationalityIds ?? []).map((countryId) => ({ lkCountryId: countryId })),
      jobAdvertisementQualificationDto: values.qualificationIds.map((qualificationId) => ({
        lkQualificationId: qualificationId,
      })),
      jobAdvertisementSchoolStageDto: stageList.map((stageId) => ({
        lkSchoolStageId: stageId,
      })),
      jobAdvertisementLanguageDto: values.languages
        .filter((language) => language.languageId && language.levelId)
        .map((language) => ({
          lkLanguageId: language.languageId,
          lkLanguageLevelId: language.levelId,
        })),
      jobAdvertisementJobBenefitDto: (values.benefitsIds ?? [])
        .filter((benefitId): benefitId is string => Boolean(benefitId))
        .map((benefitId) => ({
          lkJobBenefitId: benefitId,
        })),
    };

    const payload = sanitizePayload(rawPayload);

    try {
      if (isEditMode && jobId) {
        // Edit mode - call editJobAdvertisment
        await dispatch(editJobAdvertisment({ id: jobId, data: payload }))
          .unwrap()
          .then((res) => {
            if (res.isSuccess) {
              setShowPopupMessage({
                show: true,
                type: 'success',
                message: t('jobAnnouncement.form.editSuccessMessage'),
              });
              navigate('/job-announcements');
            } else {
              setShowPopupMessage({
                show: true,
                type: 'error',
                message: t('common.errorOccurred'),
              });
            }
          });
      } else {
        // Add mode - call createJobAdvertisment
        await dispatch(createJobAdvertisment(payload))
          .unwrap()
          .then((res) => {
            if (res.isSuccess) {
              setShowPopupMessage({
                show: true,
                type: 'success',
                message: t('jobAnnouncement.form.successMessage'),
              });
              navigate('/job-announcements');
            } else {
              setShowPopupMessage({
                show: true,
                type: 'error',
                message: t('common.errorOccurred'),
              });
            }
          });
      }
    } catch {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: t('common.errorOccurred'),
      });
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
                    onChange={() => setValue('qualificationType', JobCategory.ADMIN)}
                    className="h-4 w-4"
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
                    onChange={() => setValue('qualificationType', JobCategory.TEACHER)}
                    className="h-4 w-4"
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
                error={errors.teacherLevelId?.message as string | undefined}
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
                error={errors.administrativePositionId?.message as string | undefined}
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
              required={isTeacherCategory}
              error={errors.specializationIds?.message as string | undefined}
              htmlFor="specializationIds"
            >
              <Controller
                name="specializationIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="specializationIds"
                    value={field.value || ''}
                    onChange={(value) =>
                      field.onChange(Array.isArray(value) ? (value[0] ?? '') : value)
                    }
                    options={subjectOptions}
                    placeholder={
                      isLoadingSubjects
                        ? t('common.loading')
                        : t('jobAnnouncement.form.selectSpecialization')
                    }
                    error={!!errors.specializationIds}
                    disabled={isLoadingSubjects}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.stage')}
              required={isTeacherCategory}
              error={errors.stageIds?.message as string | undefined}
              htmlFor="stageIds"
            >
              <Controller
                name="stageIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="stageIds"
                    value={field.value || ''}
                    onChange={(value) =>
                      field.onChange(Array.isArray(value) ? (value[0] ?? '') : value)
                    }
                    options={stageOptions}
                    placeholder={
                      isLoadingSchoolStages
                        ? t('common.loading')
                        : t('jobAnnouncement.form.selectStage')
                    }
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
              label={t('jobAnnouncement.form.jobNameAr')}
              required
              error={errors.name?.message as string | undefined}
              htmlFor="jobNameAr"
            >
              <Input
                id="jobNameAr"
                {...register('name')}
                placeholder={t('jobAnnouncement.form.enterJobNameAr')}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.jobNameEn')}
              required
              error={errors.nameEn?.message as string | undefined}
              htmlFor="jobNameEn"
            >
              <Input
                id="jobNameEn"
                {...register('nameEn')}
                placeholder={t('jobAnnouncement.form.enterJobNameEn')}
              />
            </FormField>
          </div>
        </section>
        <section className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.jobDescriptionAr')}
              optional
              error={errors.jobDescriptionAr?.message as string | undefined}
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
              error={errors.jobDescriptionEn?.message as string | undefined}
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
              error={errors.jobResponsibilitiesAr?.message as string | undefined}
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
              error={errors.jobResponsibilitiesEn?.message as string | undefined}
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
              error={errors.applicationStartDate?.message as string | undefined}
              htmlFor="applicationStartDate"
            >
              <Input id="applicationStartDate" type="date" {...register('applicationStartDate')} />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.applicationEndDate')}
              required
              error={errors.applicationEndDate?.message as string | undefined}
              htmlFor="applicationEndDate"
            >
              <Input id="applicationEndDate" type="date" {...register('applicationEndDate')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <FormField
              label={t('jobAnnouncement.form.nationality')}
              required
              error={errors.nationalityMode?.message as string | undefined}
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
                error={errors.nationalityIds?.message as string | undefined}
                htmlFor="nationalityMode"
              >
                <Controller
                  name="nationalityIds"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value || []}
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
              </FormField>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.workStart')}
              required
              error={errors.noticePeriod?.message as string | undefined}
            >
              <div className="flex items-center gap-6 p-2">
                {WORK_START_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name="noticePeriod"
                      value={option.value}
                      checked={noticePeriod === option.value}
                      onChange={() => setValue('noticePeriod', option.value)}
                      className="h-4 w-4 text-green-600"
                    />
                    {t(option.labelKey)}
                  </label>
                ))}
              </div>
            </FormField>
            {noticePeriod === WorkStartMode.SCHEDULED && (
              <FormField
                label={t('jobAnnouncement.form.workStartDate')}
                required
                error={errors.noticePeriodDate?.message as string | undefined}
              >
                <div>
                  <Input type="date" {...register('noticePeriodDate')} />
                </div>
              </FormField>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <FormField
              label={t('jobAnnouncement.form.subjectName')}
              required={isTeacherCategory}
              error={errors.subjectName?.message as string | undefined}
              htmlFor="subjectName"
            >
              <Controller
                name="subjectName"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="subjectName"
                    value={field.value ?? ''}
                    onChange={(value) => field.onChange(value)}
                    options={subjectOptions}
                    placeholder={
                      isLoadingSubjects
                        ? t('common.loading')
                        : t('jobAnnouncement.form.selectSubjectName')
                    }
                    isMulti
                    error={!!errors.subjectName}
                    disabled={isLoadingSubjects}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.educationalStage')}
              required={isTeacherCategory}
              error={errors.educationalStage?.message as string | undefined}
              htmlFor="educationalStage"
            >
              <Controller
                name="educationalStage"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="educationalStage"
                    value={field.value ?? ''}
                    onChange={(value) => field.onChange(value)}
                    options={educationalStageOptions}
                    placeholder={
                      isLoadingEducationalStages
                        ? t('common.loading')
                        : t('jobAnnouncement.form.selectEducationalStage')
                    }
                    isMulti
                    error={!!errors.educationalStage}
                    disabled={isLoadingEducationalStages}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.academicQualification')}
              required
              error={errors.qualificationIds?.message as string | undefined}
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
                      onChange={() => setValue('salary', option.value)}
                      className="h-4 w-4"
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
                error={errors.minimumSalary?.message as string | undefined}
                htmlFor="minimumSalary"
              >
                <Input id="minimumSalary" type="number" min={0} {...register('minimumSalary')} />
              </FormField>
              <FormField
                label={t('jobAnnouncement.form.maximumSalary')}
                optional
                error={errors.maximumSalary?.message as string | undefined}
                htmlFor="maximumSalary"
              >
                <Input
                  id="maximumSalary"
                  type="number"
                  min={0}
                  {...register('maximumSalary', {
                    setValueAs: (value) =>
                      value === '' || value === null ? undefined : Number(value),
                  })}
                />
              </FormField>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.teacherGender')}
              required
              error={errors.teacherGender?.message as string | undefined}
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
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.yearsOfExperience')}
              required
              error={errors.yearsExperience?.message as string | undefined}
              htmlFor="yearsOfExperience"
            >
              <Input
                id="yearsOfExperience"
                type="number"
                min={0}
                {...register('yearsExperience')}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.contractType')}
              required
              error={errors.contractType?.message as string | undefined}
              htmlFor="contractType"
            >
              <div className="mt-3 flex flex-wrap gap-4">
                <CustomCheckbox
                  label={t('jobAnnouncement.form.contractFullTime')}
                  checked={isFullTimeChecked}
                  onChange={(checked) => handleContractTypeChange('FULL_TIME', checked)}
                />
                <CustomCheckbox
                  label={t('jobAnnouncement.form.contractPartTime')}
                  checked={isPartTimeChecked}
                  onChange={(checked) => handleContractTypeChange('PART_TIME', checked)}
                />
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={t('jobAnnouncement.form.workingHoursFrom')}
              required
              error={errors.workStartTime?.message as string | undefined}
              htmlFor="workStartTime"
            >
              <Input id="workStartTime" type="time" {...register('workStartTime')} />
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.workingHoursTo')}
              required
              error={errors.workEndTime?.message as string | undefined}
              htmlFor="workEndTime"
            >
              <Input id="workEndTime" type="time" {...register('workEndTime')} />
            </FormField>
          </div>
        </section>

        <section className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-1">
            <FormField
              label={t('jobAnnouncement.form.technicalSkills')}
              error={errors.technicalSkillIds?.message as string | undefined}
              htmlFor="technicalSkillInput"
              required
            >
              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    id="technicalSkillInput"
                    value={technicalSkillInput}
                    onChange={(event) => setTechnicalSkillInput(event.target.value)}
                    placeholder={t('jobAnnouncement.form.technicalSkills')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSkillAdd('technical');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSkillAdd('technical')}
                    disabled={!canAddTechnicalSkill}
                    aria-label={`${t('common.add')} ${t('jobAnnouncement.form.technicalSkills')}`}
                  >
                    <CustomImage
                      src={GreenPlusCircleIcon}
                      alt={t('common.add')}
                      className={`${technicalSkillInput ? '' : 'opacity-50'} h-5 w-5`}
                    />
                  </button>
                </div>
                <Controller
                  name="technicalSkillIds"
                  control={control}
                  render={({ field }) => (
                    <input type="hidden" {...field} value={field.value ?? ''} />
                  )}
                />
                {technicalSkillsList.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {technicalSkillsList.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-800"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          className="flex h-[20px] w-[20px] items-center justify-center rounded-full text-xs font-semibold text-gray-500 transition hover:bg-red-100 hover:text-red-600 focus:outline-none"
                          onClick={() => handleSkillRemove('technical', index)}
                          aria-label={`${t('actions.delete')} ${skill}`}
                        >
                          X
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            <FormField
              label={t('jobAnnouncement.form.personalSkills')}
              error={errors.personalSkillIds?.message as string | undefined}
              htmlFor="personalSkillInput"
              required
            >
              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    id="personalSkillInput"
                    value={personalSkillInput}
                    onChange={(event) => setPersonalSkillInput(event.target.value)}
                    placeholder={t('jobAnnouncement.form.personalSkills')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSkillAdd('personal');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSkillAdd('personal')}
                    disabled={!canAddPersonalSkill}
                    aria-label={`${t('common.add')} ${t('jobAnnouncement.form.personalSkills')}`}
                  >
                    <CustomImage
                      src={GreenPlusCircleIcon}
                      alt={t('common.add')}
                      className={`${personalSkillInput ? '' : 'opacity-50'} h-5 w-5`}
                    />
                  </button>
                </div>
                <Controller
                  name="personalSkillIds"
                  control={control}
                  render={({ field }) => (
                    <input type="hidden" {...field} value={field.value ?? ''} />
                  )}
                />
                {personalSkillsList.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {personalSkillsList.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          className="flex h-[20px] w-[20px] items-center justify-center rounded-full text-xs font-semibold text-gray-500 transition hover:bg-red-100 hover:text-red-600 focus:outline-none"
                          onClick={() => handleSkillRemove('personal', index)}
                          aria-label={`${t('actions.delete')} ${skill}`}
                        >
                          X
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
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
                      error={errors.languages?.[index]?.languageId?.message as string | undefined}
                    >
                      <Controller
                        name={`languages.${index}.languageId`}
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value ?? ''}
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
                      error={errors.languages?.[index]?.levelId?.message as string | undefined}
                    >
                      <Controller
                        name={`languages.${index}.levelId`}
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value ?? ''}
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
                    checked={selectedBenefits?.includes(benefit.value) || false}
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
          {!isEditMode ? (
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? t('common.saving') : t('common.add')}
            </Button>
          ) : (
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? t('common.saving') : t('common.saveChanges')}
            </Button>
          )}
        </div>
      </form>

      {/* Popup Message */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
        navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
      />
    </Card>
  );
}
