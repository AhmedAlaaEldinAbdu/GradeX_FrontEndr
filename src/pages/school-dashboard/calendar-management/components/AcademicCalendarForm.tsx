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
  breakBetweenClassesMode: 'year' | 'custom';
  breakBetweenClassesSchedules: AcademicCalendarScheduleItem[];

  morningLineMode: 'year' | 'custom';
  morningLineSchedules: AcademicCalendarScheduleItem[];

  breakfastMode: 'year' | 'custom';
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
}) {
  return (
    <div className="space-y-4">
      {showHeader ? (
        <div className="flex items-center justify-between">
          {title ? <h3 className="text-lg font-semibold text-gray-800">{title}</h3> : <div />}
          <button type="button" onClick={onAdd}>
            <CustomImage src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
          </button>
        </div>
      ) : null}

      {items.map((item) => (
        <Card key={item.id} className="rounded-2xl" padding="md">
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
                <FormField label={endLabel} required>
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
        </Card>
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
        label:
          (currentLang === 'ar' ? stage.nameAr : stage.nameEn) || stage.nameAr || stage.nameEn,
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

    breakBetweenClassesMode: initialValues?.breakBetweenClassesMode ?? 'custom',
    breakBetweenClassesSchedules: initialValues?.breakBetweenClassesSchedules ?? [
      createEmptySchedule(),
    ],

    morningLineMode: initialValues?.morningLineMode ?? 'custom',
    morningLineSchedules: initialValues?.morningLineSchedules ?? [createEmptySchedule()],

    breakfastMode: initialValues?.breakfastMode ?? 'custom',
    breakfastSchedules: initialValues?.breakfastSchedules ?? [createEmptySchedule()],
  });

  const submitLabel = mode === 'add' ? t('common.add') : t('common.save');
  const cancelLabel = t('common.cancel');

  const patch = (partial: Partial<AcademicCalendarFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

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

            <FormField label={t('academicCalendar.form.studyEndDateLabel')} required>
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
              <Input
                type="number"
                min={0}
                value={values.weeksCount}
                onChange={(e) =>
                  patch({ weeksCount: e.target.value === '' ? '' : Number(e.target.value) })
                }
              />
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

        <Card>
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
          />
        </Card>

        <Card className="rounded-2xl" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {t('academicCalendar.form.breakBetweenClassesTitle')}
              </h3>
              {values.breakBetweenClassesMode === 'custom' ? (
                <button type="button" onClick={() => addSchedule('breakBetweenClassesSchedules')}>
                  <CustomImage src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
                </button>
              ) : (
                ''
              )}
            </div>

            <div className="flex items-center gap-3">
              <FormField label={t('academicCalendar.form.breakBetweenClassesLabel')} required>
                <div className="flex items-center gap-6 text-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={values.breakBetweenClassesMode === 'year'}
                      onChange={() => patch({ breakBetweenClassesMode: 'year' })}
                      value={'year'}
                    />
                    <span className="text-sm text-gray-700">
                      {t('academicCalendar.form.yearMode')}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={values.breakBetweenClassesMode === 'custom'}
                      onChange={() => patch({ breakBetweenClassesMode: 'custom' })}
                      value={'custom'}
                    />
                    <span className="text-sm text-gray-700">
                      {t('academicCalendar.form.customMode')}
                    </span>
                  </label>
                </div>
              </FormField>
            </div>

            {values.breakBetweenClassesMode === 'custom' ? (
              <ScheduleSection
                showHeader={false}
                items={values.breakBetweenClassesSchedules}
                onAdd={() => addSchedule('breakBetweenClassesSchedules')}
                onRemove={(id) => removeSchedule('breakBetweenClassesSchedules', id)}
                onChange={(id, itemPatch) =>
                  updateSchedule('breakBetweenClassesSchedules', id, itemPatch)
                }
                dayOptions={dayOptions}
                daysLabel={t('academicCalendar.form.daysLabel')}
                daysPlaceholder={t('academicCalendar.form.chooseDaysPlaceholder')}
                startLabel={t('academicCalendar.form.breakStartLabel')}
                endLabel={t('academicCalendar.form.breakEndLabel')}
              />
            ) : (
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
                <FormField label={t('academicCalendar.form.breakEndLabel')} required>
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
            )}
          </div>
        </Card>

        <Card className="rounded-2xl" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {t('academicCalendar.form.morningLineTitle')}
              </h3>
              {values.morningLineMode === 'custom' && (
                <button type="button" onClick={() => addSchedule('morningLineSchedules')}>
                  <CustomImage src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <FormField label={t('academicCalendar.form.morningLineLabel')} required>
                <div className="flex items-center gap-6 text-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={values.morningLineMode === 'year'}
                      onChange={() => patch({ morningLineMode: 'year' })}
                      value={'year'}
                    />
                    <span className="text-sm text-gray-700">
                      {t('academicCalendar.form.yearMode')}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={values.morningLineMode === 'custom'}
                      onChange={() => patch({ morningLineMode: 'custom' })}
                      value={'custom'}
                    />
                    <span className="text-sm text-gray-700">
                      {t('academicCalendar.form.customMode')}
                    </span>
                  </label>
                </div>
              </FormField>
            </div>

            {values.morningLineMode === 'custom' ? (
              <ScheduleSection
                showHeader={false}
                items={values.morningLineSchedules}
                onAdd={() => addSchedule('morningLineSchedules')}
                onRemove={(id) => removeSchedule('morningLineSchedules', id)}
                onChange={(id, itemPatch) => updateSchedule('morningLineSchedules', id, itemPatch)}
                dayOptions={dayOptions}
                daysLabel={t('academicCalendar.form.daysLabel')}
                daysPlaceholder={t('academicCalendar.form.chooseDaysPlaceholder')}
                startLabel={t('academicCalendar.form.morningLineStartLabel')}
                endLabel={t('academicCalendar.form.morningLineEndLabel')}
              />
            ) : (
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
                <FormField label={t('academicCalendar.form.morningLineEndLabel')} required>
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
            )}
          </div>
        </Card>

        <Card className="rounded-2xl" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {t('academicCalendar.form.breakfastTitle')}
              </h3>
              {values.breakfastMode === 'custom' && (
                <button type="button" onClick={() => addSchedule('breakfastSchedules')}>
                  <CustomImage src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <FormField label={t('academicCalendar.form.breakfastLabel')} required>
                <div className="flex items-center gap-6 text-sm">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={values.breakfastMode === 'year'}
                      onChange={() => patch({ breakfastMode: 'year' })}
                      value={'year'}
                    />
                    <span className="text-sm text-gray-700">
                      {t('academicCalendar.form.yearMode')}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={values.breakfastMode === 'custom'}
                      onChange={() => patch({ breakfastMode: 'custom' })}
                      value={'custom'}
                    />
                    <span className="text-sm text-gray-700">
                      {t('academicCalendar.form.customMode')}
                    </span>
                  </label>
                </div>
              </FormField>
            </div>

            {values.breakfastMode === 'custom' ? (
              <ScheduleSection
                showHeader={false}
                items={values.breakfastSchedules}
                onAdd={() => addSchedule('breakfastSchedules')}
                onRemove={(id) => removeSchedule('breakfastSchedules', id)}
                onChange={(id, itemPatch) => updateSchedule('breakfastSchedules', id, itemPatch)}
                dayOptions={dayOptions}
                daysLabel={t('academicCalendar.form.daysLabel')}
                daysPlaceholder={t('academicCalendar.form.chooseDaysPlaceholder')}
                startLabel={t('academicCalendar.form.breakfastStartLabel')}
                endLabel={t('academicCalendar.form.breakfastEndLabel')}
              />
            ) : (
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
                <FormField label={t('academicCalendar.form.breakfastEndLabel')} required>
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
            )}
          </div>
        </Card>

        <div className="flex flex-row-reverse gap-3 pt-4">
          <Button onClick={handleSubmit} variant="primary" disabled={isSubmitting}>
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
