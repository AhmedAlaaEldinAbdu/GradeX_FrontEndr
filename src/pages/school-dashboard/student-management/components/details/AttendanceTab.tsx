import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import IconButton from '@/shared/components/IconButton';
import { getAttendanceStatusBadgeColor } from '@/shared/components/SharedBadges';
import CustomImage from '@/shared/components/CustomImage';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import TimeSyncIcon from '@gradex/assets/icons/TimeSync.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EarlyExitDetailsPopup from '../../popups/EarlyExitDetailsPopup';

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

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  attendanceTime: string | null;
  attendanceTimeNote?: string | null;
  departureTime: string | null;
  earlyExit: EarlyExitInfo | null;
  doneByName: string;
  doneByNameEn: string;
  doneByRole: string;
  doneByRoleEn: string;
}

const mockSummary = {
  totalPresent: 89,
  totalLate: 15,
  totalAbsent: 13,
};

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    date: '22/2/2025',
    status: 'absent',
    attendanceTime: null,
    departureTime: null,
    earlyExit: null,
    doneByName: 'أحمد حسن',
    doneByNameEn: 'Ahmed Hassan',
    doneByRole: 'مدرس الرياضيات',
    doneByRoleEn: 'Math Teacher',
  },
  {
    id: '2',
    date: '22/2/2025',
    status: 'present',
    attendanceTime: '7:34 ص',
    departureTime: '3:30 م',
    earlyExit: null,
    doneByName: 'أحمد حسن',
    doneByNameEn: 'Ahmed Hassan',
    doneByRole: 'مدرس الرياضيات',
    doneByRoleEn: 'Math Teacher',
  },
  {
    id: '3',
    date: '22/2/2025',
    status: 'late',
    attendanceTime: '8:34 صباحا',
    attendanceTimeNote: 'ساعة',
    departureTime: '3:30 م',
    earlyExit: null,
    doneByName: 'أحمد حسن',
    doneByNameEn: 'Ahmed Hassan',
    doneByRole: 'مدرس الرياضيات',
    doneByRoleEn: 'Math Teacher',
  },
  {
    id: '4',
    date: '22/2/2025',
    status: 'present',
    attendanceTime: '7:34 ص',
    departureTime: '3:30 م',
    earlyExit: null,
    doneByName: 'أحمد حسن',
    doneByNameEn: 'Ahmed Hassan',
    doneByRole: 'مدرس الرياضيات',
    doneByRoleEn: 'Math Teacher',
  },
  {
    id: '5',
    date: '22/2/2025',
    status: 'present',
    attendanceTime: '7:34 ص',
    departureTime: '3:30 م',
    earlyExit: null,
    doneByName: 'أحمد حسن',
    doneByNameEn: 'Ahmed Hassan',
    doneByRole: 'مدرس الرياضيات',
    doneByRoleEn: 'Math Teacher',
  },
  {
    id: '6',
    date: '22/2/2025',
    status: 'present',
    attendanceTime: '7:34 ص',
    departureTime: '3:30 م',
    earlyExit: {
      exitTime: '12:00 مساءا',
      reason: 'مرض الطفل',
      reasonEn: 'Child illness',
      delegate: 'ولي الأمر',
      delegateEn: 'Guardian',
    },
    doneByName: 'أحمد حسن',
    doneByNameEn: 'Ahmed Hassan',
    doneByRole: 'مدرس الرياضيات',
    doneByRoleEn: 'Math Teacher',
  },
];

export default function AttendanceTab(_props: AttendanceTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchDate, setSearchDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeEarlyExit, setActiveEarlyExit] = useState<EarlyExitInfo | null>(null);
  const pageSize = 10;

  const filteredRecords = mockAttendanceRecords.filter((record) => {
    const matchesDate = !searchDate || record.date.includes(searchDate);
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    return matchesDate && matchesStatus;
  });

  const getStatusBadge = (status: 'present' | 'absent' | 'late') => {
    const labels: Record<'present' | 'absent' | 'late', string> = {
      present: t('attendance.present'),
      absent: t('attendance.absent'),
      late: t('attendance.late'),
    };
    return <span className={getAttendanceStatusBadgeColor(status)}>{labels[status]}</span>;
  };

  const columns: DataTableColumn<AttendanceRecord>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index ?? 0) + 1,
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: t('attendance.date'),
      accessor: (row) => <span>{row.date}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('teachers.details.status'),
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('attendance.attendanceTime'),
      accessor: (row) =>
        row.attendanceTime ? (
          <div className="flex flex-col items-center">
            <span>{row.attendanceTime}</span>
            {row.attendanceTimeNote && (
              <span className="text-xs text-[#9CA3AF]">{row.attendanceTimeNote}</span>
            )}
          </div>
        ) : (
          <span>-</span>
        ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: t('teachers.details.checkOutTime'),
      accessor: (row) => <span>{row.departureTime || '-'}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('teachers.details.earlyDeparture'),
      accessor: (row) =>
        row.earlyExit ? (
          <div className="flex items-center justify-center gap-2">
            <span>{row.earlyExit.exitTime}</span>
            <IconButton
              variant="blue"
              ariaLabel={t('students.details.earlyExitTitle')}
              onClick={() => setActiveEarlyExit(row.earlyExit)}
              className="h-8 w-8"
            >
              <CustomImage
                src={EyeStyledIcon}
                alt={t('students.details.earlyExitTitle')}
                className="h-4 w-4"
              />
            </IconButton>
          </div>
        ) : (
          <span>-</span>
        ),
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: t('students.details.doneBy'),
      accessor: (row) => (
        <div className="flex flex-col gap-1 text-start">
          <span className="text-sm font-normal text-[#646969]">
            {currentLang === 'ar' ? row.doneByName : row.doneByNameEn}
          </span>
          <span className="text-xs text-[#A9A7A7]">
            {currentLang === 'ar' ? row.doneByRole : row.doneByRoleEn}
          </span>
        </div>
      ),
      headerClassName: 'min-w-[160px]',
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
          type="search"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
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
          onChange={(value) => setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : value)}
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
        <SummaryCard
          icon={CheckCircleIcon}
          iconBg="bg-[#E8F4EE]"
          label={t('teachers.details.totalPresent')}
          value={mockSummary.totalPresent}
        />
        <SummaryCard
          icon={TimeSyncIcon}
          iconBg="bg-[#FEF3E2]"
          label={t('teachers.details.totalLate')}
          value={mockSummary.totalLate}
        />
        <SummaryCard
          icon={XmarkCircleRedIcon}
          iconBg="bg-[#FCE8E8]"
          label={t('teachers.details.totalAbsent')}
          value={mockSummary.totalAbsent}
        />
      </div>

      <Card>
        <DataTable
          data={filteredRecords}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total: filteredRecords.length,
            totalPages: Math.max(1, Math.ceil(filteredRecords.length / pageSize)),
          }}
          onPageChange={setCurrentPage}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          isLoading={false}
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

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: string;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#EDEDED] bg-white p-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-[#646969]">{label}</p>
        <p className="text-2xl font-semibold text-[#0E1F1F]">{value}</p>
      </div>
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        <CustomImage src={icon} alt="" className="h-5 w-5" />
      </div>
    </div>
  );
}
