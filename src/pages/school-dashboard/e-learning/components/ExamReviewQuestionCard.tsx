import { useTranslation } from 'react-i18next';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';

export type ReviewDifficulty = 'easy' | 'medium' | 'hard';
export type ReviewQuestionType = 'multipleChoice' | 'trueFalse' | 'essay';

export type ReviewAnswer = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

export type ReviewQuestion = {
  id: string;
  number: number;
  difficulty: ReviewDifficulty;
  questionType: ReviewQuestionType;
  text: string;
  answers: ReviewAnswer[];
  explanation?: string;
  points?: number;
};

const DIFFICULTY_BADGE: Record<ReviewDifficulty, string> = {
  easy: 'bg-lightGreen-500/10 text-lightGreen-500',
  medium: 'bg-yellow-400/10 text-yellow-400',
  hard: 'bg-red-500/10 text-red-500',
};

// Recolours a monochrome SVG to the given colour via CSS mask (same approach as other icon chips).
function MaskIcon({ src, color, className }: { src: string; color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        backgroundColor: color,
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  );
}

function CorrectAnswerIcon() {
  return (
    <svg
      className="h-4 w-4 text-lightGreen-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.4 2.4 4.6-5" />
    </svg>
  );
}

function ExplanationCheckIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0 text-black-900"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

type ExamReviewQuestionCardProps = {
  question: ReviewQuestion;
  onDelete?: () => void;
  onEdit?: () => void;
  selected?: boolean;
};

export default function ExamReviewQuestionCard({
  question,
  onDelete,
  onEdit,
  selected = false,
}: ExamReviewQuestionCardProps) {
  const { t } = useTranslation();

  const isMultipleChoice = question.questionType === 'multipleChoice';
  const isEssay = question.questionType === 'essay';
  const typeBadgeClass = isMultipleChoice
    ? 'bg-blue-500/10 text-blue-500'
    : isEssay
      ? 'bg-[#5B5BD6]/10 text-[#5B5BD6]'
      : 'bg-purple-500/10 text-purple-500';
  const typeBadgeLabel = isMultipleChoice
    ? t('eLearning.onlineExams.addAI.classifications.multipleChoice')
    : isEssay
      ? t('eLearning.onlineExams.addAI.review.essay', { defaultValue: 'Essay' })
      : t('eLearning.onlineExams.addAI.review.trueFalse');

  const renderAnswer = (answer: ReviewAnswer) =>
    answer.isCorrect ? (
      <div
        key={answer.id}
        className="flex items-center justify-between rounded-[14px] border-[0.5px] border-green-500 bg-[#E9F6EF] px-3 py-3"
      >
        <span className="text-base font-normal text-black-900">{answer.text}</span>

        <div className="flex items-center gap-1.5">
          <CorrectAnswerIcon />
          <span className="text-sm font-normal text-[#3A3A3A]">
            {t('eLearning.onlineExams.addAI.classifications.correctAnswer')}
          </span>
        </div>
      </div>
    ) : (
      <div
        key={answer.id}
        className="flex items-center rounded-[14px] border border-[#DDE0E0] bg-gray-50 px-3 py-3"
      >
        <span className="flex-1 text-start text-base font-normal text-black-900">
          {answer.text}
        </span>
      </div>
    );

  return (
    <div
      className={`space-y-6 rounded-2xl border p-6 ${selected ? 'border-green-500/50' : 'border-black-100'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col items-start gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-3xl px-4 py-1 text-sm font-medium ${DIFFICULTY_BADGE[question.difficulty]}`}
            >
              {t(`eLearning.onlineExams.difficulty.${question.difficulty}`)}
            </span>
            <span className={`rounded-3xl px-4 py-1 text-sm font-medium ${typeBadgeClass}`}>
              {typeBadgeLabel}
            </span>
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="text-sm font-normal text-green-500">#{question.number}</span>
            <p className="flex-1 text-start text-base font-medium text-[#101828]">
              <bdi>{question.text}</bdi>
            </p>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label={t('common.edit')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-lightGreen-500/10 transition-opacity hover:opacity-80"
              >
                <MaskIcon src={EditIcon} color="#1A9F58" className="h-6 w-6" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label={t('common.delete')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 transition-opacity hover:opacity-80"
              >
                <MaskIcon src={TrashIcon} color="#DD0417" className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
      </div>

      {question.answers.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.answers.map(renderAnswer)}
        </div>
      )}

      {question.explanation && (
        <div className="flex items-center gap-3">
          <ExplanationCheckIcon />
          <p className="flex-1 text-start text-sm font-medium text-[#646969]">
            {t('eLearning.onlineExams.addAI.review.explanationLabel')}: {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
