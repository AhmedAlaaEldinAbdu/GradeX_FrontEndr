import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import CustomImage from '@/shared/components/CustomImage';
import type { InterviewFormProps } from '@/validations/interviews-validations';
import { InterviewFormSchema } from '@/validations/interviews-validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { data } from 'react-router-dom';

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
  const {
    register,
    handleSubmit,
    reset,
    control,
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

  const JOB_ADVERTISEMENT_OPTIONS = [
    { value: 'job-1', label: 'إعلان معلم عربي - فرع الرياض' },
    { value: 'job-2', label: 'إعلان معلم علوم - فرع جدة' },
    { value: 'job-3', label: 'إعلان معلم إنجليزي - فرع الدمام' },
  ];

  const SCHOOL_BRANCH_OPTIONS = [
    { value: 'branch-1', label: 'مدرسة المستقبل - الرياض' },
    { value: 'branch-2', label: 'مدرسة الريادة - جدة' },
    { value: 'branch-3', label: 'مدرسة النخبة - الدمام' },
  ];

  const TEACHER_OPTIONS = [
    { value: 'teacher-1', label: 'أحمد محمد' },
    { value: 'teacher-2', label: 'سارة علي' },
    { value: 'teacher-3', label: 'محمد حسن' },
    { value: 'teacher-4', label: 'فاطمة أحمد' },
  ];

  const SUPERVISOR_OPTIONS = [
    { value: 'supervisor-1', label: 'م. أحمد حسن ابراهيم' },
    { value: 'supervisor-2', label: 'د. سارة إبراهيم' },
    { value: 'supervisor-3', label: 'أ. يوسف العتيبي' },
  ];

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
          <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
            <span className="font-medium text-gray-900">{t('interviews.interviewDate')}:</span>{' '}
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
                      options={SCHOOL_BRANCH_OPTIONS}
                      placeholder={t('interviews.selectSchool')}
                      error={!!errors.schoolBranchesId}
                      disabled={SCHOOL_BRANCH_OPTIONS.length === 0}
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
                      options={JOB_ADVERTISEMENT_OPTIONS}
                      placeholder={t('interviews.selectJobAdvertisement')}
                      error={!!errors.jobAdvertisementId}
                      disabled={JOB_ADVERTISEMENT_OPTIONS.length === 0}
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
                      options={TEACHER_OPTIONS}
                      placeholder={t('interviews.selectTeacherName')}
                      error={!!errors.teacherId}
                      disabled={TEACHER_OPTIONS.length === 0}
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
                      options={SUPERVISOR_OPTIONS}
                      placeholder={t('interviews.selectSupervisor')}
                      error={!!errors.supervisorId}
                      disabled={SUPERVISOR_OPTIONS.length === 0}
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
                <Input
                  id="startTime"
                  type="time"
                  icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('interviews.selectStartTime')}
                  {...register('startTime', {
                    required: t('common.validation.required'),
                  })}
                  className="flex justify-end"
                />
              </FormField>

              <FormField
                label={t('interviews.endTime')}
                required
                error={errors.endTime?.message}
                htmlFor="endTime"
              >
                <Input
                  id="endTime"
                  type="time"
                  icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('interviews.selectEndTime')}
                  {...register('endTime', {
                    required: t('common.validation.required'),
                  })}
                  className="flex justify-end"
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
