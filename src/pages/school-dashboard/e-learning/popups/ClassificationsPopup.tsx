import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import SearchInput from '@/shared/components/SearchInput';
import CustomImage from '@/shared/components/CustomImage';
import { logger } from '@/lib/utils/logger';
import ChevronDownIcon from '@gradex/assets/icons/ChevronDown.svg';
import type {
  ReviewAnswer,
  ReviewDifficulty,
  ReviewQuestion,
} from '../components/ExamReviewQuestionCard';

type ClassificationCategory = {
  id: string;
  title: string;
  questions: ReviewQuestion[];
};

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
  explanation: 'نوحد المقامات: ½ = 3/6 و ⅓ = 2/6 والمجموع 5/6',
});

const MOCK_CATEGORIES: ClassificationCategory[] = [
  { id: 'cat-1', title: 'درس الضرب', questions: [makeQuestion('q1-1'), makeQuestion('q1-2')] },
  { id: 'cat-2', title: 'درس الضرب', questions: [makeQuestion('q2-1'), makeQuestion('q2-2')] },
  {
    id: 'cat-3',
    title: 'درس الضرب',
    questions: [makeQuestion('q3-1'), makeQuestion('q3-2'), makeQuestion('q3-3')],
  },
];

const DIFFICULTY_BADGE: Record<ReviewDifficulty, string> = {
  easy: 'bg-lightGreen-500/10 text-lightGreen-500',
  medium: 'bg-yellow-400/10 text-yellow-400',
  hard: 'bg-red-500/10 text-red-500',
};

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

type ClassificationsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (questions: ReviewQuestion[]) => void;
};

export default function ClassificationsPopup({
  isOpen,
  onClose,
  onAdd,
}: ClassificationsPopupProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(['cat-3']));
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(() => new Set());

  const query = searchQuery.trim().toLowerCase();
  const categories = MOCK_CATEGORIES.map((category) => {
    if (!query || category.title.toLowerCase().includes(query)) return category;
    return {
      ...category,
      questions: category.questions.filter((question) =>
        question.text.toLowerCase().includes(query)
      ),
    };
  }).filter(
    (category) =>
      !query || category.title.toLowerCase().includes(query) || category.questions.length > 0
  );

  const toggleCategory = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleQuestion = (id: string) =>
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleAdd = () => {
    const selected = MOCK_CATEGORIES.flatMap((category) => category.questions).filter((question) =>
      selectedQuestionIds.has(question.id)
    );
    logger.debug('Classification questions added', selected);
    onAdd?.(selected);
    onClose();
  };

  const renderAnswer = (answer: ReviewAnswer) =>
    answer.isCorrect ? (
      <div
        key={answer.id}
        className="flex items-center justify-between rounded-[14px] border-[0.5px] border-green-500 bg-[#E9F6EF] px-3 py-3"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-normal text-[#3A3A3A]">
            {t('eLearning.onlineExams.addAI.classifications.correctAnswer')}
          </span>
          <CorrectAnswerIcon />
        </div>
        <span className="text-base font-normal text-black-900">{answer.text}</span>
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

  const renderQuestion = (question: ReviewQuestion) => {
    const isSelected = selectedQuestionIds.has(question.id);
    return (
      <div key={question.id} className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => toggleQuestion(question.id)}
          aria-pressed={isSelected}
          className={`mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            isSelected ? 'border-green-500 bg-green-500' : 'border-[#CCCCCC] bg-white'
          }`}
        >
          {isSelected && <WhiteCheckIcon />}
        </button>

        <div className="flex-1 space-y-4 rounded-2xl border border-black-100 p-6">
          {/* Badges */}
          <div className="flex items-center gap-3">
            <span
              className={`rounded-3xl px-4 py-1 text-sm font-medium ${DIFFICULTY_BADGE[question.difficulty]}`}
            >
              {t(`eLearning.onlineExams.difficulty.${question.difficulty}`)}
            </span>
            <span className="rounded-3xl bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-500">
              {t('eLearning.onlineExams.addAI.classifications.multipleChoice')}
            </span>
          </div>

          {/* Question */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-green-500">#{question.number}</span>
            <p className="flex-1 text-start text-base font-medium text-[#101828]">
              {question.text}
            </p>
          </div>

          {/* Answers */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {question.answers.map(renderAnswer)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('eLearning.onlineExams.addAI.fields.classificationsTitle')}
      size="md"
    >
      <div className="flex flex-col gap-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('eLearning.onlineExams.addAI.classifications.searchPlaceholder')}
        />

        <div className="flex flex-col gap-4">
          {categories.map((category) => {
            const isExpanded = expandedIds.has(category.id);
            return (
              <div key={category.id} className="rounded-2xl border border-[#DDE0E0] p-4">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between"
                >
                  <span className="text-base font-medium text-black-900">{category.title}</span>
                  <CustomImage
                    src={ChevronDownIcon}
                    alt=""
                    aria-hidden="true"
                    className={`h-4 w-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-4 flex flex-col gap-4">
                    {category.questions.map(renderQuestion)}
                  </div>
                )}
              </div>
            );
          })}
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
