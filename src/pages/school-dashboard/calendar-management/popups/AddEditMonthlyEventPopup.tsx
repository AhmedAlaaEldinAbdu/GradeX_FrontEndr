import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { yupResolver } from '@hookform/resolvers/yup';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import type { CustomSelectOption } from '@/shared/components/CustomSelect';
import { MonthlyCalendarDuration } from '@/shared/enums/enums';
import {
  MonthlyEventFormSchema,
  type MonthlyEventFormValues,
} from '@/validations/monthly-calendar-validations';
import type { Classroom } from '@/services/api/types/classrooms.types';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import CloseXGreenIcon from '@/assets/icons/CloseXGreen.svg';
import PlusWhite16Icon from '@/assets/icons/PlusWhite16.svg';
import {
  PopupField,
  PopupPickerInput,
  PopupRadio,
  PopupSelect,
  PopupTextInput,
} from '../components/AcademicCalendarPopupFields';

interface AddEditMonthlyEventPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MonthlyEventFormValues) => Promise<void> | void;
  initialValues?: MonthlyEventFormValues | null;
  selectedDate?: Date;
  mode?: 'add' | 'edit';
  gradeOptions: CustomSelectOption[];
  classroomEntities: Classroom[];
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
  classroomEntities,
  schoolBranchId,
  gradeOptionsLoading = false,
  classroomOptionsLoading = false,
}: AddEditMonthlyEventPopupProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isEdit = mode === 'edit';
  const previousGradesKeyRef = useRef<string | null>(null);

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

  const scrollToFirstError = useScrollToFirstError<MonthlyEventFormValues>();

  const isFullDay = watch('isFullDay');
  const watchedGrades = watch('grades');
  const watchedGradesKey = useMemo(() => (watchedGrades || []).join('|'), [watchedGrades]);

  // Filter classrooms to only those belonging to the selected grade(s)
  const filteredClassroomOptions = useMemo<CustomSelectOption[]>(() => {
    if (!watchedGrades || watchedGrades.length === 0) return [];
    const selectedGradeSet = new Set(watchedGrades);
    return classroomEntities
      .filter((c) => selectedGradeSet.has(c.gradeId))
      .map((c) => ({
        value: c.id,
        label: currentLang === 'ar' ? c.name : c.nameEn || c.name,
      }));
  }, [watchedGrades, classroomEntities, currentLang]);

  // Reset classrooms when grades change
  useEffect(() => {
    if (previousGradesKeyRef.current === null) {
      previousGradesKeyRef.current = watchedGradesKey;
      return;
    }

    if (previousGradesKeyRef.current === watchedGradesKey) {
      return;
    }

    previousGradesKeyRef.current = watchedGradesKey;
    setValue('classRomms', []);
  }, [watchedGradesKey, setValue]);

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
      const values = initialValues ?? createDefaultValues();
      previousGradesKeyRef.current = (values.grades || []).join('|');
      reset(values);
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
  const classroomPlaceholder =
    !watchedGrades || watchedGrades.length === 0
      ? t('monthlyCalendar.form.selectStageFirst')
      : classroomOptionsLoading
        ? t('common.loading')
        : t('monthlyCalendar.form.selectClassrooms');

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      showHeader={false}
      placement="end"
      closeOnOverlayClick={false}
      panelClassName="max-w-[650px]! rounded-e-none rounded-s-lg border border-[#E2E8F0]/90 shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]! overflow-hidden"
      contentClassName="flex min-h-0 flex-col overflow-hidden! p-0!"
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#F1F5F9] px-8 pt-7 pb-[21px]">
        <div className="flex flex-col gap-1 text-start">
          <h2 className="text-xl leading-7 font-bold text-[black]">
            {isEdit ? t('monthlyCalendar.actions.editEvent') : t('monthlyCalendar.addEventButton')}
          </h2>
          <p className="text-xs leading-4 text-[#9D9D9D]">
            {t(isEdit ? 'monthlyCalendar.form.editSubtitle' : 'monthlyCalendar.form.addSubtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={closeAndReset}
          aria-label={t('common.close')}
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#F1F5F9]"
        >
          <CustomImage src={CloseXGreenIcon} alt="" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-5 overflow-y-auto px-8 py-6">
        <PopupField
          name="nameAr"
          label={t('monthlyCalendar.form.nameAr')}
          required
          error={errors.nameAr?.message}
        >
          <Controller
            name="nameAr"
            control={control}
            render={({ field }) => (
              <PopupTextInput
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('monthlyCalendar.form.nameArPlaceholder')}
                hasError={Boolean(errors.nameAr)}
              />
            )}
          />
        </PopupField>

        <PopupField
          name="nameEn"
          label={t('monthlyCalendar.form.nameEn')}
          required
          error={errors.nameEn?.message}
        >
          <Controller
            name="nameEn"
            control={control}
            render={({ field }) => (
              <PopupTextInput
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('monthlyCalendar.form.nameEnPlaceholder')}
                hasError={Boolean(errors.nameEn)}
              />
            )}
          />
        </PopupField>

        <PopupField
          name="grades"
          label={t('monthlyCalendar.form.stage')}
          required
          error={errors.grades?.message as string}
        >
          <Controller
            name="grades"
            control={control}
            render={({ field }) => (
              <PopupSelect
                multiple
                name={field.name}
                value={field.value || []}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={gradeOptions}
                placeholder={gradePlaceholder}
                disabled={gradeOptionsLoading}
                hasError={Boolean(errors.grades)}
              />
            )}
          />
        </PopupField>

        <PopupField
          name="classRomms"
          label={t('monthlyCalendar.form.classrooms')}
          required
          error={errors.classRomms?.message as string}
        >
          <Controller
            name="classRomms"
            control={control}
            render={({ field }) => (
              <PopupSelect
                multiple
                name={field.name}
                value={field.value || []}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={filteredClassroomOptions}
                placeholder={classroomPlaceholder}
                disabled={!watchedGrades || watchedGrades.length === 0 || classroomOptionsLoading}
                hasError={Boolean(errors.classRomms)}
              />
            )}
          />
        </PopupField>

        <PopupField
          name="day"
          label={t('monthlyCalendar.form.date')}
          required
          error={errors.day?.message}
        >
          <Controller
            name="day"
            control={control}
            render={({ field }) => (
              <PopupPickerInput
                name={field.name}
                type="date"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('common.chooseDate')}
                disabled={mode === 'add' && Boolean(selectedDate)}
                hasError={Boolean(errors.day)}
              />
            )}
          />
        </PopupField>

        <PopupField name="duration" label={t('monthlyCalendar.form.duration')} required>
          <div className="flex flex-wrap items-center gap-6">
            <PopupRadio
              checked={isFullDay}
              label={t('monthlyCalendar.form.fullDay')}
              onSelect={() => handleDurationChange(true)}
            />
            <PopupRadio
              checked={!isFullDay}
              label={t('monthlyCalendar.form.customDuration')}
              onSelect={() => handleDurationChange(false)}
            />
          </div>
        </PopupField>

        {isFullDay ? null : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <PopupField
              name="startTime"
              label={t('monthlyCalendar.form.startTime')}
              required
              error={errors.startTime?.message}
            >
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <PopupPickerInput
                    name={field.name}
                    type="time"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t('monthlyCalendar.form.selectStartTime')}
                    hasError={Boolean(errors.startTime)}
                  />
                )}
              />
            </PopupField>

            <PopupField
              name="endTime"
              label={t('monthlyCalendar.form.endTime')}
              required
              error={errors.endTime?.message}
            >
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <PopupPickerInput
                    name={field.name}
                    type="time"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t('monthlyCalendar.form.selectEndTime')}
                    hasError={Boolean(errors.endTime)}
                  />
                )}
              />
            </PopupField>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/70 px-8 pt-[21px] pb-5">
        <Button
          actionKey={isEdit ? 'edit' : 'add'}
          onClick={handleSubmit(handleFormSubmit, scrollToFirstError)}
          disabled={isSubmitting}
          icon={isEdit ? undefined : <CustomImage src={PlusWhite16Icon} alt="" className="block" />}
          className="h-10 gap-2 rounded-lg! border-0! bg-[#1E7A52]! px-6! py-2.5! text-sm! leading-[19.6px] font-semibold! text-white! shadow-none! drop-shadow-[0px_1px_1px_rgba(5,150,105,0.2)] hover:bg-[#1E7A52]/90!"
        >
          {isSubmitting ? t('common.saving') : t(isEdit ? 'common.save' : 'common.add')}
        </Button>
        <button
          type="button"
          onClick={closeAndReset}
          disabled={isSubmitting}
          className="h-[42px] rounded-lg border border-[#1E7A52] bg-white px-[25px] text-sm leading-5 font-medium text-[#1E7A52] transition-colors hover:bg-[#F0FDF4]"
        >
          {t('common.cancel')}
        </button>
      </div>
    </Modal>
  );
}
