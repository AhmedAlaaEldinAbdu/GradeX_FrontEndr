import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type DataTableColumn } from '@/shared/components/DataTable';
import Badge from '@/shared/components/Badge';

interface HomeworkTabProps {
  studentId: string;
}

interface HomeworkRecord {
  id: string;
  subjectName: string;
  subjectNameEn: string;
  hasHomework: boolean;
  status: 'excellent' | 'veryGood' | 'good' | 'struggling' | 'weak';
  date: string;
  finalResult: string;
  notes: string;
  notesEn: string;
}

// Mock data matching the design
const mockHomeworkRecords: HomeworkRecord[] = [
  {
    id: '1',
    subjectName: 'اللغة الفرنسية',
    subjectNameEn: 'French',
    hasHomework: true,
    status: 'excellent',
    date: '1-1-2020',
    finalResult: '29/30',
    notes: 'لا ي',
    notesEn: 'N/A',
  },
  {
    id: '2',
    subjectName: 'اللغة العربية',
    subjectNameEn: 'Arabic',
    hasHomework: true,
    status: 'good',
    date: '1-1-2021',
    finalResult: '20/30',
    notes: 'لا ي',
    notesEn: 'N/A',
  },
  {
    id: '3',
    subjectName: 'اللغة الإنجليزية',
    subjectNameEn: 'English',
    hasHomework: true,
    status: 'weak',
    date: '1-1-2021',
    finalResult: '5/30',
    notes: 'لا ي',
    notesEn: 'N/A',
  },
  {
    id: '4',
    subjectName: 'الرياضيات',
    subjectNameEn: 'Mathematics',
    hasHomework: true,
    status: 'veryGood',
    date: '1-1-2021',
    finalResult: '25/30',
    notes: 'لا ي',
    notesEn: 'N/A',
  },
];

export default function HomeworkTab({ studentId }: HomeworkTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  console.log('Student ID:', studentId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge variant="success">{t('performance.excellent')}</Badge>;
      case 'veryGood':
        return (
          <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">
            {t('performance.veryGood')}
          </span>
        );
      case 'good':
        return <Badge variant="warning">{t('performance.good')}</Badge>;
      case 'struggling':
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
            {t('performance.struggling')}
          </span>
        );
      case 'weak':
        return <Badge variant="danger">{t('performance.weak')}</Badge>;
      default:
        return null;
    }
  };

  const statusOptions = [
    { value: 'excellent', label: t('performance.excellent') },
    { value: 'veryGood', label: t('performance.veryGood') },
    { value: 'good', label: t('performance.good') },
    { value: 'struggling', label: t('performance.struggling') },
    { value: 'weak', label: t('performance.weak') },
  ];

  // Filter records
  const filteredRecords = mockHomeworkRecords.filter((record) => {
    const subjectName = currentLang === 'ar' ? record.subjectName : record.subjectNameEn;
    const matchesSearch =
      !searchQuery || subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    const matchesDate = !selectedDate || record.date.includes(selectedDate);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const columns: DataTableColumn<HomeworkRecord>[] = [
    {
      header: '#',
      accessor: (_, index) => <span>{(index ?? 0) + 1}</span>,
      headerClassName: 'min-w-[50px]',
      className: 'text-center',
    },
    {
      header: t('homework.subjectName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.subjectName : row.subjectNameEn}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('homework.assignment'),
      accessor: (row) =>
        row.hasHomework ? (
          <div className="flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-100">
              <span className="text-xs font-semibold text-red-600">PDF</span>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
      headerClassName: 'min-w-[80px]',
      className: 'text-center',
    },
    {
      header: t('homework.status'),
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('homework.date'),
      accessor: (row) => <span>{row.date}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('homework.finalResult'),
      accessor: (row) => <span className="font-semibold">{row.finalResult}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('homework.notes'),
      accessor: (row) => (
        <span className="text-gray-600">{currentLang === 'ar' ? row.notes : row.notesEn}</span>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  const pageSize = 10;

  return (
    <div className="rounded-xl bg-white p-6">
      <div className="relative mb-4 flex items-center justify-end py-2">
        <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          {t('homework.showByDay')}
        </button>
      </div>

      <div className="mb-4 flex items-center justify-start gap-3">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('homework.searchSubject')}
            className="h-10 w-64 rounded-lg border border-gray-200 pe-4 ps-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <svg
            className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Status dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">{t('homework.status')}</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Date filter */}
        <div className="relative">
          <input
            type="text"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            placeholder={t('homework.date')}
            className="h-10 w-32 rounded-lg border border-gray-200 pe-10 ps-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <svg
            className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-gray-200">
        <DataTable
          data={filteredRecords}
          columns={columns}
          keyExtractor={(row) => row.id}
          showFilters={false}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total: filteredRecords.length,
            totalPages: Math.ceil(filteredRecords.length / pageSize),
          }}
          onPageChange={setCurrentPage}
          isLoading={false}
          emptyMessage={t('homework.noRecords')}
          t={t}
        />
      </div>
    </div>
  );
}
