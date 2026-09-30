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
    <div className="flex flex-col items-start gap-3 rounded-3xl border border-black-100 bg-white px-6 py-4">
      <span className="text-sm font-normal whitespace-nowrap text-[#3A3A3A]">{label}</span>
      <span className={`text-base font-medium whitespace-nowrap ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function ExamSummaryBanner({ exam }: { exam: ExamDetailsItem }) {
  const { t } = useTranslation();
  const dateTimeText = [exam.date, exam.time].filter(Boolean).join(' - ');

  const stats = [
    {
      label: t('eLearning.onlineExams.details.attendanceCount'),
      value: exam.attendance,
      valueClass: 'text-black-900',
    },
    {
      label: t('eLearning.onlineExams.details.questionsCount'),
      value: `${exam.questionsCount} ${t('eLearning.units.question')}`,
      valueClass: 'text-black-900',
    },
    {
      label: t('eLearning.onlineExams.details.avgTime'),
      value: `${exam.avgTimeMinutes} ${t('eLearning.onlineExams.details.minuteUnit')}`,
      valueClass: 'text-black-900',
    },
    {
      label: t('eLearning.metrics.successRate'),
      value: `${exam.successRate}%`,
      valueClass: 'text-lightGreen-500',
    },
  ];

  return (
    <div className="app-card-shadow flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-4">
      {/* Exam info */}
      <div className="flex flex-col items-start gap-3 text-start">
        <div className="flex items-center gap-2">
          <OutlineBadge
            text={t(`eLearning.exams.sources.${exam.source}`)}
            className="border-[#CAACE0] text-purple-500"
          />
          <OutlineBadge
            text={t(`eLearning.onlineExams.difficulty.${exam.difficulty}`)}
            className="border-[#DFAFAF] text-red-500"
          />
        </div>
        <h3 className="text-base font-medium text-black-900">
          <span
            dir={exam.titleDirection}
            className="inline-flex flex-wrap items-center gap-1 text-start"
          >
            <span>{exam.fullTitle}</span>
            {exam.fullTitleSuffix && (
              <>
                <span>-</span>
                <span>{exam.fullTitleSuffix}</span>
              </>
            )}
          </span>
        </h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-normal text-[#646969]">
          <span className="flex items-center gap-2">
            <CustomImage src={InstituteIcon} alt="" className="h-4 w-4" />
            {exam.stage}
          </span>
          {dateTimeText && (
            <span className="flex items-center gap-2">
              <CustomImage src={CalendarIcon} alt="" className="h-4 w-4" />
              {dateTimeText}
            </span>
          )}
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
