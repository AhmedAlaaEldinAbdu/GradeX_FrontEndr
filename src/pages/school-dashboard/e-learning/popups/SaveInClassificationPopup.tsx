import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import { logger } from '@/lib/utils/logger';
import ExamReviewQuestionCard, { type ReviewQuestion } from '../components/ExamReviewQuestionCard';

const CLASSIFICATION_OPTIONS = [
  {
    value: 'existing',
    labelKey: 'eLearning.onlineExams.addAI.saveClassification.existingClassification',
  },
  { value: 'new', labelKey: 'eLearning.onlineExams.addAI.saveClassification.newClassification' },
];

// TODO: replace with the school's educational stages from the backend.
const STAGE_OPTIONS = [
  { value: 'prep-3', label: '3 أعدادي' },
  { value: 'prep-2', label: '2 أعدادي' },
  { value: 'prep-1', label: '1 أعدادي' },
];

// TODO: these are the questions being saved; they will come from the generated
// exam questions once the question-bank endpoints are wired up.
const makeQuestion = (id: string): ReviewQuestion => ({
  id,
  number: 1,
  difficulty: 'easy',
  questionType: 'multipleChoice',
  text: 'ما هو ناتج ضرب ٧ × ٨؟',
  answers: [
    { id: `${id}-a`, text: '56', isCorrect: true },
    { id: `${id}-b`, text: '35' },
    { id: `${id}-c`, text: '35' },
    { id: `${id}-d`, text: '35' },
  ],
});

const MOCK_QUESTIONS: ReviewQuestion[] = [
  makeQuestion('sc-1'),
  makeQuestion('sc-2'),
  makeQuestion('sc-3'),
];

function WhiteCheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

type SaveInClassificationPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SaveInClassificationPopup({
  isOpen,
  onClose,
}: SaveInClassificationPopupProps) {
  const { t } = useTranslation();
  const [classification, setClassification] = useState('');
  const [stage, setStage] = useState('prep-3');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(
    () => new Set(MOCK_QUESTIONS.map((question) => question.id))
  );

  const toggleQuestion = (id: string) =>
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleAdd = () => {
    // Saving to the question bank will be wired to the backend later.
    logger.debug('Save in classification', {
      classification,
      stage,
      questionIds: [...selectedQuestionIds],
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('eLearning.onlineExams.addAI.review.saveInClassification')}
      size="md"
    >
      <div className="flex flex-col gap-6">
        {/* Classification (radio group) */}
        <div>
          <span className="required mb-1 block text-start text-base font-normal text-black-800">
            {t('eLearning.onlineExams.addAI.saveClassification.classification')}
          </span>
          <div className="flex flex-wrap items-center gap-8 pt-2">
            {CLASSIFICATION_OPTIONS.map((option) => {
              const isSelected = classification === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setClassification(option.value)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                      isSelected ? 'border-green-500' : 'border-[#878F8F]'
                    }`}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-green-500" />}
                  </span>
                  <span className="text-sm font-normal text-[#646969]">{t(option.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Educational stage */}
        <FormField
          label={t('eLearning.onlineExams.addAI.saveClassification.educationalStage')}
          required
          htmlFor="saveStage"
          name="saveStage"
        >
          <CustomSelect
            id="saveStage"
            value={stage}
            onChange={(value) => setStage(value as string)}
            options={STAGE_OPTIONS}
            showSearch={false}
            placeholder={t(
              'eLearning.onlineExams.addAI.saveClassification.educationalStagePlaceholder'
            )}
          />
        </FormField>

        {/* Questions */}
        <div className="rounded-2xl border border-[#DDE0E0] p-4">
          <p className="mb-4 text-start text-base font-normal text-[#0E1F1F]">
            {t('eLearning.onlineExams.addAI.saveClassification.questionsTitle')}
          </p>
          <div className="flex flex-col gap-4">
            {MOCK_QUESTIONS.map((question) => {
              const isSelected = selectedQuestionIds.has(question.id);
              return (
                <div key={question.id} className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggleQuestion(question.id)}
                    aria-pressed={isSelected}
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSelected ? 'border-green-500 bg-green-500' : 'border-[#CCCCCC] bg-white'
                    }`}
                  >
                    {isSelected && <WhiteCheckIcon />}
                  </button>
                  <div className="flex-1">
                    <ExamReviewQuestionCard question={question} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={handleAdd}>
            {t('eLearning.onlineExams.addAI.addButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
