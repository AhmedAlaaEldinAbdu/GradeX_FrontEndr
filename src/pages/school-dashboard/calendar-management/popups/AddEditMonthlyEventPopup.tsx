import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { yupResolver } from '@hookform/resolvers/yup';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import { MonthlyCalendarDuration } from '@/shared/enums/enums';
import {
  MonthlyEventFormSchema,
  type MonthlyEventFormValues,
} from '@/validations/monthly-calendar-validations';

interface AddEditMonthlyEventPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MonthlyEventFormValues) => Promise<void> | void;
  initialValues?: MonthlyEventFormValues | null;
  selectedDate?: Date;
  mode?: 'add' | 'edit';
  gradeOptions: CustomSelectOption[];
  classroomOptions: CustomSelectOption[];
  schoolBranchId: string;
  gradeOptionsLoading?: boolean;
  classroomOptionsLoading?: boolean;
}

export default function AddEditMonthlyEventPopup({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  selectedDate,
  mode = 'add',
  gradeOptions,
  classroomOptions,
  schoolBranchId,
  gradeOptionsLoading = false,
  classroomOptionsLoading = false,
}: AddEditMonthlyEventPopupProps) {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MonthlyEventFormValues>({
    resolver: yupResolver(MonthlyEventFormSchema) as any,
    defaultValues: {
      nameAr: '',
      nameEn: '',
      grades: [],
      classRomms: [],
      day: '',
      schoolBranchesId: schoolBranchId,
      isFullDay: true,
      duration: MonthlyCalendarDuration.Day,
      startTime: '',
      endTime: '',
    },
  });

  const isFullDay = watch('isFullDay');

  const createDefaultValues = (): MonthlyEventFormValues => ({
    nameAr: '',
    nameEn: '',
    grades: [],
    classRomms: [],
    day: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    schoolBranchesId: schoolBranchId,
    isFullDay: true,
    duration: MonthlyCalendarDuration.Day,
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues ?? createDefaultValues());
    }
  }, [isOpen, initialValues, reset, selectedDate, schoolBranchId]);

  const closeAndReset = () => {
    reset(createDefaultValues());
    onClose();
  };

  const handleDurationChange = (value: boolean) => {
    setValue('isFullDay', value, { shouldValidate: true });
    setValue(
      'duration',
      value ? MonthlyCalendarDuration.Day : MonthlyCalendarDuration.SpecificTime,
      { shouldValidate: true }
    );
    if (value) {
      setValue('startTime', '');
      setValue('endTime', '');
    }
  };

  const handleFormSubmit = async (values: MonthlyEventFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // Error is handled in parent component
      // Keep the modal open so the user can resolve validation/API errors
      console.error('Form submission error:', error);
    }
  };

  const gradePlaceholder = gradeOptionsLoading
    ? t('common.loading')
    : t('monthlyCalendar.form.selectStage');
  const classroomPlaceholder = classroomOptionsLoading
    ? t('common.loading')
    : t('monthlyCalendar.form.selectClassrooms');

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title={
        mode === 'edit'
          ? t('monthlyCalendar.actions.editEvent')
          : t('monthlyCalendar.addEventButton')
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            label={t('monthlyCalendar.form.nameAr')}
            required
            error={errors.nameAr?.message}
            htmlFor="monthly-event-nameAr"
          >
            <Controller
              name="nameAr"
              control={control}
              render={({ field }) => (
                <Input
                  id="monthly-event-nameAr"
                  {...field}
                  placeholder={t('monthlyCalendar.form.nameArPlaceholder')}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('monthlyCalendar.form.nameEn')}
            required
            error={errors.nameEn?.message}
            htmlFor="monthly-event-nameEn"
          >
            <Controller
              name="nameEn"
              control={control}
              render={({ field }) => (
                <Input
                  id="monthly-event-nameEn"
                  {...field}
                  placeholder={t('monthlyCalendar.form.nameEnPlaceholder')}
                />
              )}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            label={t('monthlyCalendar.form.stage')}
            required
            error={errors.grades?.message as string}
            htmlFor="monthly-event-stage"
          >
            <Controller
              name="grades"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  id="monthly-event-stage"
                  value={field.value || []}
                  onChange={(value) => field.onChange(Array.isArray(value) ? value : [value])}
                  options={gradeOptions}
                  placeholder={gradePlaceholder}
                  isMulti
                  disabled={gradeOptionsLoading}
                  error={Boolean(errors.grades)}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('monthlyCalendar.form.classrooms')}
            required
            error={errors.classRomms?.message as string}
            htmlFor="monthly-event-classrooms"
          >
            <Controller
              name="classRomms"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  id="monthly-event-classrooms"
                  value={field.value || []}
                  onChange={(value) => field.onChange(Array.isArray(value) ? value : [value])}
                  options={classroomOptions}
                  placeholder={classroomPlaceholder}
                  isMulti
                  disabled={classroomOptionsLoading}
                  error={Boolean(errors.classRomms)}
                />
              )}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            label={t('monthlyCalendar.form.date')}
            required
            error={errors.day?.message}
            htmlFor="monthly-event-date"
          >
            <Controller
              name="day"
              control={control}
              render={({ field }) => (
                <Input
                  id="monthly-event-date"
                  type="date"
                  {...field}
                  disabled={mode === 'add' && Boolean(selectedDate)}
                />
              )}
            />
          </FormField>
          <FormField label={t('monthlyCalendar.form.duration')}>
            <div className="flex flex-wrap gap-3">
              <label className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium">
                <input
                  type="radio"
                  className="accent-green-600"
                  checked={isFullDay}
                  onChange={() => handleDurationChange(true)}
                />
                {t('monthlyCalendar.form.fullDay')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium">
                <input
                  type="radio"
                  className="accent-green-600"
                  checked={!isFullDay}
                  onChange={() => handleDurationChange(false)}
                />
                {t('monthlyCalendar.form.customDuration')}
              </label>
            </div>
          </FormField>
        </div>
        {isFullDay ? null : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label={t('monthlyCalendar.form.startTime')}
              required={!isFullDay}
              error={errors.startTime?.message}
              htmlFor="monthly-event-start"
            >
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="monthly-event-start"
                    type="time"
                    {...field}
                    disabled={isFullDay}
                    placeholder={t('monthlyCalendar.form.selectStartTime')}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('monthlyCalendar.form.endTime')}
              required={!isFullDay}
              error={errors.endTime?.message}
              htmlFor="monthly-event-end"
            >
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="monthly-event-end"
                    type="time"
                    {...field}
                    disabled={isFullDay}
                    placeholder={t('monthlyCalendar.form.selectEndTime')}
                  />
                )}
              />
            </FormField>
          </div>
        )}
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
