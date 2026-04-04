import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import Loading from '@/shared/components/Loading';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import XmarkCircleIcon from '@gradex/assets/icons/XmarkCircle.svg';
import TimeSyncIcon from '@gradex/assets/icons/TimeSync.svg';
import VacationIcon from '@gradex/assets/icons/Vacation.svg';
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
import type { TeacherAttendanceDetailRecord } from '@/types/teacherAttendanceDetail';
import { AttendanceStatus } from '@/types/teacherAttendance';
import { formatTime, formatDateDisplay } from '@/shared/common/common';

interface AttendanceTabProps {
  teacherId: string;
  isActive?: boolean;
}

const ATTENDANCE_STATUS_OPTIONS = [
  { value: String(AttendanceStatus.Present), labelKey: 'teachers.details.present' },
  { value: String(AttendanceStatus.Absent), labelKey: 'teachers.details.absent' },
  { value: String(AttendanceStatus.Late), labelKey: 'teachers.details.late' },
];

export default function AttendanceTab({ teacherId, isActive = true }: AttendanceTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [searchDate, setSearchDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRecordAttendancePopup, setShowRecordAttendancePopup] = useState(false);
  const pageSize = 10;

  // Redux state
  const {
    teacherAttendanceRecords,
    teacherAttendanceSummary,
    attendancePagination,
    isLoadingAttendance,
    attendanceError,
  } = useAppSelector((state) => state.teachers);

  // Fetch data when tab becomes active
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
    };
  }, [dispatch, teacherId, currentPage, selectedStatus, isActive]);

  // Filter records by date locally (API doesn't support date filter)
  const filteredRecords = teacherAttendanceRecords.filter((record) => {
    if (searchDate && !record.date.includes(searchDate)) return false;
    return true;
  });

  const getStatusBadge = (status: number) => {
    const statusConfig: Record<number, { label: string; className: string }> = {
      [AttendanceStatus.Present]: {
        label: t('teachers.details.present'),
        className: 'bg-green-100 text-green-800',
      },
      [AttendanceStatus.Absent]: {
        label: t('teachers.details.absent'),
        className: 'bg-red-100 text-red-800',
      },
      [AttendanceStatus.Late]: {
        label: t('teachers.details.late'),
        className: 'bg-yellow-100 text-yellow-800',
      },
      [AttendanceStatus.EarlyLeave]: {
        label: t('attendance.earlyLeave'),
        className: 'bg-orange-100 text-orange-800',
      },
    };

    const config = statusConfig[status] || {
      label: t('teachers.details.notAvailable'),
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

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
      accessor: (row) => formatTime(row.checkInTime, currentLang),
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
        if (row.earlyLeaveTime) {
          return (
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
          );
        }
        return t('teachers.details.notAvailable');
      },
      headerClassName: 'min-w-[150px]',
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
      width: '30%',
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

  const handleRecordAttendance = () => {
    setShowRecordAttendancePopup(true);
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
      const errorMessage = typeof error === 'string' ? error : 'common.errorOccurred';
      const isApiError = typeof error === 'string' && error !== 'common.errorOccurred';
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: isApiError,
      });
    }
  };

  // Show loader when tab is not active or loading
  if (!isActive || (isLoadingAttendance && teacherAttendanceRecords.length === 0)) {
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
      {/* Record Attendance Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          imgSrc={PlusIcon}
          onClick={handleRecordAttendance}
          className="flex items-center gap-2"
        >
          <span>{t('teachers.details.recordAttendance')}</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                <img src={CheckCircleIcon} alt="present" className="h-6 w-6" />
              </div>
              <p className="text-xl text-gray-600">{t('teachers.details.totalPresent')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {teacherAttendanceSummary.totalPresent}
            </p>
          </div>
        </div>

        {/* Total Late */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
                <img src={TimeSyncIcon} alt="late" className="h-6 w-6" />
              </div>
              <p className="text-xl text-gray-600">{t('teachers.details.totalLate')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {teacherAttendanceSummary.totalLate}
            </p>
          </div>
        </div>

        {/* Total Absent */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                <img
                  src={XmarkCircleIcon}
                  alt="absent"
                  className="h-6 w-6"
                  style={{
                    filter:
                      'brightness(0) saturate(100%) invert(29%) sepia(69%) saturate(2278%) hue-rotate(336deg) brightness(104%) contrast(93%)',
                  }}
                />
              </div>
              <p className="text-xl text-gray-600">{t('teachers.details.totalAbsent')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {teacherAttendanceSummary.totalAbsent}
            </p>
          </div>
        </div>

        {/* Total Leave */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <img src={VacationIcon} alt="leave" className="h-6 w-6" />
              </div>
              <p className="text-xl text-gray-600">{t('teachers.details.totalLeave')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {teacherAttendanceSummary.totalLeave}
            </p>
          </div>
        </div>
      </div>

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
