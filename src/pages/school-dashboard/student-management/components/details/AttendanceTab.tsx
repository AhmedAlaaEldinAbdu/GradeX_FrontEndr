import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import IconButton from '@/shared/components/IconButton';
import { getAttendanceStatusBadgeColor } from '@/shared/components/SharedBadges';
import CustomImage from '@/shared/components/CustomImage';
import MetricCard from '@/shared/components/MetricCard';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import TimeSyncIcon from '@gradex/assets/icons/TimeSync.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EarlyExitDetailsPopup from '../../popups/EarlyExitDetailsPopup';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentAttendanceByStudent } from '@/redux/features/student-attendance';
import { StudentAttendanceStatus } from '@/types/studentAttendance';
import type { StudentAttendanceByStudentDto } from '@/types/studentAttendance';
import { formatDateDisplay, formatTime } from '@/shared/common/common';

interface AttendanceTabProps {
  studentId: string;
}

interface EarlyExitInfo {
  exitTime: string;
  reason: string;
  reasonEn: string;
  delegate: string;
  delegateEn: string;
}

type AttendanceUiStatus = 'present' | 'absent' | 'late';

const STATUS_FILTER_TO_API: Record<AttendanceUiStatus, number> = {
  present: StudentAttendanceStatus.Present,
  absent: StudentAttendanceStatus.Absent,
  late: StudentAttendanceStatus.Late,
};

const mapApiStatus = (status: number): AttendanceUiStatus => {
  switch (status) {
    case StudentAttendanceStatus.Absent:
      return 'absent';
    case StudentAttendanceStatus.Late:
      return 'late';
    case StudentAttendanceStatus.Present:
    case StudentAttendanceStatus.EarlyLeave:
    default:
      return 'present';
  }
};

