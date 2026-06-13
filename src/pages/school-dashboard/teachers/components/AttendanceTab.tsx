import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Loading from '@/shared/components/Loading';
import MetricCard from '@/shared/components/MetricCard';
import IconButton from '@/shared/components/IconButton';
import { getAttendanceStatusBadgeColor } from '@/shared/components/SharedBadges';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import XmarkCircleIcon from '@gradex/assets/icons/XmarkCircle.svg';
import TimeSyncIcon from '@gradex/assets/icons/TimeSync.svg';
import VacationIcon from '@gradex/assets/icons/Vacation.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EyeStyledDarkBlueIcon from '@gradex/assets/icons/EyeStyledDarkBlue.svg';
import NotificationIcon from '@gradex/assets/icons/Notification.svg';
import { useToast } from '@/shared/context/ToastContext';
import RecordAttendancePopup, {
  type TeacherPreparationFormValues,
} from '../popups/TeacherPreparationPopup';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchTeacherAttendanceDetails,
  clearTeacherAttendance,
  clearAttendanceFilters,
} from '@/redux/features/teachers/teachersSlice';
import { teacherAttendanceApiService } from '@/services/api/teacher-attendance/teacher-attendance.service';
import { getBackendMessage } from '@/lib/http';
import type { TeacherAttendanceDetailRecord } from '@/types/teacherAttendanceDetail';
import { AttendanceStatus } from '@/types/teacherAttendance';
import { formatTime, formatDateDisplay } from '@/shared/common/common';

interface AttendanceTabProps {
  teacherId: string;
  isActive?: boolean;
  showRecordAttendancePopup?: boolean;
  setShowRecordAttendancePopup?: (open: boolean) => void;
}

const ATTENDANCE_STATUS_OPTIONS = [
  { value: String(AttendanceStatus.Present), labelKey: 'teachers.details.present' },
  { value: String(AttendanceStatus.Absent), labelKey: 'teachers.details.absent' },
  { value: String(AttendanceStatus.Late), labelKey: 'teachers.details.late' },
];

