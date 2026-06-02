import { useTranslation } from 'react-i18next';
import Badge from '@/shared/components/Badge';
import CustomImage from '@/shared/components/CustomImage';
import CheckmarkCircleIcon from '@gradex/assets/icons/CheckmarkCircle.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import { REVIEW_ANSWERS, type ReviewAnswerItem } from './examDetailsData';

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-2xl border border-[#DDE0E0] bg-[#F6F8F9] p-3">
      <div className="flex items-center justify-start gap-1.5">
        <span className="text-sm font-normal text-[#646969]">{label}</span>
        <CustomImage src={icon} alt="" className="h-4 w-4" />
      </div>
      <span className="text-right text-base font-normal text-[#0E1F1F]">{value}</span>
    </div>
  );
}

function CorrectionCard({ answer }: { answer: ReviewAnswerItem }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E6E6E6] bg-white p-6">
      <div className="flex flex-col items-start gap-2">
        <Badge variant={answer.isCorrect ? 'success' : 'danger'} size="sm">
          {answer.isCorrect
            ? t('eLearning.onlineExams.details.review.correctAnswer')
            : t('eLearning.onlineExams.details.review.wrongAnswer')}
        </Badge>
        <div className="flex w-full items-center gap-2">
          <span className="text-sm font-normal text-[#00512E]">#{answer.number}</span>
          <span className="flex-1 text-right text-base font-medium text-[#101828]">
            {answer.question}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatBox
          icon={answer.isCorrect ? CheckmarkCircleIcon : XmarkCircleRedIcon}
          label={t('eLearning.onlineExams.details.review.answer')}
          value={answer.answer}
        />
        <StatBox
          icon={ClockIcon}
          label={t('eLearning.onlineExams.details.studentsTable.timeTaken')}
          value={`${answer.timeSeconds} ${t('eLearning.onlineExams.details.secondUnit')}`}
        />
      </div>
    </div>
  );
}

export default function ReviewCorrectionList() {
  return (
    <div className="flex flex-col gap-4">
      {REVIEW_ANSWERS.map((answer) => (
        <CorrectionCard key={answer.id} answer={answer} />
      ))}
    </div>
  );
}
