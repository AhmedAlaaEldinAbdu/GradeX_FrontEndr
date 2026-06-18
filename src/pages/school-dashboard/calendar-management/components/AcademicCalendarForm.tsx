import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import { Days as DaysEnum, type Days as DaysValue } from '@/shared/enums/enums';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';

type DayKey = keyof typeof DaysEnum;

export const toDaysEnumValues = (days: DayKey[]): DaysValue[] => days.map((day) => DaysEnum[day]);

export type AcademicCalendarScheduleItem = {
  id: string;
  days: DayKey[];
  startTime: string;
  endTime: string;
};

export type AcademicCalendarFormValues = {
  educationalStageId: string;
  studyStartDate: string;
  studyEndDate: string;
  weeksCount: number | '';
  lessonDuration: string;

  schoolDaySchedules: AcademicCalendarScheduleItem[];
  breakBetweenClassesSchedules: AcademicCalendarScheduleItem[];
  morningLineSchedules: AcademicCalendarScheduleItem[];
  breakfastSchedules: AcademicCalendarScheduleItem[];
};

type AcademicCalendarFormProps = {
  mode: 'add' | 'edit';
  schoolBranchId: string;
  initialValues?: Partial<AcademicCalendarFormValues>;
  onCancel?: () => void;
  onSubmit?: (values: AcademicCalendarFormValues) => void | Promise<void>;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createEmptySchedule = (): AcademicCalendarScheduleItem => ({
  id: createId(),
  days: [],
  startTime: '',
  endTime: '',
});

function ScheduleSection({
  title,
  items,
  onAdd,
  onRemove,
  onChange,
  dayOptions,
  daysLabel,
  daysPlaceholder,
  startLabel,
  endLabel,
  showHeader = true,
  errors,
}: {
  title?: string;
  items: AcademicCalendarScheduleItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<AcademicCalendarScheduleItem>) => void;
  dayOptions: CustomSelectOption[];
  daysLabel: string;
  daysPlaceholder: string;
  startLabel: string;
  endLabel: string;
  showHeader?: boolean;
  errors?: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      {showHeader ? (
        <div className="flex items-center justify-between">
          {title ? <h3 className="text-base font-medium text-gray-900">{title}</h3> : <div />}
          <button type="button" onClick={onAdd}>
            <CustomImage src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
          </button>
        </div>
      ) : null}

      {items.map((item) => (
        <div className="rounded-2xl border border-black-100 p-4">
          <div className="flex gap-1">
            <div className="flex-grow">
              <div className="mb-4 grid grid-cols-1 gap-4">
                <FormField label={daysLabel} required>
                  <CustomSelect
                    value={item.days}
                    onChange={(value) =>
                      onChange(item.id, { days: Array.isArray(value) ? (value as DayKey[]) : [] })
                    }
                    options={dayOptions}
                    placeholder={daysPlaceholder}
                    isMulti
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label={startLabel} required>
                  <Input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => onChange(item.id, { startTime: e.target.value })}
                  />
                </FormField>
                <FormField label={endLabel} required error={errors?.[item.id]}>
                  <Input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => onChange(item.id, { endTime: e.target.value })}
                  />
                </FormField>
              </div>
            </div>
            {items.length > 1 && (
              <div>
                <IconButton
                  status="delete"
                  variant="danger"
                  ariaLabel="Delete"
                  onClick={() => onRemove(item.id)}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AcademicCalendarForm({
  mode,
  schoolBranchId,
  initialValues,
  onCancel,
  onSubmit,
}: AcademicCalendarFormProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const isEducationalStagesLoading = useAppSelector((state) => state.educationalStages.isLoading);

  useEffect(() => {
    if (educationalStages.length > 0) return;
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
  }, [dispatch, educationalStages.length, schoolBranchId]);

  const dayOptions = useMemo<CustomSelectOption[]>(() => {
    const order: DayKey[] = [
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ];

    return order.map((key) => ({
      value: key,
      label: t(`academicCalendar.daysOfWeek.${key.toLowerCase()}`),
    }));
  }, [t]);

  const educationalStageOptions: CustomSelectOption[] = useMemo(() => {
    return educationalStages
      .map((stage) => ({
        value: stage.id,
        label: (currentLang === 'ar' ? stage.nameAr : stage.nameEn) || stage.nameAr || stage.nameEn,
      }))
      .filter((opt) => Boolean(opt.label));
  }, [currentLang, educationalStages]);

  const [values, setValues] = useState<AcademicCalendarFormValues>({
    educationalStageId: initialValues?.educationalStageId ?? '',
    studyStartDate: initialValues?.studyStartDate ?? '',
    studyEndDate: initialValues?.studyEndDate ?? '',
    weeksCount: initialValues?.weeksCount ?? '',
    lessonDuration: initialValues?.lessonDuration ?? '60',

    schoolDaySchedules: initialValues?.schoolDaySchedules ?? [createEmptySchedule()],

    breakBetweenClassesSchedules: initialValues?.breakBetweenClassesSchedules ?? [
      createEmptySchedule(),
    ],

    morningLineSchedules: initialValues?.morningLineSchedules ?? [createEmptySchedule()],

    breakfastSchedules: initialValues?.breakfastSchedules ?? [createEmptySchedule()],
  });

  const dateError = useMemo(() => {
    if (!values.studyStartDate || !values.studyEndDate) return '';
    return new Date(values.studyStartDate) > new Date(values.studyEndDate)
      ? 'academicCalendar.form.errors.endDateBeforeStart'
      : '';
  }, [values.studyStartDate, values.studyEndDate]);

  const scheduleErrors = useMemo(() => {
    const map: Record<string, string> = {};
    const allItems = [
      ...values.schoolDaySchedules,
      ...values.breakBetweenClassesSchedules,
      ...values.morningLineSchedules,
      ...values.breakfastSchedules,
    ];
    for (const item of allItems) {
      if (item.startTime && item.endTime && item.startTime > item.endTime) {
        map[item.id] = 'academicCalendar.form.errors.endTimeBeforeStart';
      }
    }
    return map;
  }, [
    values.schoolDaySchedules,
    values.breakBetweenClassesSchedules,
    values.morningLineSchedules,
    values.breakfastSchedules,
  ]);

  const hasValidationErrors = Boolean(dateError) || Object.keys(scheduleErrors).length > 0;

  const submitLabel = isSubmitting
    ? t('common.saving')
    : mode === 'add'
      ? t('common.add')
      : t('common.save');
  const cancelLabel = t('common.cancel');

  const patch = (partial: Partial<AcademicCalendarFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  // Auto-calculate weeks count from start/end dates
  useEffect(() => {
    if (!values.studyStartDate || !values.studyEndDate) return;
    const start = new Date(values.studyStartDate);
    const end = new Date(values.studyEndDate);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) {
      patch({ weeksCount: 0 });
      return;
    }
    patch({ weeksCount: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)) });
  }, [values.studyStartDate, values.studyEndDate]);

  const updateSchedule = (
    listKey:
      | 'schoolDaySchedules'
      | 'breakBetweenClassesSchedules'
      | 'morningLineSchedules'
      | 'breakfastSchedules',
    id: string,
    itemPatch: Partial<AcademicCalendarScheduleItem>
  ) => {
    setValues((prev) => ({
      ...prev,
      [listKey]: prev[listKey].map((item) => (item.id === id ? { ...item, ...itemPatch } : item)),
    }));
  };

  const addSchedule = (
    listKey:
      | 'schoolDaySchedules'
      | 'breakBetweenClassesSchedules'
      | 'morningLineSchedules'
      | 'breakfastSchedules'
  ) => {
    setValues((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], createEmptySchedule()],
    }));
  };

  const removeSchedule = (
    listKey:
      | 'schoolDaySchedules'
      | 'breakBetweenClassesSchedules'
      | 'morningLineSchedules'
      | 'breakfastSchedules',
    id: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (hasValidationErrors) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="space-y-6">
          <FormField label={t('academicCalendar.form.educationalStagesLabel')} required>
            <CustomSelect
              value={values.educationalStageId}
              onChange={(value) => {
                const selected = Array.isArray(value) ? (value[0] ?? '') : value;
                patch({ educationalStageId: selected ?? '' });
              }}
              options={educationalStageOptions}
              placeholder={t('academicCalendar.form.educationalStagesPlaceholder')}
              disabled={isEducationalStagesLoading}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label={t('academicCalendar.form.studyStartDateLabel')} required>
              <Input
                type="date"
                value={values.studyStartDate}
                onChange={(e) => patch({ studyStartDate: e.target.value })}
                placeholder={t('common.chooseDate')}
              />
            </FormField>

            <FormField
              label={t('academicCalendar.form.studyEndDateLabel')}
              required
              error={dateError}
            >
              <Input
                type="date"
                value={values.studyEndDate}
                onChange={(e) => patch({ studyEndDate: e.target.value })}
                placeholder={t('common.chooseDate')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField label={t('academicCalendar.form.weeksCountLabel')} required>
              <Input type="number" min={0} value={values.weeksCount} readOnly />
            </FormField>

            <FormField label={t('academicCalendar.form.lessonDurationLabel')} required>
              <Input
                type="number"
                min={0}
                value={values.lessonDuration}
                onChange={(e) => patch({ lessonDuration: e.target.value })}
                placeholder={t('academicCalendar.form.lessonDurationPlaceholder')}
              />
            </FormField>
          </div>
        </div>

        <div className="rounded-2xl border border-black-100 p-4">
          <ScheduleSection
            title={t('academicCalendar.form.schoolDaySchedulesTitle')}
            items={values.schoolDaySchedules}
            onAdd={() => addSchedule('schoolDaySchedules')}
            onRemove={(id) => removeSchedule('schoolDaySchedules', id)}
            onChange={(id, itemPatch) => updateSchedule('schoolDaySchedules', id, itemPatch)}
            dayOptions={dayOptions}
            daysLabel={t('academicCalendar.form.daysLabel')}
            daysPlaceholder={t('academicCalendar.form.chooseDaysPlaceholder')}
            startLabel={t('academicCalendar.form.schoolDayStartLabel')}
            endLabel={t('academicCalendar.form.schoolDayEndLabel')}
            errors={scheduleErrors}
          />
        </div>

        <div className="rounded-2xl border border-black-100 p-4">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900">
                {t('academicCalendar.form.breakBetweenClassesTitle')}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <FormField label={t('academicCalendar.form.breakBetweenClassesLabel')}>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {t('academicCalendar.form.yearMode')}
                </span>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label={t('academicCalendar.form.breakStartLabel')} required>
                <Input
                  type="time"
                  value={values.breakBetweenClassesSchedules[0]?.startTime ?? ''}
                  onChange={(e) =>
                    updateSchedule(
                      'breakBetweenClassesSchedules',
                      values.breakBetweenClassesSchedules[0].id,
                      {
                        startTime: e.target.value,
                      }
                    )
                  }
                />
              </FormField>
              <FormField
                label={t('academicCalendar.form.breakEndLabel')}
                required
                error={scheduleErrors[values.breakBetweenClassesSchedules[0]?.id ?? '']}
              >
                <Input
                  type="time"
                  value={values.breakBetweenClassesSchedules[0]?.endTime ?? ''}
                  onChange={(e) =>
                    updateSchedule(
                      'breakBetweenClassesSchedules',
                      values.breakBetweenClassesSchedules[0].id,
                      {
                        endTime: e.target.value,
                      }
                    )
                  }
                />
              </FormField>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black-100 p-4">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900">
                {t('academicCalendar.form.morningLineTitle')}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <FormField label={t('academicCalendar.form.morningLineLabel')}>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {t('academicCalendar.form.yearMode')}
                </span>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label={t('academicCalendar.form.morningLineStartLabel')} required>
                <Input
                  type="time"
                  value={values.morningLineSchedules[0]?.startTime ?? ''}
                  onChange={(e) =>
                    updateSchedule('morningLineSchedules', values.morningLineSchedules[0].id, {
                      startTime: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField
                label={t('academicCalendar.form.morningLineEndLabel')}
                required
                error={scheduleErrors[values.morningLineSchedules[0]?.id ?? '']}
              >
                <Input
                  type="time"
                  value={values.morningLineSchedules[0]?.endTime ?? ''}
                  onChange={(e) =>
                    updateSchedule('morningLineSchedules', values.morningLineSchedules[0].id, {
                      endTime: e.target.value,
                    })
                  }
                />
              </FormField>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black-100 p-4">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900">
                {t('academicCalendar.form.breakfastTitle')}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <FormField label={t('academicCalendar.form.breakfastLabel')}>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {t('academicCalendar.form.yearMode')}
                </span>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label={t('academicCalendar.form.breakfastStartLabel')} required>
                <Input
                  type="time"
                  value={values.breakfastSchedules[0]?.startTime ?? ''}
                  onChange={(e) =>
                    updateSchedule('breakfastSchedules', values.breakfastSchedules[0].id, {
                      startTime: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField
                label={t('academicCalendar.form.breakfastEndLabel')}
                required
                error={scheduleErrors[values.breakfastSchedules[0]?.id ?? '']}
              >
                <Input
                  type="time"
                  value={values.breakfastSchedules[0]?.endTime ?? ''}
                  onChange={(e) =>
                    updateSchedule('breakfastSchedules', values.breakfastSchedules[0].id, {
                      endTime: e.target.value,
                    })
                  }
                />
              </FormField>
            </div>
          </div>
        </div>

        <div className="flex flex-row-reverse gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isSubmitting || hasValidationErrors}
          >
            {submitLabel}
          </Button>
          <Button onClick={onCancel} variant="outline" type="button">
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
