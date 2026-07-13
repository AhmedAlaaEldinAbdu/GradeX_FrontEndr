import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import ErrorMessage from '@/shared/components/ErrorMessage';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import TrendingUpIcon from '@gradex/assets/icons/TrendingUp.svg';
import type { ResultBucket } from './examDetailsData';

const getVisibleBarWidth = (bucket: ResultBucket): string => {
  if (bucket.studentsCount <= 0) return '0%';
  return `${Math.max(4, Math.min(100, bucket.percent))}%`;
};

type ExamResultsDistributionProps = {
  buckets: ResultBucket[];
  comparisonPercentage?: number | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export default function ExamResultsDistribution({
  buckets,
  comparisonPercentage,
  isLoading = false,
  error,
  onRetry,
}: ExamResultsDistributionProps) {
  const { t } = useTranslation();
  const hasComparisonPercentage = typeof comparisonPercentage === 'number';

  return (
    <Card className="rounded-3xl border border-[#DDE0E0]" padding="md">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-medium text-[#3A3A3A]">
            {t('eLearning.onlineExams.details.distribution.title')}
          </h3>
          {hasComparisonPercentage && (
            <div className="flex items-center gap-2 text-sm font-normal">
              <span
                className={`flex items-center gap-1 ${
                  comparisonPercentage >= 0 ? 'text-[#1A9F58]' : 'text-[#DD0417]'
                }`}
              >
                {Math.round(comparisonPercentage)}%
                {comparisonPercentage >= 0 && (
                  <CustomImage src={TrendingUpIcon} alt="" className="h-5 w-5" />
                )}
              </span>
              <span className="text-[#3A3A3A]">
                {t('eLearning.onlineExams.details.distribution.vsPrevious')}
              </span>
            </div>
          )}
        </div>

        {/* Distribution rows */}
        {error && !isLoading ? (
          <ErrorMessage message="common.errorOccurred" details={error} onRetry={onRetry} />
        ) : isLoading && buckets.length === 0 ? (
          <Loading />
        ) : buckets.length === 0 ? (
          <NotFoundMessage message="common.noDataFound" />
        ) : (
          <div className={isLoading ? 'flex flex-col gap-6 opacity-60' : 'flex flex-col gap-6'}>
            {buckets.map((bucket) => (
              <div key={bucket.range} className="flex items-center gap-6">
                <span className="w-[72px] shrink-0 text-start text-base font-medium text-[#A9A7A7]">
                  {bucket.range}
                </span>
                <div className="flex h-2 flex-1 rounded-full bg-[#E8E9E9]/60">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: getVisibleBarWidth(bucket), backgroundColor: bucket.color }}
                  />
                </div>
                <span
                  className="w-16 shrink-0 whitespace-nowrap text-base font-medium"
                  style={{ color: bucket.color }}
                >
                  {bucket.studentsCount} {t('eLearning.units.student')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
