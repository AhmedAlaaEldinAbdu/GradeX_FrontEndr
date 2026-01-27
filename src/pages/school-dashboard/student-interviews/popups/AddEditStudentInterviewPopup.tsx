import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import CustomImage from '@/shared/components/CustomImage';
import type { StudentInterviewFormProps } from '@/validations/student-interviews-validations';
import { StudentInterviewFormSchema } from '@/validations/student-interviews-validations';
import { yupResolver } from '@hookform/resolvers/yup';

interface AddEditStudentInterviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: StudentInterviewFormProps) => Promise<void>;
  initialValues?: StudentInterviewFormProps;
  selectedDate?: Date;
  mode?: 'add' | 'edit';
}

export default function AddEditStudentInterviewPopup({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  selectedDate,
  mode = 'add',
}: AddEditStudentInterviewPopupProps) {
  const { t, i18n } = useTranslation();

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StudentInterviewFormProps>({
    resolver: yupResolver(StudentInterviewFormSchema),
    defaultValues: {
      studentName: '',
      educationalStage: '',
      supervisorName: '',
      interviewDate: '',
      startTime: '',
      endTime: '',
      notes: '',
    },
  });

  const createInterviewFormDefaults = (): StudentInterviewFormProps => ({
    studentName: '',
    educationalStage: '',
    supervisorName: '',
    interviewDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues ?? createInterviewFormDefaults());
    }
  }, [isOpen, initialValues, reset, selectedDate]);

  const formattedSelectedDate = selectedDate
    ? format(selectedDate, 'PPP', { locale: i18n.language === 'ar' ? ar : undefined })
    : null;

  const closeAndReset = () => {
    reset(createInterviewFormDefaults());
    onClose();
  };

  const handleFormSubmit = async (values: StudentInterviewFormProps) => {
    await onSubmit(values);
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

        <div className="space-y-5">
          {/* Student Name */}
          <FormField
            label={t('studentManagement.studentName')}
            required
            error={errors.studentName?.message && t(errors.studentName.message)}
            htmlFor="studentName"
          >
            <Controller
              name="studentName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="studentName"
                  placeholder={t('studentManagement.searchByStudentName')}
                  error={errors.studentName ? ' ' : undefined}
                  className={errors.studentName ? 'border-red-500' : ''}
                />
              )}
            />
          </FormField>

          {/* Educational Stage */}
          <FormField
            label={t('registrationAnnouncement.educationalStage')}
            required
            error={errors.educationalStage?.message && t(errors.educationalStage.message)}
            htmlFor="educationalStage"
          >
            <Controller
              name="educationalStage"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="educationalStage"
                  placeholder={t('registrationAnnouncement.educationalStage')}
                  error={errors.educationalStage ? ' ' : undefined}
                  className={errors.educationalStage ? 'border-red-500' : ''}
                />
              )}
            />
          </FormField>

          {/* Supervisor Name */}
          <FormField
            label={t('interviews.supervisorName')}
            required
            error={errors.supervisorName?.message && t(errors.supervisorName.message)}
            htmlFor="supervisorName"
          >
            <Controller
              name="supervisorName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="supervisorName"
                  placeholder={t('interviews.supervisorName')}
                  error={errors.supervisorName ? ' ' : undefined}
                  className={errors.supervisorName ? 'border-red-500' : ''}
                />
              )}
            />
          </FormField>

          {/* Time */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label={t('interviews.startTime')}
              required
              error={errors.startTime?.message && t(errors.startTime.message)}
              htmlFor="startTime"
            >
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="startTime"
                    type="time"
                    icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                    placeholder={t('interviews.selectStartTime')}
                    className="flex justify-end"
                    error={errors.startTime ? ' ' : undefined}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('interviews.endTime')}
              required
              error={errors.endTime?.message && t(errors.endTime.message)}
              htmlFor="endTime"
            >
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="endTime"
                    type="time"
                    icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                    placeholder={t('interviews.selectEndTime')}
                    className="flex justify-end"
                    error={errors.endTime ? ' ' : undefined}
                  />
                )}
              />
            </FormField>
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
