import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import { mockTeacherDetails, type TeacherAttendanceRecord } from '../../data/mockTeacherData';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

interface AttendanceTabProps {
  teacherId: string;
}

const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present', labelKey: 'teachers.details.present' },
  { value: 'absent', labelKey: 'teachers.details.absent' },
  { value: 'late', labelKey: 'teachers.details.late' },
];

export default function AttendanceTab({ teacherId }: AttendanceTabProps) {
  const { t } = useTranslation();

  console.log('Teacher ID for API:', teacherId);

  const [searchDate, setSearchDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Use mock data for now
  const attendanceSummary = mockTeacherDetails.attendanceSummary;
  const attendanceRecords = mockTeacherDetails.attendanceRecords;

  // Filter records based on status
  const filteredRecords = attendanceRecords.filter((record) => {
    if (selectedStatus && record.status !== selectedStatus) return false;
    if (searchDate && !record.date.includes(searchDate)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: 'present' | 'absent' | 'late') => {
    const statusConfig = {
      present: {
        label: t('teachers.details.present'),
        className: 'bg-green-100 text-green-800',
      },
      absent: {
        label: t('teachers.details.absent'),
        className: 'bg-red-100 text-red-800',
      },
      late: {
        label: t('teachers.details.late'),
        className: 'bg-yellow-100 text-yellow-800',
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const columns: DataTableColumn<TeacherAttendanceRecord>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index || 0) + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'teachers.details.date',
      accessor: (row) => row.date,
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
      accessor: (row) => row.checkInTime || t('teachers.details.notAvailable'),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'teachers.details.checkOutTime',
      accessor: (row) => row.checkOutTime || t('teachers.details.notAvailable'),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'teachers.details.earlyDeparture',
      accessor: (row) => {
        if (row.earlyDeparture) {
          return (
            <div className="flex items-center justify-center gap-1">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-yellow-600">⚠</span>
              </span>
              <span>{row.earlyDeparture}</span>
            </div>
          );
        }
        return t('teachers.details.notAvailable');
      },
      headerClassName: 'min-w-[120px]',
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
  };

  const handleTeacherPreparation = () => {
    // TODO: Implement teacher preparation functionality
    console.log('Prepare teacher:', teacherId);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Preparation Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          imgSrc={PlusIcon}
          onClick={handleTeacherPreparation}
          className="flex items-center gap-2"
        >
          <span>{t('teachers.details.teacherPreparation')}</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalPresent')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {attendanceSummary.totalPresent}
            </p>
          </div>
        </Card>

        {/* Total Late */}
        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalLate')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{attendanceSummary.totalLate}</p>
          </div>
        </Card>

        {/* Total Absent */}
        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalAbsent')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{attendanceSummary.totalAbsent}</p>
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <DataTable
          data={paginatedRecords}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total: filteredRecords.length,
            totalPages: totalPages,
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
    </div>
  );
}