export default function AttendanceTab({
  teacherId,
  isActive = true,
  showRecordAttendancePopup: showRecordAttendancePopupProp,
  setShowRecordAttendancePopup: setShowRecordAttendancePopupProp,
}: AttendanceTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  // Same source-detection rule used by the teacher details page.
  const isFromAttendance = location.pathname.startsWith('/employees/attendance/teachers/');

  const [searchDate, setSearchDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRecordAttendancePopupLocal, setShowRecordAttendancePopupLocal] = useState(false);
  const showRecordAttendancePopup = showRecordAttendancePopupProp ?? showRecordAttendancePopupLocal;
  const setShowRecordAttendancePopup =
    setShowRecordAttendancePopupProp ?? setShowRecordAttendancePopupLocal;
  const pageSize = 10;

  // Refs for tracking initial load
  const hasDoneInitialLoad = useRef(false);
  const prevLoadingRef = useRef(false);
  const isFirstFilterRun = useRef(true);

  // Redux state
  const {
    teacherAttendanceRecords,
    teacherAttendanceSummary,
    attendancePagination,
    isLoadingAttendance,
    attendanceError,
  } = useAppSelector((state) => state.teachers);

  // Snapshot of summary — only updated on first successful load
  const [localSummary, setLocalSummary] = useState(teacherAttendanceSummary);

  // Detect first load completion and snapshot the summary
  useEffect(() => {
    if (prevLoadingRef.current && !isLoadingAttendance && !hasDoneInitialLoad.current) {
      hasDoneInitialLoad.current = true;
      setLocalSummary(teacherAttendanceSummary);
    }
    prevLoadingRef.current = isLoadingAttendance;
  }, [isLoadingAttendance, teacherAttendanceSummary]);

  // Initial fetch when tab becomes active — also handles cleanup on deactivation
  useEffect(() => {
    if (teacherId && isActive) {
      dispatch(
        fetchTeacherAttendanceDetails({
          teacherId,
          page: currentPage,
          limit: pageSize,
          filters: {
            status: selectedStatus ? Number(selectedStatus) : undefined,
          },
        })
      );
    }

    return () => {
      dispatch(clearTeacherAttendance());
      hasDoneInitialLoad.current = false;
      prevLoadingRef.current = false;
      isFirstFilterRun.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, teacherId, isActive]);

  // Re-fetch when filter or page changes (skip the very first run — initial load handles it)
  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    if (teacherId && isActive) {
      dispatch(
        fetchTeacherAttendanceDetails({
          teacherId,
          page: currentPage,
          limit: pageSize,
          filters: {
            status: selectedStatus ? Number(selectedStatus) : undefined,
          },
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedStatus]);

  // Filter records by date locally (API doesn't support date filter)
  const filteredRecords = teacherAttendanceRecords.filter((record) => {
    if (searchDate && !record.date.includes(searchDate)) return false;
    return true;
  });

  const getStatusKey = (status: number): 'present' | 'absent' | 'late' | 'leave' => {
    switch (status) {
      case AttendanceStatus.Present:
        return 'present';
      case AttendanceStatus.Absent:
        return 'absent';
      case AttendanceStatus.Late:
      case AttendanceStatus.EarlyLeave:
        return 'late';
      case 5:
        return 'leave';
      default:
        return 'present';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case AttendanceStatus.Present:
        return t('teachers.details.present');
      case AttendanceStatus.Absent:
        return t('teachers.details.absent');
      case AttendanceStatus.Late:
        return t('teachers.details.late');
      case AttendanceStatus.EarlyLeave:
        return t('attendance.earlyLeave');
      case 5:
        return t('teachers.details.leave');
      default:
        return t('teachers.details.notAvailable');
    }
  };

  const getStatusBadge = (status: number) => (
    <span className={getAttendanceStatusBadgeColor(getStatusKey(status))}>
      {getStatusLabel(status)}
    </span>
  );

  const columns: DataTableColumn<TeacherAttendanceDetailRecord>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index || 0) + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'teachers.details.date',
      accessor: (row) => formatDateDisplay(row.date),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'teachers.details.status',
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'teachers.details.checkInTime',
      accessor: (row) => {
        if (row.status === AttendanceStatus.Absent) {
          return (
            <span className={getAttendanceStatusBadgeColor('absent')}>
              {t('teachers.details.absent')}
            </span>
          );
        }
        if (row.status === AttendanceStatus.Late || row.status === AttendanceStatus.EarlyLeave) {
          return (
            <span className={getAttendanceStatusBadgeColor('late')}>
              {t('teachers.details.lateHour')}
            </span>
          );
        }
        return formatTime(row.checkInTime, currentLang);
      },
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'teachers.details.checkOutTime',
      accessor: (row) => formatTime(row.checkOutTime, currentLang),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'teachers.details.earlyDeparture',
      accessor: (row) => {
        const hasEarlyLeave = !!row.earlyLeaveTime;
        const valueNode = hasEarlyLeave ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-yellow-600">⚠</span>
              </span>
              <span>{formatTime(row.earlyLeaveTime, currentLang)}</span>
            </div>
            {row.earlyLeaveReason && (
              <span className="text-xs text-gray-500">{row.earlyLeaveReason}</span>
            )}
          </div>
        ) : (
          <span>{t('teachers.details.notAvailable')}</span>
        );

        // Eye visibility:
        //   teaching-staff flow → always shown
        //   attendance flow     → only when there's early-leave data
        const showEye = isFromAttendance ? hasEarlyLeave : true;

        return (
          <div className="flex items-center justify-center gap-3">
            {valueNode}
            {showEye && (
              <IconButton
                variant="blue"
                ariaLabel={t('common.view')}
                onClick={() =>
                  navigate(`/teaching-staff/teachers/${teacherId}/attendance/${row.id}`)
                }
              >
                <CustomImage src={EyeStyledIcon} alt="" className="h-5 w-5" />
              </IconButton>
            )}
          </div>
        );
      },
      headerClassName: 'min-w-[210px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchDate',
      placeholder: t('teachers.details.searchByDate'),
      value: searchDate,
      onChange: (value) => setSearchDate(value as string),
      width: '40%',
    },
    {
      type: 'custom',
      name: 'status-filter',
      placeholder: '',
      value: selectedStatus,
      onChange: () => {},
      width: '12%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={ATTENDANCE_STATUS_OPTIONS.map((status) => ({
            value: status.value,
            label: t(status.labelKey),
          }))}
          placeholder={t('teachers.details.filterByStatus')}
          maxHeight="200px"
          showSearch={false}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchDate('');
    setSelectedStatus('');
    setCurrentPage(1);
    dispatch(clearAttendanceFilters());
  };

  const handlePreparationSubmit = async (values: TeacherPreparationFormValues) => {
    try {
      await teacherAttendanceApiService.createAttendance({
        teacherId,
        date: values.date,
        checkInTime: values.checkInTime,
        checkOutTime: values.checkOutTime,
      });

      setShowRecordAttendancePopup(false);

      showToast({
        message: 'teachers.details.attendanceUpdatedSuccessfully',
        type: 'success',
      });

      dispatch(
        fetchTeacherAttendanceDetails({
          teacherId,
          page: currentPage,
          limit: pageSize,
          filters: {
            status: selectedStatus ? Number(selectedStatus) : undefined,
          },
        })
      );
    } catch (error) {
      setShowRecordAttendancePopup(false);
      showToast({
        message: getBackendMessage(error) || 'common.errorOccurred',
        type: 'error',
        isRaw: !!getBackendMessage(error),
      });
    }
  };

  // Show full-page loader only on the very first load (before summary cards have data)
  if (!isActive || (!hasDoneInitialLoad.current && isLoadingAttendance)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (attendanceError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">{attendanceError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards — 3 cards on the attendance flow, 4 on teaching-staff */}
      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${
          isFromAttendance ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
        }`}
      >
        <MetricCard
          title={t('teachers.details.totalPresent')}
          value={localSummary.totalPresent}
          icon={
            <CustomImage
              src={CheckCircleIcon}
              alt={t('teachers.details.totalPresent')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-green-100 text-green-600"
        />
        <MetricCard
          title={t('teachers.details.totalLate')}
          value={localSummary.totalLate}
          icon={
            <CustomImage
              src={TimeSyncIcon}
              alt={t('teachers.details.totalLate')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-yellow-100 text-yellow-600"
        />
        <MetricCard
          title={t('teachers.details.totalAbsent')}
          value={localSummary.totalAbsent}
          icon={
            <CustomImage
              src={XmarkCircleIcon}
              alt={t('teachers.details.totalAbsent')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-red-100 text-red-600"
        />
        {!isFromAttendance && (
          <MetricCard
            title={t('teachers.details.totalLeave')}
            value={localSummary.totalLeave}
            icon={
              <CustomImage
                src={VacationIcon}
                alt={t('teachers.details.totalLeave')}
                className="h-6 w-6"
              />
            }
            iconClassName="bg-blue-100 text-blue-600"
            valueAction={
              <button
                type="button"
                onClick={() => navigate(`/teaching-staff/teachers/${teacherId}?tab=leaves`)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(9,9,177,0.1)] transition-colors hover:bg-[rgba(9,9,177,0.18)]"
                aria-label={t('common.view')}
              >
                <CustomImage src={EyeStyledDarkBlueIcon} alt="" className="h-5 w-5" />
              </button>
            }
          />
        )}
      </div>

      {/* Pending leave-request reminder banner — teaching-staff flow only */}
      {!isFromAttendance && (
        <div className="flex hidden items-center justify-start gap-3 rounded-2xl border border-[#FFEBB1] bg-[#FFF8E3] px-4 py-3 shadow-[0px_1px_12px_1px_rgba(0,0,0,0.06)]">
          <CustomImage src={NotificationIcon} alt="" className="h-6 w-6 shrink-0" />
          <span className="text-base font-normal text-[#0E1F1F]">
            {t('teachers.details.leaveRequestReminder', { date: '22/2/2025' })}
          </span>
        </div>
      )}

      {/* Attendance Table */}
      <Card>
        <DataTable
          data={filteredRecords}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={{
            page: attendancePagination.page,
            limit: attendancePagination.limit,
            total: attendancePagination.total,
            totalPages: attendancePagination.totalPages,
          }}
          onPageChange={setCurrentPage}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          isLoading={isLoadingAttendance}
          emptyMessage={t('teachers.details.noAttendanceRecords')}
          t={t}
        />
      </Card>

      {/* Record Attendance Popup */}
      <RecordAttendancePopup
        isOpen={showRecordAttendancePopup}
        onClose={() => setShowRecordAttendancePopup(false)}
        onSubmit={handlePreparationSubmit}
        teacherId={teacherId}
      />
    </div>
  );
}
