import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import CustomImage from '@/shared/components/CustomImage';
import type { InterviewFormProps } from '@/validations/interviews-validations';
import { InterviewFormSchema } from '@/validations/interviews-validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSchools } from '@/redux/features/schools/schoolsSlice';
import { fetchJobAdvertisments } from '@/redux/features/job-advertisments/jobAdvertismentsSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';

interface AddEditInterviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: InterviewFormProps) => Promise<void>;
  initialValues?: InterviewFormProps;
  selectedDate?: Date;
  mode?: 'add' | 'edit';
}

export default function AddEditInterviewPopup({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  selectedDate,
  mode = 'add',
}: AddEditInterviewPopupProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    schools: schoolsList,
    isLoading: isSchoolsLoading,
    isInitialized: isSchoolsInitialized,
  } = useAppSelector((state) => state.schools);

  const { jobAdvertisments } = useAppSelector((state) => state.jobAdvertisments);

  const { teachers } = useAppSelector((state) => state.teachers);

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InterviewFormProps>({
    resolver: yupResolver(InterviewFormSchema),
    defaultValues: {
      schoolBranchesId: '',
      jobAdvertisementId: '',
      teacherId: '',
      supervisorId: '',
      interviewDate: '',
      startTime: '',
      endTime: '',
      interViewType: 1,
    },
  });

  const selectedSchoolBranchId = watch('schoolBranchesId');

  const schoolBranchOptions: CustomSelectOption[] = schoolsList.length
    ? schoolsList.flatMap((school) => {
        const schoolName = i18n.language === 'ar' ? school.nameAr : school.nameEn || school.nameAr;
        return (school.schoolBranches ?? []).map((branch) => {
          const branchSegments = [branch.city, branch.neighborhood, branch.address]
            .filter(Boolean)
            .join(' - ');

          return {
            value: branch.id,
            label: [schoolName, branchSegments].filter(Boolean).join(' | '),
          };
        });
      })
    : [];

  const jobAdvertisementOptions: CustomSelectOption[] = jobAdvertisments.length
    ? jobAdvertisments.map((advert) => ({
        value: advert.id,
        label: i18n.language === 'ar' ? advert.name : advert.nameEn || advert.name,
      }))
    : [];

  const teacherOptions: CustomSelectOption[] = teachers.length
    ? teachers.map((teacher) => ({
        value: teacher.id,
        label: teacher.fullName,
      }))
    : [];

  const supervisorOptions = teacherOptions;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!isSchoolsInitialized && !isSchoolsLoading) {
      dispatch(fetchSchools({ limit: 10000 }));
    }
  }, [isSchoolsInitialized, isSchoolsLoading, dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedSchoolBranchId) {
      return;
    }

    dispatch(
      fetchJobAdvertisments({
        filters: { schoolBranchId: selectedSchoolBranchId },
        limit: 10000,
      })
    );

    dispatch(
      fetchTeachers({
        filters: { schoolBranchId: selectedSchoolBranchId },
        limit: 10000,
      })
    );
  }, [dispatch, isOpen, selectedSchoolBranchId]);

  const createInterviewFormDefaults = (): InterviewFormProps => ({
    schoolBranchesId: '',
    jobAdvertisementId: '',
    teacherId: '',
    supervisorId: '',
    interviewDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    startTime: '',
    endTime: '',
    interViewType: 1,
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues ?? createInterviewFormDefaults());
    }
  }, [isOpen, initialValues, reset]);

  const formattedSelectedDate = selectedDate
    ? format(selectedDate, 'PPP', { locale: i18n.language === 'ar' ? ar : undefined })
    : null;

  const closeAndReset = () => {
    reset(createInterviewFormDefaults());
    onClose();
  };

  const handleFormSubmit = async (values: InterviewFormProps) => {
    if (onSubmit) {
      await onSubmit(values);
    }
    closeAndReset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title={mode === 'edit' ? t('interviews.editInterview') : t('interviews.addInterview')}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {formattedSelectedDate && (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-base text-gray-500">
            <span className="text-base font-medium text-black-800">
              {t('interviews.interviewDate')}:
            </span>{' '}
            {formattedSelectedDate}
          </div>
        )}

        <div>
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
                  rules={{ required: t('common.validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      id="schoolBranchesId"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                      options={schoolBranchOptions}
                      placeholder={t('interviews.selectSchool')}
                      error={!!errors.schoolBranchesId}
                      disabled={schoolBranchOptions.length === 0}
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
                  rules={{ required: t('common.validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      id="jobAdvertisementId"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                      options={jobAdvertisementOptions}
                      placeholder={t('interviews.selectJobAdvertisement')}
                      error={!!errors.jobAdvertisementId}
                      disabled={jobAdvertisementOptions.length === 0}
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
                  rules={{ required: t('common.validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      id="teacherId"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                      options={teacherOptions}
                      placeholder={t('interviews.selectTeacherName')}
                      error={!!errors.teacherId}
                      disabled={teacherOptions.length === 0}
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
                  rules={{ required: t('common.validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      id="supervisorId"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                      options={supervisorOptions}
                      placeholder={t('interviews.selectSupervisor')}
                      error={!!errors.supervisorId}
                      disabled={supervisorOptions.length === 0}
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
                  rules={{ required: t('common.validation.required') }}
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
                  rules={{ required: t('common.validation.required') }}
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
                    />
                  )}
                />
              </FormField>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={closeAndReset} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('common.saving')
              : mode === 'edit'
                ? t('common.save')
                : t('common.add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
