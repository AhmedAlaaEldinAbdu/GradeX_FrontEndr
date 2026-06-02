import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import InstituteIcon from '@gradex/assets/icons/Institute.svg';
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
import type { ExamDetailsItem } from './examDetailsData';

function OutlineBadge({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-3xl border bg-white px-4 py-1 text-sm font-medium ${className}`}
    >
      {text}
    </span>
  );
}

function StatBox({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-3xl border border-[#E6E6E6] bg-white px-6 py-4">
      <span className="whitespace-nowrap text-sm font-normal text-[#3A3A3A]">{label}</span>
      <span className={`whitespace-nowrap text-base font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function ExamSummaryBanner({ exam }: { exam: ExamDetailsItem }) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('eLearning.onlineExams.details.attendanceCount'),
      value: exam.attendance,
      valueClass: 'text-[#0E1F1F]',
    },
    {
      label: t('eLearning.onlineExams.details.questionsCount'),
      value: `${exam.questionsCount} ${t('eLearning.units.question')}`,
      valueClass: 'text-[#0E1F1F]',
    },
    {
      label: t('eLearning.onlineExams.details.avgTime'),
      value: `${exam.avgTimeMinutes} ${t('eLearning.onlineExams.details.minuteUnit')}`,
      valueClass: 'text-[#0E1F1F]',
    },
    {
      label: t('eLearning.metrics.successRate'),
      value: `${exam.successRate}%`,
      valueClass: 'text-[#1A9F58]',
    },
  ];

  return (
    <div className="app-card-shadow flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-4">
      {/* Exam info */}
      <div className="flex flex-col items-start gap-3 text-start">
        <div className="flex items-center gap-2">
          <OutlineBadge
            text={t(`eLearning.exams.sources.${exam.source}`)}
            className="border-[#CAACE0] text-[#A353DD]"
          />
          <OutlineBadge
            text={t(`eLearning.onlineExams.difficulty.${exam.difficulty}`)}
            className="border-[#DFAFAF] text-[#DD0417]"
          />
        </div>
        <h3 className="text-base font-medium text-[#0E1F1F]">{exam.fullTitle}</h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-normal text-[#646969]">
          <span className="flex items-center gap-2">
            <CustomImage src={InstituteIcon} alt="" className="h-4 w-4" />
            {exam.stage}
          </span>
          <span className="flex items-center gap-2">
            <CustomImage src={CalendarIcon} alt="" className="h-4 w-4" />
            {exam.date} - {exam.time}
          </span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex flex-wrap items-center gap-3">
        {stats.map((stat) => (
          <StatBox
            key={stat.label}
            label={stat.label}
            value={stat.value}
            valueClass={stat.valueClass}
          />
        ))}
      </div>
    </div>
  );
}
