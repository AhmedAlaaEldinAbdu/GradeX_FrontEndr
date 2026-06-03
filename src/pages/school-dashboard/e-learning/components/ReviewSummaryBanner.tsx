import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import { REVIEW_SUMMARY } from './examDetailsData';

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
    <div className="flex flex-col items-end gap-3 rounded-3xl border border-[#E6E6E6] bg-white px-6 py-4">
      <span className="whitespace-nowrap text-sm font-normal text-[#3A3A3A]">{label}</span>
      <span className={`whitespace-nowrap text-base font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function ReviewSummaryBanner() {
  const { t } = useTranslation();
  const summary = REVIEW_SUMMARY;

  const stats = [
    {
      label: t('eLearning.metrics.successRate'),
      value: `${summary.successRate}%`,
      valueClass: 'text-[#1A9F58]',
    },
    {
      label: t('eLearning.onlineExams.details.avgTime'),
      value: `${summary.avgTimeMinutes} ${t('eLearning.onlineExams.details.minuteUnit')}`,
      valueClass: 'text-[#0E1F1F]',
    },
    {
      label: t('eLearning.onlineExams.details.questionsCount'),
      value: `${summary.answeredCount}/${summary.questionsCount}`,
      valueClass: 'text-[#1A9F58]',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-4">
      {/* Student */}
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#E6E6E6]">
          <CustomImage src={DefaultAvatar} alt="" className="h-full w-full object-cover" />
        </div>
        <span className="text-base font-medium text-[#0E1F1F]">{summary.studentName}</span>
        <span className="inline-flex items-center justify-center rounded-3xl bg-[#1A9F58]/10 px-4 py-0.5 text-sm font-medium text-[#1A9F58]">
          <bdi>{summary.grade}</bdi>
        </span>
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
