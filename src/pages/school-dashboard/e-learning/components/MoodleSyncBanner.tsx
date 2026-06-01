import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import QuestionBankIcon from '@gradex/assets/icons/QuestionBank.svg';

export default function MoodleSyncBanner() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#B7E7CD] bg-[#4ADB8E]/10 p-4">
      <div className="flex flex-1 items-center justify-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#B1EBCC] bg-white">
          <CustomImage src={QuestionBankIcon} alt="" className="h-6 w-6" />
        </div>

        <div className="flex flex-col items-start gap-1.5 text-start">
          <div className="flex items-center gap-2">
            <span className="text-base font-normal text-[#0E1F1F]">
              {t('eLearning.moodle.connected')} {t('eLearning.moodle.name')}
            </span>
          </div>
          <span className="text-sm font-normal text-[#646969]">
            {t('eLearning.moodle.lastSync', {
              minutes: 5,
              questions: '1,247',
              students: 342,
            })}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="rounded-3xl border border-[#89DFB1] bg-white px-4 py-1 text-sm font-medium text-[#1A9F58] transition-colors hover:bg-[#1A9F58]/10"
      >
        {t('eLearning.moodle.syncNow')}
      </button>
    </div>
  );
}
