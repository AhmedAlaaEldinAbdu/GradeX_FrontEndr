import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import { InterviewFormSchema, type InterviewFormProps } from '@/validations/interviews-validations';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSchools } from '@/redux/features/schools/schoolsSlice';
import {
  fetchJobAdvertisments,
  fetchJobAdvertismentById,
} from '@/redux/features/job-advertisments/jobAdvertismentsSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';
import { InterviewType } from '@/services/api/types/interviews.types';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';

interface ScheduleInterviewPopupProps {
  open: boolean;
  applicantName?: string;
  jobAdvertisementId?: string;
  applicantTeacherId?: string;
  onClose: () => void;
  onSubmit: (data: InterviewFormProps) => Promise<void>;
  isLoading?: boolean;
}

const INTERVIEW_FORM_DEFAULTS: InterviewFormProps = {
  schoolBranchesId: '',
  jobAdvertisementId: '',
  teacherId: '',
  supervisorId: '',
  interviewDate: '',
  startTime: '',
  endTime: '',
  interViewType: InterviewType.ONLINE,
};

const INTERVIEW_TYPE_OPTIONS = [
  { value: InterviewType.ONLINE, labelKey: 'jobAnnouncement.applicantsPage.interviewTypeOnline' },
  { value: InterviewType.OFFLINE, labelKey: 'jobAnnouncement.applicantsPage.interviewTypeOffline' },
];

