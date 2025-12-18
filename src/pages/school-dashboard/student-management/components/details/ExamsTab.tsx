import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type DataTableColumn } from '@/shared/components/DataTable';
import Badge from '@/shared/components/Badge';

interface ExamsTabProps {
  studentId: string;
}

interface ExamRecord {
  id: string;
  subjectName: string;
  subjectNameEn: string;
  examType: string;
  examTypeEn: string;
  status: 'excellent' | 'veryGood' | 'good' | 'struggling' | 'weak';
  examDate: string;
  finalResult: string;
}

// Mock data matching the design
const mockExamRecords: ExamRecord[] = [
  {
    id: '1',
    subjectName: 'اللغة الفرنسية',
    subjectNameEn: 'French',
    examType: 'الاختبار الشهري',
    examTypeEn: 'Monthly Exam',
    status: 'excellent',
    examDate: '1-1-2020',
    finalResult: '29/30',
  },
  {
    id: '2',
    subjectName: 'اللغة العربية',
    subjectNameEn: 'Arabic',
    examType: 'اختبار تقييم المستوى',
    examTypeEn: 'Level Assessment',
    status: 'good',
    examDate: '1-1-2021',
    finalResult: '20/30',
  },
  {
    id: '3',
    subjectName: 'اللغة الإنجليزية',
    subjectNameEn: 'English',
    examType: 'اختبار منتصف الفصل الدراسي',
    examTypeEn: 'Midterm Exam',
    status: 'weak',
    examDate: '1-1-2021',
    finalResult: '5/30',
  },
  {
    id: '4',
    subjectName: 'الرياضيات',
    subjectNameEn: 'Mathematics',
    examType: 'شهري',
    examTypeEn: 'Monthly',
    status: 'veryGood',
    examDate: '1-1-2021',
    finalResult: '25/30',
  },
];

export default function ExamsTab({ studentId }: ExamsTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

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
  const filteredRecords = mockExamRecords.filter((record) => {
    const subjectName = currentLang === 'ar' ? record.subjectName : record.subjectNameEn;
    const matchesSearch =
      !searchQuery || subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const columns: DataTableColumn<ExamRecord>[] = [
    {
      header: '#',
      accessor: (_, index) => <span>{(index ?? 0) + 1}</span>,
      headerClassName: 'min-w-[50px]',
      className: 'text-center',
    },
    {
      header: t('exams.subjectName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.subjectName : row.subjectNameEn}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('exams.examType'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.examType : row.examTypeEn}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: t('exams.status'),
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('exams.examDate'),
      accessor: (row) => <span>{row.examDate}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('exams.finalResult'),
      accessor: (row) => <span className="font-semibold">{row.finalResult}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  return (
    <div className="rounded-xl bg-white p-6">
      <div className="relative mb-4 flex items-center justify-center py-2">
        <button className="absolute end-0 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          {t('common.showAll')}
        </button>

        {/* Date in CENTER */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button className="hover:text-gray-800">
            <span>‹</span>
          </button>
          <span className="font-medium">8 {t('performance.august')} 2025</span>
          <button className="hover:text-gray-800">
            <span>›</span>
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-start gap-3">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('exams.searchSubject')}
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
          <option value="">{t('exams.status')}</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-gray-200">
        <DataTable
          data={filteredRecords}
          columns={columns}
          keyExtractor={(row) => row.id}
          showFilters={false}
          isLoading={false}
          emptyMessage={t('exams.noRecords')}
          t={t}
        />
      </div>
    </div>
  );
}
