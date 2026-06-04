import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import CustomImage from '@/shared/components/CustomImage';
import ExamReviewQuestionCard, { type ReviewQuestion } from './ExamReviewQuestionCard';
import { QUESTION_BANK } from './QuestionBankQuestionsStep';
import QuestionBankIcon from '@gradex/assets/icons/QuestionBank.svg';

// TODO: explanations will come from the question-bank backend alongside the questions.
const EXPLANATION = 'نوحد المقامات: ½ = 3/6 و ⅓ = 2/6 والمجموع 5/6';

function BannerCheckIcon() {
  return (
    <svg
      className="h-5 w-5 text-[#0E1F1F]"
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

type QuestionBankReviewStepProps = {
  selectedIds: string[];
  onRemove: (id: string) => void;
};

const QuestionBankReviewStep = ({ selectedIds, onRemove }: QuestionBankReviewStepProps) => {
  const { t } = useTranslation();

  const selected = new Set(selectedIds);
  const questions: ReviewQuestion[] = QUESTION_BANK.filter((question) =>
    selected.has(question.id)
  ).map((question) => ({ ...question, explanation: EXPLANATION }));

  return (
    <div className="space-y-6">
      {/* Selected questions count */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-4">
        <span className="text-base font-medium text-[#0E1F1F]">
          {t('eLearning.onlineExams.addAI.review.selectedQuestionsCount', {
            num: selectedIds.length,
          })}
        </span>
        <BannerCheckIcon />
      </div>

      {/* Selected questions */}
      <Card padding="md">
        {questions.length === 0 ? (
          <EmptyState
            icon={
              <CustomImage
                src={QuestionBankIcon}
                alt=""
                className="mx-auto h-[120px] w-[120px] mix-blend-luminosity"
              />
            }
            description={t('eLearning.onlineExams.addQuestionBank.reviewStep.emptyDescription')}
          />
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <ExamReviewQuestionCard
                key={question.id}
                question={question}
                onDelete={() => onRemove(question.id)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuestionBankReviewStep;
