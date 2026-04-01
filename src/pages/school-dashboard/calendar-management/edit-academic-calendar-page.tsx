import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AcademicCalendarForm from './components/AcademicCalendarForm';
import { useEffect, useMemo } from 'react';
import Card from '@/shared/components/Card';
import Loading from '@/shared/components/Loading';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchAcademicCalendarById,
  updateAcademicCalendar,
} from '@/redux/features/academic-calendar/academicCalendarSlice';
import { useToast } from '@/shared/context/ToastContext';
import { getErrorMessage } from '@/lib/http';
import type { AcademicCalendarFormValues } from './components/AcademicCalendarForm';
import {
  toDaysEnumValues,
  type AcademicCalendarScheduleItem,
} from './components/AcademicCalendarForm';
import { Days as DaysEnum } from '@/shared/enums/enums';
import type {
  AcademicCalendarDaySchedule,
  AcademicCalendarEntity,
  AcademicCalendarTimedSchedule,
  CreateAcademicCalendarRequest,
  UpdateAcademicCalendarRequest,
} from '@/services/api/types/academic-calendar.types';
import { tokenManager } from '@gradex/lib/auth/token-manager';

type DayKey = AcademicCalendarScheduleItem['days'][number];

const isDayKey = (value: unknown): value is DayKey => {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(DaysEnum, value);
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeDateToApi = (value: string) => {
  if (!value) return value;
  if (value.includes('T')) return value;
  return `${value}T00:00:00.000Z`;
};

const normalizeTimeForInput = (value: string) => {
  if (!value) return '';

  if (value.includes('T')) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      const hours = `${d.getHours()}`.padStart(2, '0');
      const minutes = `${d.getMinutes()}`.padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }

  if (value.length >= 5) return value.slice(0, 5);
  return value;
};

const toDaysEnumKeys = (days: number[]): DayKey[] => {
  return (days || []).map((dayNumber) => (DaysEnum as any)[dayNumber] as unknown).filter(isDayKey);
};

const mapTimedGroup = (
  mode: 'year' | 'custom',
  items: AcademicCalendarScheduleItem[]
): AcademicCalendarTimedSchedule[] => {
  const list = items?.length ? items : [{ id: '0', days: [], startTime: '', endTime: '' }];

  if (mode === 'year') {
    const first = list[0];
    return [
      {
        timePeriodScope: 1,
        startTime: first.startTime,
        endTime: first.endTime,
        days: [],
      },
    ];
  }

  return list.map((item) => ({
    timePeriodScope: 2,
    startTime: item.startTime,
    endTime: item.endTime,
    days: toDaysEnumValues(item.days || []).map(Number),
  }));
};

const mapFormValuesToCreateRequest = (
  values: AcademicCalendarFormValues,
  schoolBrancheId: string,
  lkSchoolStageId: string
): CreateAcademicCalendarRequest => {
  const daySchedules: AcademicCalendarDaySchedule[] = (values.schoolDaySchedules || []).map(
    (item) => ({
      days: toDaysEnumValues(item.days || []).map(Number),
      dayStartTime: item.startTime,
      dayEndTime: item.endTime,
    })
  );

  return {
    schoolBrancheId,
    lkSchoolStageId,
    studyStartDate: normalizeDateToApi(values.studyStartDate),
    studyEndDate: normalizeDateToApi(values.studyEndDate),
    weeksCount: values.weeksCount === '' ? 0 : Number(values.weeksCount),
    lessonDuration: Number(values.lessonDuration || 0),
    daySchedules,
    breaks: mapTimedGroup(values.breakBetweenClassesMode, values.breakBetweenClassesSchedules),
    assemblies: mapTimedGroup(values.morningLineMode, values.morningLineSchedules),
    breakfasts: mapTimedGroup(values.breakfastMode, values.breakfastSchedules),
  };
};

const mapFormValuesToUpdateRequest = (
  values: AcademicCalendarFormValues,
  schoolBrancheId: string,
  lkSchoolStageId: string,
  id: string
): UpdateAcademicCalendarRequest => {
  const createReq = mapFormValuesToCreateRequest(values, schoolBrancheId, lkSchoolStageId);
  return {
    ...createReq,
    id,
  };
};

