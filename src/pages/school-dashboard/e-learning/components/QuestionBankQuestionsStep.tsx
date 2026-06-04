import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchInput from '@/shared/components/SearchInput';
import CustomSelect from '@/shared/components/CustomSelect';
import ExamReviewQuestionCard, {
  type ReviewDifficulty,
  type ReviewQuestion,
  type ReviewQuestionType,
} from './ExamReviewQuestionCard';

const QUESTION_TYPE_VALUES: ReviewQuestionType[] = ['multipleChoice', 'trueFalse'];
const DIFFICULTY_VALUES: ReviewDifficulty[] = ['easy', 'medium', 'hard'];

// TODO: replace with the questions returned by the question-bank endpoints.
export const QUESTION_BANK: ReviewQuestion[] = [
  {
    id: 'qb-1',
    number: 1,
    difficulty: 'easy',
    questionType: 'multipleChoice',
    text: 'ما هو ناتج ضرب ٧ × ٨؟',
    answers: [
      { id: 'qb-1-a', text: '56', isCorrect: true },
      { id: 'qb-1-b', text: '35' },
      { id: 'qb-1-c', text: '35' },
      { id: 'qb-1-d', text: '35' },
    ],
  },
  {
    id: 'qb-2',
    number: 1,
    difficulty: 'medium',
    questionType: 'trueFalse',
    text: 'ناتج ضرب ٧ × ٨ = 56',
    answers: [
      { id: 'qb-2-a', text: 'صح', isCorrect: true },
      { id: 'qb-2-b', text: 'خطأ' },
    ],
  },
  {
    id: 'qb-3',
    number: 1,
    difficulty: 'easy',
    questionType: 'trueFalse',
    text: 'ناتج ضرب ٧ × ٨ = 56',
    answers: [
      { id: 'qb-3-a', text: 'صح', isCorrect: true },
      { id: 'qb-3-b', text: 'خطأ' },
    ],
  },
  {
    id: 'qb-4',
    number: 1,
    difficulty: 'hard',
    questionType: 'multipleChoice',
    text: 'ما هو ناتج ضرب ٧ × ٨؟',
    answers: [
      { id: 'qb-4-a', text: '56', isCorrect: true },
      { id: 'qb-4-b', text: '35' },
      { id: 'qb-4-c', text: '35' },
      { id: 'qb-4-d', text: '35' },
    ],
  },
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

type QuestionBankQuestionsStepProps = {
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
};

const QuestionBankQuestionsStep = ({
  selectedIds,
  onSelectedChange,
}: QuestionBankQuestionsStepProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const typeOptions = QUESTION_TYPE_VALUES.map((value) => ({
    value,
    label:
      value === 'multipleChoice'
        ? t('eLearning.onlineExams.addAI.classifications.multipleChoice')
        : t('eLearning.onlineExams.addAI.review.trueFalse'),
  }));
  const levelOptions = DIFFICULTY_VALUES.map((value) => ({
    value,
    label: t(`eLearning.onlineExams.difficulty.${value}`),
  }));

  const query = search.trim().toLowerCase();
  const questions = QUESTION_BANK.filter(
    (question) =>
      (!query || question.text.toLowerCase().includes(query)) &&
      (!typeFilter || question.questionType === typeFilter) &&
      (!levelFilter || question.difficulty === levelFilter)
  );

  const selected = new Set(selectedIds);
  const toggleQuestion = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedChange([...next]);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full sm:w-[260px]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('eLearning.onlineExams.addQuestionBank.questionsStep.searchPlaceholder')}
          />
        </div>
        <div className="w-full sm:w-[160px]">
          <CustomSelect
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as string)}
            options={typeOptions}
            showSearch={false}
            placeholder={t('eLearning.onlineExams.addQuestionBank.questionsStep.typePlaceholder')}
          />
        </div>
        <div className="w-full sm:w-[140px]">
          <CustomSelect
            value={levelFilter}
            onChange={(value) => setLevelFilter(value as string)}
            options={levelOptions}
            showSearch={false}
            placeholder={t('eLearning.onlineExams.addQuestionBank.questionsStep.levelPlaceholder')}
          />
        </div>
      </div>

      {/* Selectable questions */}
      <div className="space-y-6">
        {questions.map((question) => {
          const isSelected = selected.has(question.id);
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
                <ExamReviewQuestionCard question={question} selected={isSelected} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionBankQuestionsStep;
