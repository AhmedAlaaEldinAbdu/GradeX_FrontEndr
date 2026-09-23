import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import type {
  ReviewAnswer,
  ReviewDifficulty,
  ReviewQuestion,
  ReviewQuestionType,
} from './ExamReviewQuestionCard';

type EditReviewQuestionFormProps = {
  question: ReviewQuestion;
  onSave: (question: ReviewQuestion) => void;
  onCancel: () => void;
};

const DIFFICULTY_VALUES: ReviewDifficulty[] = ['easy', 'medium', 'hard'];

const EditReviewQuestionForm = ({ question, onSave, onCancel }: EditReviewQuestionFormProps) => {
  const { t } = useTranslation();

  const initialWrong = question.answers.filter((answer) => !answer.isCorrect).map((a) => a.text);

  const [text, setText] = useState(question.text);
  const [difficulty, setDifficulty] = useState<ReviewDifficulty>(question.difficulty);
  const [questionType, setQuestionType] = useState<ReviewQuestionType>(question.questionType);
  const [correctAnswer, setCorrectAnswer] = useState(
    question.answers.find((answer) => answer.isCorrect)?.text ?? ''
  );
  const [wrongAnswer, setWrongAnswer] = useState(initialWrong[0] ?? '');
  const [wrongAnswer2, setWrongAnswer2] = useState(initialWrong[1] ?? '');
  const [wrongAnswer3, setWrongAnswer3] = useState(initialWrong[2] ?? '');
  const [explanation, setExplanation] = useState(question.explanation ?? '');
  const isEssay = questionType === 'essay';

  const difficultyOptions = DIFFICULTY_VALUES.map((value) => ({
    value,
    label: t(`eLearning.onlineExams.difficulty.${value}`),
  }));
  const questionTypeOptions = [
    {
      value: 'multipleChoice',
      label: t('eLearning.onlineExams.addAI.classifications.multipleChoice'),
    },
    { value: 'trueFalse', label: t('eLearning.onlineExams.addAI.review.trueFalse') },
    // {
    //   value: 'essay',
    //   label: t('eLearning.onlineExams.addAI.review.essay', { defaultValue: 'Essay' }),
    // },
  ];

  const handleSave = () => {
    const wrongAnswers = isEssay
      ? []
      : [wrongAnswer, wrongAnswer2, wrongAnswer3].map((answer) => answer.trim()).filter(Boolean);

    const answers: ReviewAnswer[] = [
      { id: `${question.id}-c`, text: correctAnswer.trim(), isCorrect: true },
      ...wrongAnswers.map((answerText, index) => ({
        id: `${question.id}-w${index}`,
        text: answerText,
      })),
    ];

    onSave({
      ...question,
      text: text.trim(),
      difficulty,
      questionType,
      answers,
      explanation: explanation.trim() || undefined,
      points: question.points,
    });
  };

  return (
    <div className="space-y-6 rounded-2xl border border-black-100 p-6">
      {/* Question */}
      <FormField
        label={t('eLearning.onlineExams.addAI.review.editForm.question')}
        required
        htmlFor="editQuestionText"
        name="editQuestionText"
      >
        <Input
          id="editQuestionText"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('eLearning.onlineExams.addAI.review.editForm.questionPlaceholder')}
        />
      </FormField>

      {/* Difficulty + type */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addAI.review.editForm.difficulty')}
          required
          htmlFor="editQuestionDifficulty"
          name="editQuestionDifficulty"
        >
          <CustomSelect
            id="editQuestionDifficulty"
            value={difficulty}
            onChange={(value) => setDifficulty(value as ReviewDifficulty)}
            options={difficultyOptions}
            showSearch={false}
            placeholder={t('eLearning.onlineExams.addAI.review.editForm.difficultyPlaceholder')}
          />
        </FormField>

        <FormField
          label={t('eLearning.onlineExams.addAI.review.editForm.questionType')}
          required
          htmlFor="editQuestionType"
          name="editQuestionType"
        >
          <CustomSelect
            id="editQuestionType"
            value={questionType}
            onChange={(value) => setQuestionType(value as ReviewQuestionType)}
            options={questionTypeOptions}
            showSearch={false}
            placeholder={t('eLearning.onlineExams.addAI.review.editForm.questionTypePlaceholder')}
          />
        </FormField>
      </div>

      {/* Correct answer + first wrong answer */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('eLearning.onlineExams.addAI.review.editForm.correctAnswer')}
          required
          htmlFor="editCorrectAnswer"
          name="editCorrectAnswer"
        >
          <Input
            id="editCorrectAnswer"
            value={correctAnswer}
            onChange={(event) => setCorrectAnswer(event.target.value)}
            placeholder={t('eLearning.onlineExams.addAI.review.editForm.correctAnswerPlaceholder')}
          />
        </FormField>

        {!isEssay && (
          <FormField
            label={t('eLearning.onlineExams.addAI.review.editForm.wrongAnswer')}
            required
            htmlFor="editWrongAnswer"
            name="editWrongAnswer"
          >
            <Input
              id="editWrongAnswer"
              value={wrongAnswer}
              onChange={(event) => setWrongAnswer(event.target.value)}
              placeholder={t('eLearning.onlineExams.addAI.review.editForm.wrongAnswerPlaceholder')}
            />
          </FormField>
        )}
      </div>

      {/* Optional wrong answers */}
      {!isEssay && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label={t('eLearning.onlineExams.addAI.review.editForm.wrongAnswer')}
            optional
            htmlFor="editWrongAnswer2"
            name="editWrongAnswer2"
          >
            <Input
              id="editWrongAnswer2"
              value={wrongAnswer2}
              onChange={(event) => setWrongAnswer2(event.target.value)}
              placeholder={t('eLearning.onlineExams.addAI.review.editForm.wrongAnswerPlaceholder')}
            />
          </FormField>

          <FormField
            label={t('eLearning.onlineExams.addAI.review.editForm.wrongAnswer')}
            optional
            htmlFor="editWrongAnswer3"
            name="editWrongAnswer3"
          >
            <Input
              id="editWrongAnswer3"
              value={wrongAnswer3}
              onChange={(event) => setWrongAnswer3(event.target.value)}
              placeholder={t('eLearning.onlineExams.addAI.review.editForm.wrongAnswerPlaceholder')}
            />
          </FormField>
        </div>
      )}

      {/* Answer explanation */}
      <FormField
        label={t('eLearning.onlineExams.addAI.review.editForm.explanation')}
        optional
        htmlFor="editExplanation"
        name="editExplanation"
      >
        <Input
          id="editExplanation"
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          placeholder={t('eLearning.onlineExams.addAI.review.editForm.explanationPlaceholder')}
        />
      </FormField>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="button" variant="primary" onClick={handleSave}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default EditReviewQuestionForm;
