import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import ExamReviewQuestionCard, { type ReviewQuestion } from './ExamReviewQuestionCard';
import EditReviewQuestionForm from './EditReviewQuestionForm';

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

type AIExamReviewStepProps = {
  generatedQuestions: ReviewQuestion[];
  isRegenerating?: boolean;
  onRegenerate: () => void;
  onRemoveGenerated: (id: string) => void;
  onUpdateGenerated: (question: ReviewQuestion) => void;
  footer?: ReactNode;
};

const AIExamReviewStep = ({
  generatedQuestions,
  isRegenerating = false,
  onRegenerate,
  onRemoveGenerated,
  onUpdateGenerated,
  footer,
}: AIExamReviewStepProps) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);

  const regenerate = () => {
    setEditingId(null);
    onRegenerate();
  };

  const saveGenerated = (updated: ReviewQuestion) => {
    onUpdateGenerated(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <Card padding="md">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-4">
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-[#0E1F1F]">
                {t('eLearning.onlineExams.addAI.review.selectedQuestionsCount', {
                  num: generatedQuestions.length,
                })}
              </span>
              <BannerCheckIcon />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={regenerate}
              disabled={isRegenerating}
            >
              {isRegenerating
                ? t('common.generating')
                : t('eLearning.onlineExams.addAI.review.regenerate')}
            </Button>
          </div>

          <div className="space-y-6">
            {generatedQuestions.length === 0 && (
              <p className="py-6 text-center text-sm font-normal text-[#646969]">
                {t('common.noDataFound')}
              </p>
            )}
            {generatedQuestions.map((question) =>
              editingId === question.id ? (
                <EditReviewQuestionForm
                  key={question.id}
                  question={question}
                  onSave={saveGenerated}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <ExamReviewQuestionCard
                  key={question.id}
                  question={question}
                  onDelete={() => onRemoveGenerated(question.id)}
                  onEdit={() => setEditingId(question.id)}
                />
              )
            )}
          </div>

          {footer}
        </div>
      </Card>
    </div>
  );
};

export default AIExamReviewStep;
