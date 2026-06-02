import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import TrendingUpIcon from '@gradex/assets/icons/TrendingUp.svg';
import { RESULT_DISTRIBUTION } from './examDetailsData';

export default function ExamResultsDistribution() {
  const { t } = useTranslation();

  return (
    <Card className="rounded-3xl border border-[#DDE0E0]" padding="md">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-medium text-[#3A3A3A]">
            {t('eLearning.onlineExams.details.distribution.title')}
          </h3>
          <div className="flex items-center gap-2 text-sm font-normal">
            <span className="flex items-center gap-1 text-[#1A9F58]">
              18%
              <CustomImage src={TrendingUpIcon} alt="" className="h-5 w-5" />
            </span>
            <span className="text-[#3A3A3A]">
              {t('eLearning.onlineExams.details.distribution.vsPrevious')}
            </span>
          </div>
        </div>

        {/* Distribution rows */}
        <div className="flex flex-col gap-6">
          {RESULT_DISTRIBUTION.map((bucket) => (
            <div key={bucket.range} className="flex items-center gap-6">
              <span className="w-[72px] shrink-0 text-start text-base font-medium text-[#A9A7A7]">
                {bucket.range}
              </span>
              <div className="h-2 flex-1 rounded-full bg-[#E8E9E9]/60">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${bucket.percent}%`, backgroundColor: bucket.color }}
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
      </div>
    </Card>
  );
}
