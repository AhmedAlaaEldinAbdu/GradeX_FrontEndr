import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentExams } from '@/redux/features/task-students/taskStudentsSlice';
import type { StudentExamItem } from '@/types/taskStudents';
import Card from '@/shared/components/Card';
import BarChart from '@/shared/components/BarChart';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import CustomImage from '@/shared/components/CustomImage';
import MetricCard from '@/shared/components/MetricCard';
import { getExamStatusBadgeColor } from '@/shared/components/SharedBadges';
import StudentBookBlueIcon from '@gradex/assets/icons/StudentBookBlue.svg';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import HatYellowIcon from '@gradex/assets/icons/HatYellow.svg';
import SupplyCurveIcon from '@gradex/assets/icons/SupplyCurve.svg';
import ArrowLeftIcon from '@gradex/assets/icons/ArrowLeft.svg';
import ArrowRightIcon from '@gradex/assets/icons/ArrowRight.svg';

interface ExamsTabProps {
  studentId: string;
}

type ExamStatus = 'excellent' | 'veryGood' | 'good' | 'weak';

// EvaluationGrade (1-5) -> badge status. null/0 => no badge.
const evaluationGradeToStatus = (grade: number | null): ExamStatus | null => {
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

const subjectAverages: { label: string; labelEn: string; value: number }[] = [
  { label: 'إنجليزي', labelEn: 'English', value: 78 },
  { label: 'عربي', labelEn: 'Arabic', value: 82 },
  { label: 'إسلامية', labelEn: 'Islamic', value: 88 },
  { label: 'اجتماعيات', labelEn: 'Social', value: 78 },
  { label: 'علوم', labelEn: 'Science', value: 72 },
  { label: 'رياضيات', labelEn: 'Math', value: 99 },
];

const monthlyPerformance: { label: string; labelEn: string; value: number }[] = [
  { label: 'شهر فبراير', labelEn: 'February', value: 90 },
  { label: 'شهر يناير', labelEn: 'January', value: 78 },
  { label: 'شهر ديسمبر', labelEn: 'December', value: 49 },
  { label: 'شهر نوفمبر', labelEn: 'November', value: 35 },
  { label: 'شهر أكتوبر', labelEn: 'October', value: 23.6 },
];

export default function ExamsTab({ studentId }: ExamsTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const dispatch = useAppDispatch();

  const exams = useAppSelector((state) => state.taskStudents.studentExams);
  const pagination = useAppSelector((state) => state.taskStudents.examsPagination);
  const isLoading = useAppSelector((state) => state.taskStudents.isExamsLoading);

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
      fetchStudentExams({
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
    : t('exams.allDates');

  const getStatusLabel = (status: ExamStatus) => {
    const map: Record<ExamStatus, string> = {
      excellent: t('performance.excellent'),
      veryGood: t('performance.veryGood'),
      good: t('performance.good'),
      weak: t('performance.weak'),
    };
    return map[status];
  };

  const columns: DataTableColumn<StudentExamItem>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index ?? 0) + 1,
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: t('exams.subjectName'),
      accessor: (row) => (
        <span>{currentLang === 'ar' ? row.materialNameAr : row.materialNameEn}</span>
      ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: t('exams.examType'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.nameAr : row.nameEn}</span>,
      headerClassName: 'min-w-[180px]',
      className: 'text-center',
    },
    {
      header: t('exams.status'),
      accessor: (row) => {
        const status = evaluationGradeToStatus(row.evaluationGrade);
        if (!status) return <span className="text-[#646969]">-</span>;
        return <span className={getExamStatusBadgeColor(status)}>{getStatusLabel(status)}</span>;
      },
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('exams.examDate'),
      accessor: (row) => <span>{formatDate(row.date)}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('exams.finalResult'),
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
          placeholder={t('exams.searchSubject')}
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
          placeholder={t('exams.status')}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGrade('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title={t('exams.studentGrade')}
          value="تقدير A"
          icon={<CustomImage src={StudentBookBlueIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E7F2FB]"
        />
        <MetricCard
          title={t('exams.studentLevel')}
          value={t('exams.firstInClass')}
          icon={<CustomImage src={CheckCircleIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E8F4EE]"
        />
        <MetricCard
          title={t('exams.averageSuccess')}
          value="92%"
          icon={<CustomImage src={HatYellowIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#FEF3E2]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <h3 className="mb-4 text-base font-medium text-[#0E1F1F]">
            {t('exams.performanceTitle')}
          </h3>
          <PerformanceGauge
            value={90}
            captionTop={t('exams.continuousImprovement').split(' - ')[0]}
            captionBottom={t('exams.continuousImprovement').split(' - ')[1]}
          />
          <div className="mt-4 space-y-2">
            {monthlyPerformance.map((m) => (
              <div key={m.labelEn} className="flex items-center justify-between py-2 text-sm">
                <span className="text-[#0E1F1F]">{currentLang === 'ar' ? m.label : m.labelEn}</span>
                <span className="font-medium text-[#646969]">{m.value}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium text-[#0E1F1F]">
              {t('exams.subjectGradesAverage')}
            </h3>
            <div className="flex items-center gap-1 text-xs font-medium text-[#1A9F58]">
              <span>+18%</span>
              <CustomImage src={SupplyCurveIcon} alt="" className="h-3 w-3" />
              <span className="text-[#646969]">{t('exams.vsLastMonth')}</span>
            </div>
          </div>
          <BarChart
            data={subjectAverages.map((s) => ({
              key: s.labelEn,
              label: currentLang === 'ar' ? s.label : s.labelEn,
              value: s.value,
              tooltip: `${s.value}%`,
            }))}
            yTicks={[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]}
            max={100}
            renderTick={(tick) => `${tick}%`}
            barWidthClassName="w-8"
            plotHeightClassName="h-[22rem]"
          />
        </Card>
      </div>

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
          data={exams}
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
          emptyMessage={t('exams.noRecords')}
          t={t}
        />
      </Card>
    </div>
  );
}

function PerformanceGauge({
  value,
  captionTop,
  captionBottom,
}: {
  value: number;
  captionTop: string;
  captionBottom: string;
}) {
  const radius = 80;
  const circumference = Math.PI * radius;
  const dash = (value / 100) * circumference;

  return (
    <div className="relative mx-auto w-full max-w-[220px]">
      <svg viewBox="0 0 200 110" className="w-full">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          stroke="#E5E7EB"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          stroke="#1A9F58"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-x-0 top-1/2 -translate-y-2 text-center">
        <p className="text-xl font-semibold text-[#1A9F58]">{value}%</p>
        <p className="text-xs font-medium text-[#1A9F58]">{captionTop}</p>
        <p className="text-xs text-[#1A9F58]">{captionBottom}</p>
      </div>
    </div>
  );
}
