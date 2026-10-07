import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import { useToast } from '@/shared/context/ToastContext';
import { Days } from '@/shared/enums/enums';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { getSchoolAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import {
  createAcademicCalendar,
  fetchAcademicCalendarById,
  updateAcademicCalendar,
} from '@/redux/features/academic-calendar/academicCalendarSlice';
import {
  AcademicCalendarTimePeriodScope,
  type AcademicCalendarEntity,
  type AcademicCalendarTimedSchedule,
  type CreateAcademicCalendarRequest,
} from '@/services/api/types/academic-calendar.types';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import {
  AddAcademicCalendarSchema,
  type AddAcademicCalendarFormValues,
} from '@/validations/academic-calendar-validations';
import CloseXGreenIcon from '@/assets/icons/CloseXGreen.svg';
import PlusWhite16Icon from '@/assets/icons/PlusWhite16.svg';
import {
  PopupField,
  PopupPickerInput,
  PopupSelect,
  PopupTextInput,
  type PopupSelectOption,
} from './AcademicCalendarPopupFields';

type DayKey = keyof typeof Days;

const DAY_ORDER: DayKey[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

const DEFAULT_VALUES: AddAcademicCalendarFormValues = {
  gradeId: '',
  academicSubSystemId: '',
  studyStartDate: '',
  studyEndDate: '',
  weeksCount: '',
  lessonDuration: '',
  days: [],
  dayStartTime: '',
  dayEndTime: '',
  breakStartTime: '',
  breakEndTime: '',
  assemblyStartTime: '',
  assemblyEndTime: '',
  breakfastStartTime: '',
  breakfastEndTime: '',
};

const toApiDate = (value: string) => `${value}T00:00:00.000Z`;

const localizedName = (
  item: { nameAr?: string | null; nameEn?: string | null },
  isArabic: boolean
) => (isArabic ? item.nameAr : item.nameEn) || item.nameAr || item.nameEn || '';

const buildPayload = (
  values: AddAcademicCalendarFormValues,
  schoolBrancheId: string
): CreateAcademicCalendarRequest => {
  const days = values.days.map((day) => Days[day as DayKey]);

  const yearRound = (startTime: string, endTime: string): AcademicCalendarTimedSchedule[] => [
    { timePeriodScope: AcademicCalendarTimePeriodScope.YEAR, startTime, endTime, days },
  ];

  return {
    schoolBrancheId,
    gradeId: values.gradeId,
    academicSubSystemId: values.academicSubSystemId,
    studyStartDate: toApiDate(values.studyStartDate),
    studyEndDate: toApiDate(values.studyEndDate),
    weeksCount: Number(values.weeksCount),
    lessonDuration: Number(values.lessonDuration),
    daySchedules: [{ days, dayStartTime: values.dayStartTime, dayEndTime: values.dayEndTime }],
    breaks: yearRound(values.breakStartTime, values.breakEndTime),
    assemblies: yearRound(values.assemblyStartTime, values.assemblyEndTime),
    breakfasts: yearRound(values.breakfastStartTime, values.breakfastEndTime),
  };
};

const weeksBetween = (startDate: string, endDate: string) => {
  const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Number.isNaN(diff) || diff <= 0 ? null : Math.ceil(diff / MS_PER_WEEK);
};

const toInputTime = (value?: string | null) => {
  if (!value) return '';
  if (value.includes('T')) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
  }
  return value.slice(0, 5);
};

const toDayKeys = (days: number[] = []) => DAY_ORDER.filter((day) => days.includes(Days[day]));

const entityToFormValues = (
  entity: AcademicCalendarEntity,
  stages: EducationalStageResponse[]
): AddAcademicCalendarFormValues => {
  const stage = stages.find((item) => item.id === entity.gradeId);
  const daySchedule = entity.daySchedules?.[0];
  const breakItem = entity.breaks?.[0];
  const assembly = entity.assemblies?.[0];
  const breakfast = entity.breakfasts?.[0];

  return {
    gradeId: entity.gradeId ?? '',
    academicSubSystemId: entity.academicSubSystemId || stage?.academicSubSystemId || '',
    studyStartDate: entity.studyStartDate?.slice(0, 10) ?? '',
    studyEndDate: entity.studyEndDate?.slice(0, 10) ?? '',
    weeksCount: entity.weeksCount ? String(entity.weeksCount) : '',
    lessonDuration: entity.lessonDuration ? String(entity.lessonDuration) : '',
    days: toDayKeys(daySchedule?.days),
    dayStartTime: toInputTime(daySchedule?.dayStartTime),
    dayEndTime: toInputTime(daySchedule?.dayEndTime),
    breakStartTime: toInputTime(breakItem?.startTime),
    breakEndTime: toInputTime(breakItem?.endTime),
    assemblyStartTime: toInputTime(assembly?.startTime),
    assemblyEndTime: toInputTime(assembly?.endTime),
    breakfastStartTime: toInputTime(breakfast?.startTime),
    breakfastEndTime: toInputTime(breakfast?.endTime),
  };
};

type AcademicCalendarFormPopupProps = {
  open: boolean;
  calendarId?: string;
  onClose: () => void;
  onSuccess?: (message: string) => void;
};

export default function AcademicCalendarFormPopup({
  open,
  calendarId,
  onClose,
  onSuccess,
}: AcademicCalendarFormPopupProps) {
  const isEdit = Boolean(calendarId);
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const scrollToFirstError = useScrollToFirstError();
  const isArabic = i18n.language === 'ar';
  const schoolBranchId = getCurrentSchoolBranchId() ?? '';

  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const schoolAcademicSubSystems = useAppSelector(
    (state) => state.academicSubSystems.schoolAcademicSubSystems
  );
  const { isCreating, isUpdating } = useAppSelector((state) => state.academicCalendar);
  const isSaving = isCreating || isUpdating;
  const [fetchedCalendar, setFetchedCalendar] = useState<AcademicCalendarEntity | null>(null);
  const [filledFrom, setFilledFrom] = useState<AcademicCalendarEntity | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<AddAcademicCalendarFormValues>({
    resolver: yupResolver(AddAcademicCalendarSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const academicSubSystemId = useWatch({ control, name: 'academicSubSystemId' });

  useEffect(() => {
    if (!open) return;
    if (educationalStages.length === 0) {
      dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
    }
    if (schoolAcademicSubSystems.length === 0) {
      dispatch(getSchoolAcademicSubSystems({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
    }
  }, [open, dispatch, educationalStages.length, schoolAcademicSubSystems.length, schoolBranchId]);

  useEffect(() => {
    if (!open || !calendarId) return;
    let cancelled = false;
    setFetchedCalendar(null);
    dispatch(fetchAcademicCalendarById(calendarId))
      .unwrap()
      .then((calendar) => {
        if (!cancelled) setFetchedCalendar(calendar);
      })
      .catch(() => {
        if (cancelled) return;
        showToast({ message: t('common.errorOccurred'), type: 'error' });
        onClose();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, calendarId, dispatch]);

  useEffect(() => {
    if (!open || !calendarId || fetchedCalendar?.id !== calendarId) return;
    if (educationalStages.length === 0 || filledFrom === fetchedCalendar) return;
    setFilledFrom(fetchedCalendar);
    reset(entityToFormValues(fetchedCalendar, educationalStages));
  }, [open, calendarId, fetchedCalendar, educationalStages, filledFrom, reset]);

  const isLoadingCalendar = isEdit && (!fetchedCalendar || filledFrom !== fetchedCalendar);

  const syncWeeksCount = () => {
    const weeks = weeksBetween(getValues('studyStartDate'), getValues('studyEndDate'));
    if (weeks !== null) {
      setValue('weeksCount', String(weeks), { shouldValidate: isSubmitted });
    }
  };

  const academicSubSystemOptions = useMemo<PopupSelectOption[]>(
    () =>
      schoolAcademicSubSystems
        .map((subSystem) => ({ value: subSystem.id, label: subSystem.name }))
        .filter((option) => option.label),
    [schoolAcademicSubSystems]
  );

  const gradeOptions = useMemo<PopupSelectOption[]>(
    () =>
      educationalStages
        .filter(
          (stage) =>
            !academicSubSystemId ||
            !stage.academicSubSystemId ||
            stage.academicSubSystemId === academicSubSystemId
        )
        .map((stage) => ({ value: stage.id, label: localizedName(stage, isArabic) }))
        .filter((option) => option.label),
    [educationalStages, academicSubSystemId, isArabic]
  );

  useEffect(() => {
    if (educationalStages.length === 0) return;
    const gradeId = getValues('gradeId');
    if (gradeId && !gradeOptions.some((option) => option.value === gradeId)) {
      setValue('gradeId', '');
    }
  }, [gradeOptions, educationalStages.length, getValues, setValue]);

  const dayOptions = useMemo<PopupSelectOption[]>(
    () =>
      DAY_ORDER.map((day) => ({
        value: day,
        label: t(`academicCalendar.daysOfWeek.${day.toLowerCase()}`),
      })),
    [t]
  );

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    setFetchedCalendar(null);
    setFilledFrom(null);
    onClose();
  };

  const onSubmit = async (values: AddAcademicCalendarFormValues) => {
    const payload = buildPayload(values, schoolBranchId);
    try {
      const response = calendarId
        ? await dispatch(
            updateAcademicCalendar({ id: calendarId, data: { ...payload, id: calendarId } })
          ).unwrap()
        : await dispatch(createAcademicCalendar(payload)).unwrap();
      if (!response.isSuccess) {
        showToast({ message: t('common.errorOccurred'), type: 'error' });
        return;
      }
      handleClose();
      onSuccess?.(
        t(isEdit ? 'academicCalendar.toast.editSuccess' : 'academicCalendar.toast.addSuccess')
      );
    } catch {
      showToast({ message: t('common.errorOccurred'), type: 'error' });
    }
  };

  const yearModePlaceholder = t('academicCalendar.form.yearMode');

  const renderTimeField = (
    name:
      | 'dayStartTime'
      | 'dayEndTime'
      | 'breakStartTime'
      | 'breakEndTime'
      | 'assemblyStartTime'
      | 'assemblyEndTime'
      | 'breakfastStartTime'
      | 'breakfastEndTime',
    labelKey: string,
    placeholder?: string
  ) => (
    <PopupField name={name} label={t(labelKey)} required error={errors[name]?.message}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <PopupPickerInput
            name={field.name}
            type="time"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            hasError={Boolean(errors[name])}
          />
        )}
      />
    </PopupField>
  );

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      showHeader={false}
      placement="end"
      closeOnOverlayClick={false}
      panelClassName="max-w-[650px]! rounded-e-none rounded-s-lg border border-[#E2E8F0]/90 shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]! overflow-hidden"
      contentClassName="flex min-h-0 flex-col overflow-hidden! p-0!"
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#F1F5F9] px-8 pt-7 pb-[21px]">
        <div className="flex flex-col gap-1 text-start">
          <h2 className="text-xl leading-7 font-bold text-[black]">
            {t(isEdit ? 'academicCalendar.editTitle' : 'academicCalendar.addTitle')}
          </h2>
          <p className="text-xs leading-4 text-[#9D9D9D]">
            {t(isEdit ? 'academicCalendar.editSubtitle' : 'academicCalendar.addSubtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label={t('common.close')}
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#F1F5F9]"
        >
          <CustomImage src={CloseXGreenIcon} alt="" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-5 overflow-y-auto px-8 py-6 [&::-webkit-scrollbar]:w-1">
        {isLoadingCalendar ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 text-sm text-[#9D9D9D]">
            {t('common.loading')}
          </div>
        ) : null}
        <PopupField
          name="gradeId"
          label={t('academicCalendar.form.educationalStagesLabel')}
          required
          error={errors.gradeId?.message}
        >
          <Controller
            name="gradeId"
            control={control}
            render={({ field }) => (
              <PopupSelect
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={gradeOptions}
                placeholder={t('academicCalendar.form.educationalStagesPlaceholder')}
                hasError={Boolean(errors.gradeId)}
              />
            )}
          />
        </PopupField>

        <PopupField
          name="academicSubSystemId"
          label={t('academicCalendar.form.academicSystemLabel')}
          required
          error={errors.academicSubSystemId?.message}
        >
          <Controller
            name="academicSubSystemId"
            control={control}
            render={({ field }) => (
              <PopupSelect
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={academicSubSystemOptions}
                placeholder={t('academicCalendar.form.academicSystemPlaceholder')}
                hasError={Boolean(errors.academicSubSystemId)}
              />
            )}
          />
        </PopupField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(['studyStartDate', 'studyEndDate'] as const).map((name) => (
            <PopupField
              key={name}
              name={name}
              label={t(`academicCalendar.form.${name}Label`)}
              required
              error={errors[name]?.message}
            >
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <PopupPickerInput
                    name={field.name}
                    type="date"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      syncWeeksCount();
                    }}
                    onBlur={field.onBlur}
                    placeholder={t('common.chooseDate')}
                    hasError={Boolean(errors[name])}
                  />
                )}
              />
            </PopupField>
          ))}
        </div>

        {(
          [
            ['weeksCount', 'academicCalendar.form.weeksCountLabel'],
            ['lessonDuration', 'academicCalendar.form.lessonDurationLabel'],
          ] as const
        ).map(([name, labelKey]) => (
          <PopupField
            key={name}
            name={name}
            label={t(labelKey)}
            required
            error={errors[name]?.message}
          >
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <PopupTextInput
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputMode="numeric"
                  hasError={Boolean(errors[name])}
                />
              )}
            />
          </PopupField>
        ))}

        <PopupField
          name="days"
          label={t('academicCalendar.form.daysLabel')}
          required
          error={errors.days?.message}
        >
          <Controller
            name="days"
            control={control}
            render={({ field }) => (
              <PopupSelect
                multiple
                name={field.name}
                value={field.value ?? []}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={dayOptions}
                placeholder={t('academicCalendar.form.chooseDaysPlaceholder')}
                hasError={Boolean(errors.days)}
              />
            )}
          />
        </PopupField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {renderTimeField('dayStartTime', 'academicCalendar.form.schoolDayStartLabel')}
          {renderTimeField('dayEndTime', 'academicCalendar.form.schoolDayEndLabel')}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {renderTimeField(
            'breakStartTime',
            'academicCalendar.form.breakStartLabel',
            yearModePlaceholder
          )}
          {renderTimeField(
            'breakEndTime',
            'academicCalendar.form.breakEndLabel',
            yearModePlaceholder
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {renderTimeField(
            'assemblyStartTime',
            'academicCalendar.form.morningLineStartLabel',
            yearModePlaceholder
          )}
          {renderTimeField(
            'assemblyEndTime',
            'academicCalendar.form.morningLineEndLabel',
            yearModePlaceholder
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {renderTimeField(
            'breakfastStartTime',
            'academicCalendar.form.breakfastStartLabel',
            yearModePlaceholder
          )}
          {renderTimeField(
            'breakfastEndTime',
            'academicCalendar.form.breakfastEndLabel',
            yearModePlaceholder
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/70 px-8 pt-[21px] pb-5">
        <Button
          actionKey={isEdit ? 'edit' : 'add'}
          onClick={handleSubmit(onSubmit, scrollToFirstError)}
          disabled={isSaving || isLoadingCalendar}
          icon={isEdit ? undefined : <CustomImage src={PlusWhite16Icon} alt="" className="block" />}
          className="h-10 gap-2 rounded-lg! border-0! bg-[#1E7A52]! px-6! py-2.5! text-sm! leading-[19.6px] font-semibold! text-white! shadow-none! drop-shadow-[0px_1px_1px_rgba(5,150,105,0.2)] hover:bg-[#1E7A52]/90!"
        >
          {isSaving ? t('common.saving') : t(isEdit ? 'common.save' : 'common.add')}
        </Button>
        <button
          type="button"
          onClick={handleClose}
          className="h-[42px] rounded-lg border border-[#1E7A52] bg-white px-[25px] text-sm leading-5 font-medium text-[#1E7A52] transition-colors hover:bg-[#F0FDF4]"
        >
          {t('common.cancel')}
        </button>
      </div>
    </Modal>
  );
}
