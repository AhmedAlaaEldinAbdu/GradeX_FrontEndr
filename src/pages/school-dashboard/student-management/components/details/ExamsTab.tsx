import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import CustomImage from '@/shared/components/CustomImage';
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

interface ExamRecord {
  id: string;
  subjectName: string;
  subjectNameEn: string;
  examType: string;
  examTypeEn: string;
  status: ExamStatus;
  examDate: string;
  finalResult: string;
}

const mockExamRecords: ExamRecord[] = [
  {
    id: '1',
    subjectName: 'اللغة الفرنسية',
    subjectNameEn: 'French',
    examType: 'الاختبار الشهري',
    examTypeEn: 'Monthly Exam',
    status: 'excellent',
    examDate: '1-1-2020',
    finalResult: '89/100',
  },
  {
    id: '2',
    subjectName: 'اللغة العربية',
    subjectNameEn: 'Arabic',
    examType: 'اختبار تقييم المستوى',
    examTypeEn: 'Level Assessment',
    status: 'good',
    examDate: '1-1-2021',
    finalResult: '89/100',
  },
  {
    id: '3',
    subjectName: 'اللغة الإنجليزية',
    subjectNameEn: 'English',
    examType: 'اختبار منتصف الفصل الدراسي',
    examTypeEn: 'Midterm Exam',
    status: 'weak',
    examDate: '1-1-2021',
    finalResult: '89/100',
  },
  {
    id: '4',
    subjectName: 'الرياضيات',
    subjectNameEn: 'Mathematics',
    examType: 'شهري',
    examTypeEn: 'Monthly',
    status: 'veryGood',
    examDate: '1-1-2021',
    finalResult: '89/100',
  },
];

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

export default function ExamsTab(_props: ExamsTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [examType, setExamType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredRecords = mockExamRecords.filter((record) => {
    const subjectName = currentLang === 'ar' ? record.subjectName : record.subjectNameEn;
    const matchesSearch =
      !searchQuery || subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    const matchesType =
      !examType ||
      (currentLang === 'ar' ? record.examType : record.examTypeEn)
        .toLowerCase()
        .includes(examType.toLowerCase());
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusLabel = (status: ExamStatus) => {
    const map: Record<ExamStatus, string> = {
      excellent: t('performance.excellent'),
      veryGood: t('performance.veryGood'),
      good: t('performance.good'),
      weak: t('performance.weak'),
    };
    return map[status];
  };

  const columns: DataTableColumn<ExamRecord>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index ?? 0) + 1,
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: t('exams.subjectName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.subjectName : row.subjectNameEn}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: t('exams.examType'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.examType : row.examTypeEn}</span>,
      headerClassName: 'min-w-[180px]',
      className: 'text-center',
    },
    {
      header: t('exams.status'),
      accessor: (row) => (
        <span className={getExamStatusBadgeColor(row.status)}>{getStatusLabel(row.status)}</span>
      ),
      headerClassName: 'min-w-[120px]',
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
      accessor: (row) => {
        const [score, total] = row.finalResult.split('/');
        return (
          <span className="text-sm">
            <span className="font-medium text-[#1A9F58]">{score}</span>
            <span className="text-[#646969]">/{total}</span>
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
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('exams.searchSubject')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'exam-type-filter',
      placeholder: '',
      value: examType,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={examType}
          onChange={(value) => setExamType(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={[
            { value: 'الاختبار الشهري', label: t('exams.monthlyExam') },
            { value: 'اختبار منتصف الفصل الدراسي', label: t('exams.midtermExam') },
            { value: 'اختبار تقييم المستوى', label: t('exams.levelAssessment') },
            { value: 'اختبار نهاية العام', label: t('exams.finalExam') },
          ]}
          placeholder={t('exams.examType')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'status-filter',
      placeholder: '',
      value: selectedStatus,
      onChange: () => {},
      width: '12%',
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
          placeholder={t('exams.status')}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setExamType('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={StudentBookBlueIcon}
          iconBg="bg-[#E7F2FB]"
          label={t('exams.studentGrade')}
          value="تقدير A"
        />
        <StatCard
          icon={CheckCircleIcon}
          iconBg="bg-[#E8F4EE]"
          label={t('exams.studentLevel')}
          value={t('exams.firstInClass')}
        />
        <StatCard
          icon={HatYellowIcon}
          iconBg="bg-[#FEF3E2]"
          label={t('exams.averageSuccess')}
          value="92%"
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
          <SubjectsBarChart
            data={subjectAverages.map((s) => ({
              ...s,
              label: currentLang === 'ar' ? s.label : s.labelEn,
            }))}
            highlightedIndex={2}
          />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
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
          <button
            type="button"
            className="flex-shrink-0 text-sm font-medium text-green-500 hover:text-green-700"
          >
            {t('common.showAll')}
          </button>
        </div>

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
          emptyMessage={t('exams.noRecords')}
          t={t}
        />
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: string;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#EDEDED] bg-white p-5">
      <div className="flex flex-col gap-1 text-start">
        <p className="text-sm text-[#646969]">{label}</p>
        <p className="text-base font-medium text-[#0E1F1F]">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        <CustomImage src={icon} alt="" className="h-5 w-5" />
      </div>
    </div>
  );
}

function SubjectsBarChart({
  data,
  highlightedIndex,
}: {
  data: { label: string; value: number }[];
  highlightedIndex?: number;
}) {
  const yLabels = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

  return (
    <div className="flex h-[22rem] gap-3">
      <div className="flex flex-col justify-between py-1 text-xs text-[#9CA3AF]">
        {yLabels.map((y) => (
          <span key={y}>{y}%</span>
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="relative flex flex-1 items-end justify-between gap-3 border-b border-[#EDEDED]">
          {data.map((d, i) => (
            <div key={d.label} className="relative flex flex-1 flex-col items-center">
              {highlightedIndex === i && (
                <div className="absolute -top-7 rounded-md bg-[#0E1F1F] px-2 py-0.5 text-xs font-medium text-white">
                  {d.value}%
                </div>
              )}
              <div className="w-8 rounded-t-md bg-[#1A9F58]" style={{ height: `${d.value}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between gap-3 text-xs text-[#646969]">
          {data.map((d) => (
            <div key={d.label} className="flex-1 text-center">
              {d.label}
            </div>
          ))}
        </div>
      </div>
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