const mapApiEntityToFormInitialValues = (
  entity: AcademicCalendarEntity
): Partial<AcademicCalendarFormValues> => {
  const mapDaySchedules = (items: AcademicCalendarDaySchedule[] | undefined) => {
    const list = items || [];
    if (list.length === 0) {
      return [{ id: createId(), days: [], startTime: '', endTime: '' }];
    }

    return list.map((item) => ({
      id: createId(),
      days: toDaysEnumKeys(item.days || []),
      startTime: normalizeTimeForInput(item.dayStartTime),
      endTime: normalizeTimeForInput(item.dayEndTime),
    }));
  };

  const mapTimed = (items: AcademicCalendarTimedSchedule[] | undefined) => {
    const list = items || [];
    if (list.length === 0) {
      return {
        mode: 'custom' as const,
        items: [{ id: createId(), days: [], startTime: '', endTime: '' }],
      };
    }

    const inferredMode: 'year' | 'custom' = list.some((x) => x.timePeriodScope === 1)
      ? 'year'
      : 'custom';

    return {
      mode: inferredMode,
      items: list.map((item) => ({
        id: createId(),
        days: inferredMode === 'year' ? [] : toDaysEnumKeys(item.days || []),
        startTime: normalizeTimeForInput(item.startTime),
        endTime: normalizeTimeForInput(item.endTime),
      })),
    };
  };

  const breaks = mapTimed(entity.breaks);
  const assemblies = mapTimed(entity.assemblies);
  const breakfasts = mapTimed(entity.breakfasts);

  return {
    educationalStageId: entity.lkSchoolStageId ?? '',
    studyStartDate: entity.studyStartDate ? entity.studyStartDate.slice(0, 10) : '',
    studyEndDate: entity.studyEndDate ? entity.studyEndDate.slice(0, 10) : '',
    weeksCount: entity.weeksCount ?? '',
    lessonDuration: entity.lessonDuration !== undefined ? String(entity.lessonDuration) : '60',

    schoolDaySchedules: mapDaySchedules(entity.daySchedules),

    breakBetweenClassesMode: breaks.mode,
    breakBetweenClassesSchedules: breaks.items,

    morningLineMode: assemblies.mode,
    morningLineSchedules: assemblies.items,

    breakfastMode: breakfasts.mode,
    breakfastSchedules: breakfasts.items,
  };
};

export default function EditAcademicCalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  const { currentCalendar, isLoading } = useAppSelector((state) => state.academicCalendar);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchAcademicCalendarById(id));
  }, [dispatch, id]);

  const initialValues = useMemo(
    () => (currentCalendar ? mapApiEntityToFormInitialValues(currentCalendar) : undefined),
    [currentCalendar]
  );

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.academicCalendar'), path: '/calendar/academic' },
    { label: t('academicCalendar.editTitle') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="academicCalendar.editTitle" />

      {!id ? (
        <Card>
          <div className="p-6 text-center text-gray-600">{t('common.errorOccurred')}</div>
        </Card>
      ) : isLoading && !currentCalendar ? (
        <Card>
          <Loading />
        </Card>
      ) : currentCalendar && initialValues ? (
        <AcademicCalendarForm
          key={currentCalendar.id}
          mode="edit"
          schoolBranchId={schoolBranchId}
          onCancel={() => navigate('/calendar/academic')}
          initialValues={initialValues}
          onSubmit={async (values: AcademicCalendarFormValues) => {
            try {
              if (!schoolBranchId) {
                showToast({
                  message: 'common.errorOccurred',
                  type: 'error',
                });
                return;
              }

              const stageId = values.educationalStageId || currentCalendar.lkSchoolStageId;
              const req = mapFormValuesToUpdateRequest(
                values,
                schoolBranchId,
                stageId,
                currentCalendar.id
              );

              const res = await dispatch(
                updateAcademicCalendar({ id: currentCalendar.id, data: req })
              ).unwrap();

              if (!res.isSuccess) {
                showToast({
                  message: 'common.errorOccurred',
                  type: 'error',
                });
                return;
              }

              showToast({
                message: 'academicCalendar.toast.editSuccess',
                type: 'success',
              });
              navigate('/calendar/academic');
            } catch (error) {
              showToast({
                message: getErrorMessage(error),
                type: 'error',
                isRaw: true,
              });
            }
          }}
        />
      ) : (
        <Card>
          <div className="p-6 text-center text-gray-600">{t('common.noResults')}</div>
        </Card>
      )}
    </div>
  );
}