export default function AttendanceTab({ studentId }: AttendanceTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');

  const [searchDate, setSearchDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'' | AttendanceUiStatus>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeEarlyExit, setActiveEarlyExit] = useState<EarlyExitInfo | null>(null);
  const pageSize = 10;

  const attendances = useAppSelector((state) => state.studentAttendance.byStudent.attendances);
  const summary = useAppSelector((state) => state.studentAttendance.byStudent.summary);
  const pagination = useAppSelector((state) => state.studentAttendance.byStudent.pagination);
  const isLoading = useAppSelector((state) => state.studentAttendance.byStudent.isLoading);

  useEffect(() => {
    if (!studentId) return;
    if (activeTab !== 'attendance') return;
    dispatch(
      fetchStudentAttendanceByStudent({
        studentId,
        page: currentPage,
        limit: pageSize,
        status: selectedStatus ? STATUS_FILTER_TO_API[selectedStatus] : undefined,
        date: searchDate || undefined,
      })
    );
  }, [dispatch, studentId, activeTab, currentPage, selectedStatus, searchDate]);

  const records = useMemo(
    () =>
      attendances.map((row: StudentAttendanceByStudentDto) => ({
        id: row.id,
        date: row.date ? formatDateDisplay(row.date) : '-',
        status: mapApiStatus(row.status),
        attendanceTime: row.checkInTime ? formatTime(row.checkInTime, currentLang) : null,
        departureTime: row.checkOutTime ? formatTime(row.checkOutTime, currentLang) : null,
        earlyExit:
          row.earlyLeaveTime || row.earlyLeaveReason
            ? {
                exitTime: formatTime(row.earlyLeaveTime, currentLang),
                reason: row.earlyLeaveReason || '',
                reasonEn: row.earlyLeaveReason || '',
                delegate: '',
                delegateEn: '',
              }
            : null,
      })),
    [attendances, currentLang]
  );

  type AttendanceRecord = (typeof records)[number];

  const getStatusBadge = (status: 'present' | 'absent' | 'late') => {
    const labels: Record<'present' | 'absent' | 'late', string> = {
      present: t('attendance.present'),
      absent: t('attendance.absent'),
      late: t('attendance.late'),
    };
    return (
      <span
        className={`${getAttendanceStatusBadgeColor(status)} text-sm font-medium leading-[1.7251]`}
      >
        {labels[status]}
      </span>
    );
  };

  const headerCls = 'text-base font-normal leading-[1.7251] text-[#0E1F1F]';
  const cellCls = 'text-sm font-normal leading-[1.7251] text-[#646969]';

  const columns: DataTableColumn<AttendanceRecord>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index ?? 0) + 1,
      headerClassName: `w-12 ${headerCls}`,
      className: `text-center ${cellCls}`,
    },
    {
      header: t('attendance.date'),
      accessor: (row) => <span className={cellCls}>{row.date}</span>,
      headerClassName: `min-w-[120px] ${headerCls}`,
      className: `text-center ${cellCls}`,
    },
    {
      header: t('teachers.details.status'),
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: `min-w-[100px] ${headerCls}`,
      className: `text-center ${cellCls}`,
    },
    {
      header: t('attendance.attendanceTime'),
      accessor: (row) =>
        row.attendanceTime ? (
          <span className={cellCls}>{row.attendanceTime}</span>
        ) : (
          <span className={cellCls}>-</span>
        ),
      headerClassName: `min-w-[140px] ${headerCls}`,
      className: `text-center ${cellCls}`,
    },
    {
      header: t('teachers.details.checkOutTime'),
      accessor: (row) => <span className={cellCls}>{row.departureTime || '-'}</span>,
      headerClassName: `min-w-[120px] ${headerCls}`,
      className: `text-center ${cellCls}`,
    },
    {
      header: t('teachers.details.earlyDeparture'),
      accessor: (row) =>
        row.earlyExit ? (
          <div className="flex items-center justify-center gap-2">
            <span className={cellCls}>{row.earlyExit.exitTime}</span>
            <IconButton
              variant="blue"
              ariaLabel={t('students.details.earlyExitTitle')}
              onClick={() => setActiveEarlyExit(row.earlyExit)}
              className="h-10 w-10"
            >
              <CustomImage
                src={EyeStyledIcon}
                alt={t('students.details.earlyExitTitle')}
                className="h-6 w-6"
              />
            </IconButton>
          </div>
        ) : (
          <span className={cellCls}>-</span>
        ),
      headerClassName: `min-w-[160px] ${headerCls}`,
      className: `text-center ${cellCls}`,
    },
    {
      header: t('students.details.doneBy'),
      accessor: () => <span className={cellCls}>-</span>,
      headerClassName: `min-w-[160px] ${headerCls}`,
      className: `text-center ${cellCls}`,
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'custom',
      name: 'searchDate',
      placeholder: '',
      value: searchDate,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <Input
          type="date"
          value={searchDate}
          onChange={(e) => {
            setSearchDate(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('teachers.details.searchByDate')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'status-filter',
      placeholder: '',
      value: selectedStatus,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => {
            const next = Array.isArray(value) ? (value[0] ?? '') : value;
            setSelectedStatus((next as AttendanceUiStatus) || '');
            setCurrentPage(1);
          }}
          options={[
            { value: 'present', label: t('attendance.present') },
            { value: 'absent', label: t('attendance.absent') },
            { value: 'late', label: t('attendance.late') },
          ]}
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
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title={t('teachers.details.totalPresent')}
          value={summary.totalAttendance}
          icon={
            <CustomImage
              src={CheckCircleIcon}
              alt={t('teachers.details.totalPresent')}
              className="h-5 w-5"
            />
          }
          iconClassName="bg-[#E8F4EE]"
        />
        <MetricCard
          title={t('teachers.details.totalLate')}
          value={summary.totalLate}
          icon={
            <CustomImage
              src={TimeSyncIcon}
              alt={t('teachers.details.totalLate')}
              className="h-5 w-5"
            />
          }
          iconClassName="bg-[#FEF3E2]"
        />
        <MetricCard
          title={t('teachers.details.totalAbsent')}
          value={summary.totalAbsence}
          icon={
            <CustomImage
              src={XmarkCircleRedIcon}
              alt={t('teachers.details.totalAbsent')}
              className="h-5 w-5"
            />
          }
          iconClassName="bg-[#FCE8E8]"
        />
      </div>

      <Card>
        <DataTable
          data={records}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={{
            page: pagination.pageIndex || currentPage,
            limit: pagination.pageSize || pageSize,
            total: pagination.totalItems,
            totalPages: pagination.totalPages,
          }}
          onPageChange={setCurrentPage}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
          emptyMessage={t('teachers.details.noAttendanceRecords')}
          t={t}
        />
      </Card>

      <EarlyExitDetailsPopup
        isOpen={!!activeEarlyExit}
        onClose={() => setActiveEarlyExit(null)}
        details={activeEarlyExit}
      />
    </div>
  );
}
