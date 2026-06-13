import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AcademicCalendarForm from './components/AcademicCalendarForm';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { useAppDispatch } from '@/hooks/useRedux';
import { createAcademicCalendar } from '@/redux/features/academic-calendar/academicCalendarSlice';
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
import { resolveErrorMessage } from '@/lib/http';

const normalizeDateToApi = (value: string) => {
  if (!value) return value;
  if (value.includes('T')) return value;
  return `${value}T00:00:00.000Z`;
};

const mapTimedGroup = (
  mode: 'year' | 'custom',
  items: AcademicCalendarScheduleItem[],
  allSchoolDays: number[]
): AcademicCalendarTimedSchedule[] => {
  const list = items?.length ? items : [{ id: '0', days: [], startTime: '', endTime: '' }];

  if (mode === 'year') {
    const first = list[0];
    return [
      {
        timePeriodScope: 1,
        startTime: first.startTime,
        endTime: first.endTime,
        days: allSchoolDays,
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
  const gradeId = values.educationalStageId;
  if (!gradeId) return [];

  const daySchedules: AcademicCalendarDaySchedule[] = (values.schoolDaySchedules || []).map(
    (item) => ({
      days: toDaysEnumValues(item.days || []).map(Number),
      dayStartTime: item.startTime,
      dayEndTime: item.endTime,
    })
  );

  const allSchoolDays = Array.from(new Set(daySchedules.flatMap((ds) => ds.days)));

  return [
    {
      schoolBrancheId,
      gradeId,
      studyStartDate: normalizeDateToApi(values.studyStartDate),
      studyEndDate: normalizeDateToApi(values.studyEndDate),
      weeksCount: values.weeksCount === '' ? 0 : Number(values.weeksCount),
      lessonDuration: Number(values.lessonDuration || 0),
      daySchedules,
      breaks: mapTimedGroup(
        values.breakBetweenClassesMode,
        values.breakBetweenClassesSchedules,
        allSchoolDays
      ),
      assemblies: mapTimedGroup(values.morningLineMode, values.morningLineSchedules, allSchoolDays),
      breakfasts: mapTimedGroup(values.breakfastMode, values.breakfastSchedules, allSchoolDays),
    },
  ];
};

export default function AddAcademicCalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isMessageRaw?: boolean;
  }>({ show: false, type: 'success', message: '' });

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.annualCalendar'), path: '/calendar/academic' },
    { label: t('academicCalendar.addTitle') },
  ];

  return (
    <>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader title="academicCalendar.addTitle" />

        <AcademicCalendarForm
          mode="add"
          schoolBranchId={schoolBranchId}
          onCancel={() => navigate('/calendar/academic')}
          onSubmit={async (values: AcademicCalendarFormValues) => {
            if (!schoolBranchId) {
              setShowPopupMessage({
                show: true,
                type: 'error',
                message: t('common.errorOccurred'),
              });
              return;
            }

            const requests = mapFormValuesToCreateRequests(values, schoolBranchId);

            if (requests.length === 0) {
              setShowPopupMessage({
                show: true,
                type: 'error',
                message: t('common.errorOccurred'),
              });
              return;
            }

            try {
              const res = await dispatch(createAcademicCalendar(requests[0])).unwrap();
              if (!res.isSuccess) {
                setShowPopupMessage({
                  show: true,
                  type: 'error',
                  message: res?.message || 'common.errorOccurred',
                  isMessageRaw: Boolean(res?.message),
                });
                return;
              }

              setShowPopupMessage({
                show: true,
                type: 'success',
                message: t('academicCalendar.toast.addSuccess'),
              });
            } catch (error) {
              console.error('Failed to add academic calendar:', error);
              const { message, isRaw } = resolveErrorMessage(error);
              setShowPopupMessage({
                show: true,
                type: 'error',
                message,
                isMessageRaw: isRaw,
              });
            }
          }}
        />
      </div>

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        message={showPopupMessage.message}
        isMessageRaw={showPopupMessage.isMessageRaw}
        onClose={() => {
          setShowPopupMessage({ show: false, type: 'success', message: '' });
          if (showPopupMessage.type === 'success') {
            navigate('/calendar/academic');
          }
        }}
      />
    </>
  );
}
