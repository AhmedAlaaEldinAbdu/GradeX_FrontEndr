import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import CustomImage from '@/shared/components/CustomImage';
import { getExamStatusBadgeColor } from '@/shared/components/SharedBadges';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import ArrowLeftIcon from '@gradex/assets/icons/ArrowLeft.svg';
import ArrowRightIcon from '@gradex/assets/icons/ArrowRight.svg';

interface HomeworkTabProps {
  studentId: string;
}

type HomeworkStatus = 'excellent' | 'veryGood' | 'good' | 'weak';

interface HomeworkRecord {
  id: string;
  subjectName: string;
  subjectNameEn: string;
  hasHomework: boolean;
  status: HomeworkStatus;
  date: string;
  finalResult: string;
  notes: string;
  notesEn: string;
}

const mockHomeworkRecords: HomeworkRecord[] = [
  {
    id: '1',
    subjectName: 'اللغة الفرنسية',
    subjectNameEn: 'French',
    hasHomework: true,
    status: 'excellent',
    date: '1-1-2020',
    finalResult: '29/30',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '2',
    subjectName: 'اللغة العربية',
    subjectNameEn: 'Arabic',
    hasHomework: true,
    status: 'good',
    date: '1-1-2021',
    finalResult: '20/30',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '3',
    subjectName: 'اللغة الإنجليزية',
    subjectNameEn: 'English',
    hasHomework: true,
    status: 'weak',
    date: '1-1-2021',
    finalResult: '5/30',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '4',
    subjectName: 'الرياضيات',
    subjectNameEn: 'Mathematics',
    hasHomework: true,
    status: 'veryGood',
    date: '1-1-2021',
    finalResult: '25/30',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
];

export default function HomeworkTab(_props: HomeworkTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [viewMode, setViewMode] = useState<'byDay' | 'all'>('byDay');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredRecords = mockHomeworkRecords.filter((record) => {
    const subjectName = currentLang === 'ar' ? record.subjectName : record.subjectNameEn;
    const matchesSearch =
      !searchQuery || subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    const matchesDate = viewMode === 'byDay' || !selectedDate || record.date.includes(selectedDate);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusLabel = (status: HomeworkStatus) => {
    const map: Record<HomeworkStatus, string> = {
      excellent: t('performance.excellent'),
      veryGood: t('performance.veryGood'),
      good: t('performance.good'),
      weak: t('performance.weak'),
    };
    return map[status];
  };

  const baseColumns: DataTableColumn<HomeworkRecord>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index ?? 0) + 1,
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: t('homework.subjectName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.subjectName : row.subjectNameEn}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: t('homework.assignment'),
      accessor: (row) =>
        row.hasHomework ? (
          <div className="flex items-center justify-center">
            <CustomImage src={PdfIcon} alt="PDF" className="h-9 w-8" />
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('homework.status'),
      accessor: (row) => (
        <span className={getExamStatusBadgeColor(row.status)}>{getStatusLabel(row.status)}</span>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
  ];

  const dateColumn: DataTableColumn<HomeworkRecord> = {
    header: t('homework.date'),
    accessor: (row) => <span>{row.date}</span>,
    headerClassName: 'min-w-[120px]',
    className: 'text-center',
  };

  const tailColumns: DataTableColumn<HomeworkRecord>[] = [
    {
      header: t('homework.finalResult'),
      accessor: (row) => <span className="text-sm text-[#646969]">{row.finalResult}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('homework.notes'),
      accessor: (row) => (
        <span className="text-sm text-[#646969]">
          {currentLang === 'ar' ? row.notes : row.notesEn}
        </span>
      ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
  ];

  const columns =
    viewMode === 'all'
      ? [...baseColumns, dateColumn, ...tailColumns]
      : [...baseColumns, ...tailColumns];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'custom',
      name: 'search',
      placeholder: '',
      value: searchQuery,
      onChange: () => {},
      width: '40%',
      customComponent: (
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('homework.searchSubject')}
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
            { value: 'excellent', label: t('performance.excellent') },
            { value: 'veryGood', label: t('performance.veryGood') },
            { value: 'good', label: t('performance.good') },
            { value: 'weak', label: t('performance.weak') },
          ]}
          placeholder={t('homework.status')}
          maxHeight="200px"
        />
      ),
    },
    ...(viewMode === 'all'
      ? ([
          {
            type: 'custom',
            name: 'date-filter',
            placeholder: '',
            value: selectedDate,
            onChange: () => {},
            width: '15%',
            customComponent: (
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder={t('homework.date')}
              />
            ),
          },
        ] satisfies FilterConfig[])
      : []),
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedDate('');
    setCurrentPage(1);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'byDay' ? 'all' : 'byDay'));
    setCurrentPage(1);
  };

  return (
    <Card>
      <div className={`mb-4 flex items-center ${viewMode === 'byDay' ? 'justify-between' : 'justify-end'}`}>
        {viewMode === 'byDay' && (
          <div className="flex w-full items-center justify-center gap-3 text-sm text-[#0E1F1F]">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDEDED] hover:bg-gray-50"
              aria-label="previous"
            >
              <CustomImage src={ArrowRightIcon} alt="" className="h-3 w-3" />
            </button>
            <span>8 {t('performance.august')} 2025</span>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDEDED] hover:bg-gray-50"
              aria-label="next"
            >
              <CustomImage src={ArrowLeftIcon} alt="" className="h-3 w-3" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={toggleViewMode}
          className="flex-shrink-0 text-sm font-medium text-green-500 hover:text-green-700"
        >
          {viewMode === 'byDay' ? t('common.showAll') : t('homework.showByDay')}
        </button>
      </div>

      <DataTable
        data={filteredRecords}
        columns={columns}
        keyExtractor={(row) => row.id}
        pagination={
          viewMode === 'all'
            ? {
                page: currentPage,
                limit: pageSize,
                total: filteredRecords.length,
                totalPages: Math.max(1, Math.ceil(filteredRecords.length / pageSize)),
              }
            : undefined
        }
        onPageChange={viewMode === 'all' ? setCurrentPage : undefined}
        filters={filterConfigs}
        showFilters={true}
        onResetFilters={handleResetFilters}
        isLoading={false}
        emptyMessage={t('homework.noRecords')}
        t={t}
      />
    </Card>
  );
}
