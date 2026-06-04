import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import ExamReviewQuestionCard, { type ReviewQuestion } from './ExamReviewQuestionCard';
import EditReviewQuestionForm from './EditReviewQuestionForm';

const EXPLANATION = 'نوحد المقامات: ½ = 3/6 و ⅓ = 2/6 والمجموع 5/6';

const GENERATED_QUESTIONS: ReviewQuestion[] = [
  {
    id: 'gen-1',
    number: 1,
    difficulty: 'easy',
    questionType: 'multipleChoice',
    text: 'ما هو ناتج ضرب ٧ × ٨؟',
    answers: [
      { id: 'gen-1-a', text: '56', isCorrect: true },
      { id: 'gen-1-b', text: '35' },
      { id: 'gen-1-c', text: '35' },
      { id: 'gen-1-d', text: '35' },
    ],
    explanation: EXPLANATION,
  },
  {
    id: 'gen-2',
    number: 1,
    difficulty: 'hard',
    questionType: 'multipleChoice',
    text: 'ما هو ناتج ضرب ٧ × ٨؟',
    answers: [
      { id: 'gen-2-a', text: '56', isCorrect: true },
      { id: 'gen-2-b', text: '35' },
      { id: 'gen-2-c', text: '35' },
      { id: 'gen-2-d', text: '35' },
    ],
    explanation: EXPLANATION,
  },
  {
    id: 'gen-3',
    number: 1,
    difficulty: 'medium',
    questionType: 'trueFalse',
    text: 'ناتج ضرب ٧ × ٨ = 56',
    answers: [
      { id: 'gen-3-a', text: 'صح', isCorrect: true },
      { id: 'gen-3-b', text: 'خطأ' },
    ],
    explanation: EXPLANATION,
  },
  {
    id: 'gen-4',
    number: 1,
    difficulty: 'easy',
    questionType: 'trueFalse',
    text: 'ناتج ضرب ٧ × ٨ = 56',
    answers: [
      { id: 'gen-4-a', text: 'صح', isCorrect: true },
      { id: 'gen-4-b', text: 'خطأ' },
    ],
    explanation: EXPLANATION,
  },
];

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
  classificationQuestions: ReviewQuestion[];
  onRemoveClassification: (id: string) => void;
};

const AIExamReviewStep = ({
  classificationQuestions,
  onRemoveClassification,
}: AIExamReviewStepProps) => {
  const { t } = useTranslation();
  // Generated questions are local for now; regeneration/creation is wired to the backend later.
  const [generated, setGenerated] = useState<ReviewQuestion[]>(GENERATED_QUESTIONS);
  const [editingId, setEditingId] = useState<string | null>(null);

  const removeGenerated = (id: string) =>
    setGenerated((prev) => prev.filter((question) => question.id !== id));
  const regenerate = () => {
    setGenerated(GENERATED_QUESTIONS);
    setEditingId(null);
  };
  const saveGenerated = (updated: ReviewQuestion) => {
    setGenerated((prev) =>
      prev.map((question) => (question.id === updated.id ? updated : question))
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Classification questions added from the popup */}
      {classificationQuestions.length > 0 && (
        <Card padding="md">
          <div className="space-y-4">
            <h3 className="text-start text-base font-medium text-[#101828]">
              {t('eLearning.onlineExams.addAI.review.sectionTitle')}
            </h3>
            <div className="space-y-4">
              {classificationQuestions.map((question) => (
                <ExamReviewQuestionCard
                  key={question.id}
                  question={question}
                  onDelete={() => onRemoveClassification(question.id)}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Generated questions */}
      <Card padding="md">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-4">
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-[#0E1F1F]">
                {t('eLearning.onlineExams.addAI.review.selectedQuestionsCount', {
                  num: generated.length,
                })}
              </span>
              <BannerCheckIcon />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={regenerate}>
              {t('eLearning.onlineExams.addAI.review.regenerate')}
            </Button>
          </div>

          <div className="space-y-6">
            {generated.map((question) =>
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
                  onDelete={() => removeGenerated(question.id)}
                  onEdit={() => setEditingId(question.id)}
                />
              )
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIExamReviewStep;
