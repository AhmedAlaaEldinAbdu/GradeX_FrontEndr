import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentHomework } from '@/redux/features/task-students/taskStudentsSlice';
import type { StudentHomeworkItem } from '@/types/taskStudents';
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

// EvaluationGrade (1-5) -> badge status. null/0 => no badge.
const evaluationGradeToStatus = (grade: number | null): HomeworkStatus | null => {
  switch (grade) {
    case 5:
      return 'excellent';
    case 4:
      return 'veryGood';
    case 3:
      return 'good';
    case 2:
    case 1:
      return 'weak';
    default:
      return null;
  }
};

export default function HomeworkTab({ studentId }: HomeworkTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const dispatch = useAppDispatch();

  const homework = useAppSelector((state) => state.taskStudents.studentHomework);
  const pagination = useAppSelector((state) => state.taskStudents.homeworkPagination);
  const isLoading = useAppSelector((state) => state.taskStudents.isHomeworkLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Local-time YYYY-MM-DD (avoids the UTC day-shift of toISOString()).
  const toApiDate = (d: Date) => {
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  useEffect(() => {
    if (!studentId) return;
    dispatch(
      fetchStudentHomework({
        studentId,
        params: {
          PageIndex: currentPage,
          PageSize: pageSize,
          Search: searchQuery || undefined,
          EvaluationGrade: selectedGrade ? Number(selectedGrade) : undefined,
          Date: selectedDate ? toApiDate(selectedDate) : undefined,
        },
      })
    );
  }, [dispatch, studentId, currentPage, searchQuery, selectedGrade, selectedDate]);

  const shiftSelectedDate = (days: number) => {
    setSelectedDate((prev) => {
      const base = prev ?? new Date();
      const next = new Date(base);
      next.setDate(next.getDate() + days);
      return next;
    });
    setCurrentPage(1);
  };

  const clearSelectedDate = () => {
    setSelectedDate(null);
    setCurrentPage(1);
  };

  const formatDate = (value: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(currentLang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US');
  };

  const selectedDateLabel = selectedDate
    ? selectedDate.toLocaleDateString(currentLang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : t('homework.allDates');

  const getStatusLabel = (status: HomeworkStatus) => {
    const map: Record<HomeworkStatus, string> = {
      excellent: t('performance.excellent'),
      veryGood: t('performance.veryGood'),
      good: t('performance.good'),
      weak: t('performance.weak'),
    };
    return map[status];
  };

  const columns: DataTableColumn<StudentHomeworkItem>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index ?? 0) + 1,
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: t('homework.subjectName'),
      accessor: (row) => (
        <span>{currentLang === 'ar' ? row.materialNameAr : row.materialNameEn}</span>
      ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: t('homework.assignment'),
      accessor: (row) =>
        row.schoolTaskAttachment?.length ? (
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
      accessor: (row) => {
        const status = evaluationGradeToStatus(row.evaluationGrade);
        if (!status) return <span className="text-[#646969]">-</span>;
        return <span className={getExamStatusBadgeColor(status)}>{getStatusLabel(status)}</span>;
      },
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('homework.date'),
      accessor: (row) => <span>{formatDate(row.date)}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('homework.finalResult'),
      accessor: (row) => {
        if (row.studentScore == null || row.maxScore == null) {
          return <span className="text-sm text-[#646969]">-</span>;
        }
        return (
          <span className="text-sm">
            <span className="font-medium text-[#1A9F58]">{row.studentScore}</span>
            <span className="text-[#646969]">/{row.maxScore}</span>
          </span>
        );
      },
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('homework.notes'),
      accessor: (row) => {
        const note = currentLang === 'ar' ? row.descriptionAr : row.descriptionEn;
        return <span className="text-sm text-[#646969]">{note || '-'}</span>;
      },
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
  ];

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
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('homework.searchSubject')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'grade-filter',
      placeholder: '',
      value: selectedGrade,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedGrade}
          onChange={(value) => {
            setSelectedGrade(Array.isArray(value) ? (value[0] ?? '') : value);
            setCurrentPage(1);
          }}
          options={[
            { value: '5', label: t('performance.excellent') },
            { value: '4', label: t('performance.veryGood') },
            { value: '3', label: t('performance.good') },
            { value: '2', label: t('performance.struggling') },
            { value: '1', label: t('performance.weak') },
          ]}
          placeholder={t('homework.status')}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGrade('');
    setSelectedDate(null);
    setCurrentPage(1);
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex w-full items-center justify-center gap-3 text-sm text-[#0E1F1F]">
          <button
            type="button"
            onClick={() => shiftSelectedDate(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDEDED] hover:bg-gray-50"
            aria-label="previous"
          >
            <CustomImage src={ArrowRightIcon} alt="" className="h-3 w-3" />
          </button>
          <span>{selectedDateLabel}</span>
          <button
            type="button"
            onClick={() => shiftSelectedDate(1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDEDED] hover:bg-gray-50"
            aria-label="next"
          >
            <CustomImage src={ArrowLeftIcon} alt="" className="h-3 w-3" />
          </button>
        </div>
        <button
          type="button"
          onClick={clearSelectedDate}
          className="flex-shrink-0 text-sm font-medium text-green-500 hover:text-green-700"
        >
          {t('common.showAll')}
        </button>
      </div>

      <DataTable
        data={homework}
        columns={columns}
        keyExtractor={(row) => `${row.materialId}-${row.nameEn}-${row.date}`}
        pagination={{
          page: pagination.pageIndex || currentPage,
          limit: pagination.pageSize || pageSize,
          total: pagination.totalItems,
          totalPages: Math.max(1, pagination.totalPages || 1),
        }}
        onPageChange={setCurrentPage}
        filters={filterConfigs}
        showFilters={true}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        emptyMessage={t('homework.noRecords')}
        t={t}
      />
    </Card>
  );
}
