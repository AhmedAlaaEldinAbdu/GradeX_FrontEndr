import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import Badge from '@/shared/components/Badge';

interface AttendanceTabProps {
  studentId: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  attendanceTime: string | null;
  departureTime: string | null;
  earlyDeparture: string | null;
  studentName: string;
  studentNameEn: string;
}

// Mock data matching the design
const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    date: '22/2/2025',
    status: 'absent',
    attendanceTime: null,
    departureTime: null,
    earlyDeparture: 'لا يوجد',
    studentName: 'أحمد حسن',
    studentNameEn: 'Ahmed Hassan',
  },
  {
    id: '2',
    date: '22/2/2025',
    status: 'present',
    attendanceTime: '7:34 ص',
    departureTime: '3:30 م',
    earlyDeparture: 'لا يوجد',
    studentName: 'أحمد حسن',
    studentNameEn: 'Ahmed Hassan',
  },
  {
    id: '3',
    date: '22/2/2025',
    status: 'late',
    attendanceTime: '8:30 ص (ساعة)',
    departureTime: '3:30 م',
    earlyDeparture: '2:45 م',
    studentName: 'أحمد حسن',
    studentNameEn: 'Ahmed Hassan',
  },
  {
    id: '4',
    date: '22/2/2025',
    status: 'present',
    attendanceTime: '7:34 ص',
    departureTime: '3:30 م',
    earlyDeparture: 'لا يوجد',
    studentName: 'أحمد حسن',
    studentNameEn: 'Ahmed Hassan',
  },
  {
    id: '5',
    date: '22/2/2025',
    status: 'present',
    attendanceTime: '7:34 ص',
    departureTime: '3:30 م',
    earlyDeparture: 'لا يوجد',
    studentName: 'أحمد حسن',
    studentNameEn: 'Ahmed Hassan',
  },
  {
    id: '6',
    date: '22/2/2025',
    status: 'present',
    attendanceTime: '7:34 ص',
    departureTime: '3:30 م',
    earlyDeparture: 'لا يوجد',
    studentName: 'أحمد حسن',
    studentNameEn: 'Ahmed Hassan',
  },
];

const mockSummary = {
  totalPresent: 89,
  totalLate: 15,
  totalAbsent: 13,
};

export default function AttendanceTab({ studentId }: AttendanceTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchDate, setSearchDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  console.log('Student ID:', studentId);

  // Filter records
  const filteredRecords = mockAttendanceRecords.filter((record) => {
    const matchesDate = !searchDate || record.date.includes(searchDate);
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    return matchesDate && matchesStatus;
  });

  const getStatusBadge = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present':
        return <Badge variant="success">{t('attendance.present')}</Badge>;
      case 'absent':
        return <Badge variant="danger">{t('attendance.absent')}</Badge>;
      case 'late':
        return <Badge variant="warning">{t('attendance.late')}</Badge>;
      default:
        return null;
    }
  };

  const columns: DataTableColumn<AttendanceRecord>[] = [
    {
      header: '#',
      accessor: (_, index) => <span>{(index ?? 0) + 1}</span>,
      headerClassName: 'min-w-[50px]',
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
      accessor: (row) => <span>{row.attendanceTime || '-'}</span>,
      headerClassName: 'min-w-[120px]',
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
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <span>{row.earlyDeparture || t('teachers.details.notAvailable')}</span>
          {row.earlyDeparture && row.earlyDeparture !== 'لا يوجد' && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('attendance.studentName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.studentName : row.studentNameEn}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
  ];

  const filters: FilterConfig[] = [
    {
      type: 'search',
      name: 'date',
      placeholder: t('teachers.details.searchByDate'),
      value: searchDate,
      onChange: (value) => setSearchDate(value as string),
      width: '40%',
    },
    {
      type: 'select',
      name: 'status',
      placeholder: t('teachers.details.filterByStatus'),
      value: selectedStatus,
      onChange: (value) => setSelectedStatus(value as string),
      options: [
        { value: 'present', label: t('attendance.present') },
        { value: 'absent', label: t('attendance.absent') },
        { value: 'late', label: t('attendance.late') },
      ],
      width: 'auto',
    },
  ];

  return (
    <div className="rounded-xl bg-white p-6">
      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Present */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div className="text-start">
            <p className="text-3xl font-bold text-gray-900">{mockSummary.totalPresent}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('teachers.details.totalPresent')}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Late */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div className="text-start">
            <p className="text-3xl font-bold text-gray-900">{mockSummary.totalLate}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('teachers.details.totalLate')}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <svg
                className="h-5 w-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Absent */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <div className="text-start">
            <p className="text-3xl font-bold text-gray-900">{mockSummary.totalAbsent}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('teachers.details.totalAbsent')}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table with Filters */}
      <div className="rounded-lg border border-gray-200 p-4">
        <DataTable
          data={filteredRecords}
          columns={columns}
          keyExtractor={(row) => row.id}
          filters={filters}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total: filteredRecords.length,
            totalPages: Math.ceil(filteredRecords.length / pageSize),
          }}
          onPageChange={setCurrentPage}
          isLoading={false}
          emptyMessage={t('teachers.details.noAttendanceRecords')}
          t={t}
        />
      </div>
    </div>
  );
}