export default function ScheduleInterviewPopup({
  open,
  jobAdvertisementId,
  applicantTeacherId,
  onClose,
  onSubmit,
  isLoading = false,
}: ScheduleInterviewPopupProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';

  const {
    schools: schoolsList,
    isInitialized: isSchoolsInitialized,
    isLoading: isSchoolsLoading,
  } = useAppSelector((state) => state.schools);

  const { jobAdvertisments, currentJobAdvertisment } = useAppSelector(
    (state) => state.jobAdvertisments
  );

  const { teachers } = useAppSelector((state) => state.teachers);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InterviewFormProps>({
    resolver: yupResolver(InterviewFormSchema),
    defaultValues: INTERVIEW_FORM_DEFAULTS,
  });

  const scrollToFirstError = useScrollToFirstError<InterviewFormProps>();

  const selectedBranchId = watch('schoolBranchesId');
  const selectedJobAdValue = watch('jobAdvertisementId');
  const selectedTeacherValue = watch('teacherId');

  const selectedJobAdvertisement = useMemo(() => {
    if (!jobAdvertisementId) return null;
    return (
      jobAdvertisments.find((ad) => ad.id === jobAdvertisementId) ||
      (currentJobAdvertisment?.id === jobAdvertisementId ? currentJobAdvertisment : null)
    );
  }, [jobAdvertisementId, jobAdvertisments, currentJobAdvertisment]);

  const interviewTypeOptions = useMemo(
    () =>
      INTERVIEW_TYPE_OPTIONS.map((option) => ({
        value: String(option.value),
        label: t(option.labelKey),
      })),
    [t]
  );

  const schoolBranchOptions: CustomSelectOption[] = useMemo(() => {
    if (!schoolsList.length) {
      return [];
    }

    return schoolsList.flatMap((school) => {
      const schoolName = currentLang === 'ar' ? school.nameAr : school.nameEn || school.nameAr;
      return (school.schoolBranches ?? []).map((branch) => {
        const branchSegments = [branch.city, branch.neighborhood, branch.address]
          .filter(Boolean)
          .join(' - ');

        return {
          value: branch.id,
          label: [schoolName, branchSegments].filter(Boolean).join(' | '),
        };
      });
    });
  }, [schoolsList, currentLang]);

  const jobAdvertisementOptions: CustomSelectOption[] = useMemo(() => {
    if (!jobAdvertisments.length) {
      return [];
    }

    return jobAdvertisments.map((advert) => ({
      value: advert.id,
      label: currentLang === 'ar' ? advert.name : advert.nameEn || advert.name,
    }));
  }, [jobAdvertisments, currentLang]);

  const teacherOptions: CustomSelectOption[] = useMemo(() => {
    if (!teachers.length) {
      return [];
    }

    return teachers.map((teacher) => ({
      value: teacher.id,
      label: teacher.fullName,
    }));
  }, [teachers]);

  const supervisorOptions = teacherOptions;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!isSchoolsInitialized && !isSchoolsLoading) {
      dispatch(fetchSchools({ limit: 10000 }));
    }
  }, [dispatch, isSchoolsInitialized, isSchoolsLoading, open]);

  useEffect(() => {
    if (!open || !jobAdvertisementId) {
      return;
    }

    if (!selectedJobAdvertisement) {
      dispatch(fetchJobAdvertismentById(jobAdvertisementId));
    }
  }, [dispatch, jobAdvertisementId, open, selectedJobAdvertisement]);

  useEffect(() => {
    if (!open || !selectedBranchId) {
      return;
    }

    dispatch(
      fetchJobAdvertisments({
        filters: { schoolBranchId: selectedBranchId },
        limit: 10000,
      })
    );

    dispatch(
      fetchTeachers({
        filters: { schoolBranchId: selectedBranchId },
        limit: 10000,
      })
    );
  }, [dispatch, open, selectedBranchId]);

  useEffect(() => {
    if (open) {
      reset({
        ...INTERVIEW_FORM_DEFAULTS,
        jobAdvertisementId: jobAdvertisementId ?? '',
      });
    } else {
      reset(INTERVIEW_FORM_DEFAULTS);
    }
  }, [open, jobAdvertisementId, reset]);

  useEffect(() => {
    if (!open || !selectedJobAdvertisement?.schoolBranchId) {
      return;
    }

    if (!selectedBranchId) {
      setValue('schoolBranchesId', selectedJobAdvertisement.schoolBranchId, { shouldDirty: false });
    }
  }, [open, selectedBranchId, selectedJobAdvertisement, setValue]);

  useEffect(() => {
    if (!open || !jobAdvertisementId) {
      return;
    }

    if (!selectedJobAdValue) {
      setValue('jobAdvertisementId', jobAdvertisementId, { shouldDirty: false });
    }
  }, [jobAdvertisementId, open, selectedJobAdValue, setValue]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (applicantTeacherId) {
      setValue('teacherId', applicantTeacherId, { shouldDirty: false });
      return;
    }

    if (!selectedTeacherValue) {
      setValue('teacherId', '', { shouldDirty: false });
    }
  }, [applicantTeacherId, open, selectedTeacherValue, setValue]);

  const handleClose = () => {
    if (isLoading) {
      return;
    }
    reset(INTERVIEW_FORM_DEFAULTS);
    onClose();
  };

  const handleFormSubmit = async (values: InterviewFormProps) => {
    await onSubmit(values);
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={t('jobAnnouncement.applicantsPage.scheduleInterview')}
      closeOnOverlayClick={!isLoading}
    >
      <form onSubmit={handleSubmit(handleFormSubmit, scrollToFirstError)} className="space-y-6">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label={t('interviews.school')}
              required
              error={errors.schoolBranchesId?.message}
              htmlFor="schoolBranchesId"
            >
              <Controller
                name="schoolBranchesId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="schoolBranchesId"
                    value={field.value ?? ''}
                    onChange={(value) =>
                      field.onChange(
                        Array.isArray(value) ? (value[0] as string) : (value as string)
                      )
                    }
                    options={schoolBranchOptions}
                    placeholder={t('interviews.selectSchool')}
                    error={!!errors.schoolBranchesId}
                    disabled
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('interviews.jobAdvertisement')}
              required
              error={errors.jobAdvertisementId?.message}
              htmlFor="jobAdvertisementId"
            >
              <Controller
                name="jobAdvertisementId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="jobAdvertisementId"
                    value={field.value ?? ''}
                    onChange={(value) =>
                      field.onChange(
                        Array.isArray(value) ? (value[0] as string) : (value as string)
                      )
                    }
                    options={jobAdvertisementOptions}
                    placeholder={t('interviews.selectJobAdvertisement')}
                    error={!!errors.jobAdvertisementId}
                    disabled
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label={t('interviews.teacherName')}
              required
              error={errors.teacherId?.message}
              htmlFor="teacherId"
            >
              <Controller
                name="teacherId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="teacherId"
                    value={field.value ?? ''}
                    onChange={(value) =>
                      field.onChange(
                        Array.isArray(value) ? (value[0] as string) : (value as string)
                      )
                    }
                    options={teacherOptions}
                    placeholder={t('interviews.selectTeacherName')}
                    error={!!errors.teacherId}
                    disabled
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('interviews.supervisorName')}
              required
              error={errors.supervisorId?.message}
              htmlFor="supervisorId"
            >
              <Controller
                name="supervisorId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="supervisorId"
                    value={field.value ?? ''}
                    onChange={(value) =>
                      field.onChange(
                        Array.isArray(value) ? (value[0] as string) : (value as string)
                      )
                    }
                    options={supervisorOptions}
                    placeholder={t('interviews.selectSupervisor')}
                    error={!!errors.supervisorId}
                    disabled={isLoading || supervisorOptions.length === 0}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label={t('interviews.interviewDate')}
              required
              error={errors.interviewDate?.message}
              htmlFor="interviewDate"
            >
              <Controller
                name="interviewDate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="interviewDate"
                    type="date"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t('jobAnnouncement.applicantsPage.selectInterviewDate')}
                    className="flex justify-end"
                    disabled={isLoading}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('jobAnnouncement.applicantsPage.interviewType')}
              required
              error={errors.interViewType?.message}
              htmlFor="interViewType"
            >
              <Controller
                name="interViewType"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="interViewType"
                    value={field.value ? String(field.value) : ''}
                    onChange={(value) => {
                      const normalizedValue = Array.isArray(value) ? value[0] : value;
                      field.onChange(normalizedValue ? Number(normalizedValue) : '');
                    }}
                    options={interviewTypeOptions}
                    placeholder={t('jobAnnouncement.applicantsPage.selectInterviewType')}
                    error={!!errors.interViewType}
                    disabled={isLoading}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label={t('interviews.startTime')}
              required
              error={errors.startTime?.message}
              htmlFor="startTime"
            >
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="startTime"
                    type="time"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                    placeholder={t('interviews.selectStartTime')}
                    className="flex justify-end"
                    disabled={isLoading}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('interviews.endTime')}
              required
              error={errors.endTime?.message}
              htmlFor="endTime"
            >
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="endTime"
                    type="time"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                    placeholder={t('interviews.selectEndTime')}
                    className="flex justify-end"
                    disabled={isLoading}
                  />
                )}
              />
            </FormField>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.processing') : t('jobAnnouncement.applicantsPage.schedule')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
