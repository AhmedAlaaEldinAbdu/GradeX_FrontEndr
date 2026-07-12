import { useTranslation } from 'react-i18next';
import Badge from '@/shared/components/Badge';
import CustomImage from '@/shared/components/CustomImage';
import ErrorMessage from '@/shared/components/ErrorMessage';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import CompletedIcon from '@gradex/assets/icons/CompletedGreen.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import type { ExamQuestionItem } from './examDetailsData';
import type { ExamDifficulty } from './OnlineExamCard';

const DIFFICULTY_VARIANT: Record<ExamDifficulty, 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

const DIFFICULTY_COLOR: Record<ExamDifficulty, string> = {
  easy: '#1A9F58',
  medium: '#F8951B',
  hard: '#DD0417',
};

// Progress ring geometry (viewBox is 66×66).
const RING_RADIUS = 29;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function QuestionRing({ value, color }: { value: number; color: string }) {
  const filled = (Math.min(100, Math.max(0, value)) / 100) * RING_CIRCUMFERENCE;

  return (
    <div className="relative h-[66px] w-[66px] shrink-0">
      <svg viewBox="0 0 66 66" className="h-full w-full -rotate-90">
        <circle cx="33" cy="33" r={RING_RADIUS} fill="none" stroke="#DCDBDB" strokeWidth="3.67" />
        <circle
          cx="33"
          cy="33"
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="3.67"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${RING_CIRCUMFERENCE - filled}`}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-lg font-bold"
        style={{ color }}
      >
        {value}%
      </span>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-2xl border border-[#DDE0E0] bg-[#F6F8F9] p-3">
      <div className="flex items-center justify-start gap-1.5">
        <CustomImage src={icon} alt="" className="h-4 w-4" />
        <span className="text-sm font-normal text-[#646969]">{label}</span>
      </div>
      <span className="text-start text-base font-normal text-[#0E1F1F]">{value}</span>
    </div>
  );
}

function QuestionCard({ question }: { question: ExamQuestionItem }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E6E6E6] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col items-start gap-3">
          <Badge variant={DIFFICULTY_VARIANT[question.difficulty]} size="sm">
            {t(`eLearning.onlineExams.difficulty.${question.difficulty}`)}
          </Badge>
          <div className="flex w-full items-center gap-2">
            <span className="text-sm font-normal text-[#00512E]">#{question.number}</span>
            <span className="flex-1 text-start text-base font-medium text-[#101828]">
              <bdi>{question.text}</bdi>
            </span>
          </div>
        </div>
        <QuestionRing value={question.successRate} color={DIFFICULTY_COLOR[question.difficulty]} />
      </div>

      <div className="flex flex-wrap gap-2">
        <StatBox
          icon={CompletedIcon}
          label={t('eLearning.onlineExams.details.correctAnswers')}
          value={`${question.correctCount}`}
        />
        <StatBox
          icon={XmarkCircleRedIcon}
          label={t('eLearning.onlineExams.details.wrongAnswers')}
          value={`${question.wrongCount}`}
        />
        <StatBox
          icon={ClockIcon}
          label={t('eLearning.onlineExams.details.avgQuestionTime')}
          value={`${question.avgSeconds} ${t('eLearning.onlineExams.details.secondUnit')}`}
        />
      </div>
    </div>
  );
}

type ExamQuestionsListProps = {
  questions: ExamQuestionItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export default function ExamQuestionsList({
  questions,
  isLoading = false,
  error,
  onRetry,
}: ExamQuestionsListProps) {
  if (error && !isLoading) {
    return <ErrorMessage message="common.errorOccurred" details={error} onRetry={onRetry} />;
  }

  if (isLoading && questions.length === 0) {
    return <Loading />;
  }

  if (questions.length === 0) {
    return <NotFoundMessage message="eLearning.onlineExams.details.questionsEmpty" />;
  }

  return (
    <div className={isLoading ? 'flex flex-col gap-4 opacity-60' : 'flex flex-col gap-4'}>
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}
