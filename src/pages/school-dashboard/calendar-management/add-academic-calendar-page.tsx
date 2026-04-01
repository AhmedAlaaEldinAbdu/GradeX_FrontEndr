import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AcademicCalendarForm from './components/AcademicCalendarForm';
import { useAppDispatch } from '@/hooks/useRedux';
import { createAcademicCalendar } from '@/redux/features/academic-calendar/academicCalendarSlice';
import { useToast } from '@/shared/context/ToastContext';
import { getErrorMessage } from '@/lib/http';
import type { AcademicCalendarFormValues } from './components/AcademicCalendarForm';
import {
  toDaysEnumValues,
  type AcademicCalendarScheduleItem,
} from './components/AcademicCalendarForm';
import type {
  AcademicCalendarDaySchedule,
  AcademicCalendarTimedSchedule,
  CreateAcademicCalendarRequest,
} from '@/services/api/types/academic-calendar.types';
import { tokenManager } from '@gradex/lib/auth/token-manager';

const normalizeDateToApi = (value: string) => {
  if (!value) return value;
  if (value.includes('T')) return value;
  return `${value}T00:00:00.000Z`;
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

const mapFormValuesToCreateRequests = (
  values: AcademicCalendarFormValues,
  schoolBrancheId: string
): CreateAcademicCalendarRequest[] => {
  const lkSchoolStageId = values.educationalStageId;
  if (!lkSchoolStageId) return [];

  const daySchedules: AcademicCalendarDaySchedule[] = (values.schoolDaySchedules || []).map(
    (item) => ({
      days: toDaysEnumValues(item.days || []).map(Number),
      dayStartTime: item.startTime,
      dayEndTime: item.endTime,
    })
  );

  return [
    {
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
    },
  ];
};

export default function AddAcademicCalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.academicCalendar'), path: '/calendar/academic' },
    { label: t('academicCalendar.addTitle') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="academicCalendar.addTitle" />

      <AcademicCalendarForm
        mode="add"
        schoolBranchId={schoolBranchId}
        onCancel={() => navigate('/calendar/academic')}
        onSubmit={async (values: AcademicCalendarFormValues) => {
          if (!schoolBranchId) {
            showToast({
              message: 'common.errorOccurred',
              type: 'error',
            });
            return;
          }

          const requests = mapFormValuesToCreateRequests(values, schoolBranchId);

          if (requests.length === 0) {
            showToast({
              message: 'common.errorOccurred',
              type: 'error',
            });
            return;
          }

          try {
            const res = await dispatch(createAcademicCalendar(requests[0])).unwrap();
            if (!res.isSuccess) {
              showToast({
                message: 'common.errorOccurred',
                type: 'error',
              });
              return;
            }

            showToast({
              message: 'academicCalendar.toast.addSuccess',
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
    </div>
  );
}
