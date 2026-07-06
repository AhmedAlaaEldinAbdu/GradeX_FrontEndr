import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import StepIndicator from '@/shared/components/StepIndicator';
import CustomImage from '@/shared/components/CustomImage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { useToast } from '@/shared/context/ToastContext';
import {
  createAIExam as createAIExamThunk,
  generateAIExamQuestions as generateAIExamQuestionsThunk,
  removeGeneratedQuestion,
  resetAIExamState,
  updateGeneratedQuestion,
} from '@/redux/features/ai-exam/aiExamSlice';
import AIExamBasicInfoStep from './components/AIExamBasicInfoStep';
import AIExamQuestionsStep from './components/AIExamQuestionsStep';
import AIExamReviewStep from './components/AIExamReviewStep';
import SaveInClassificationPopup from './popups/SaveInClassificationPopup';
import type {
  ReviewAnswer,
  ReviewDifficulty,
  ReviewQuestion,
  ReviewQuestionType,
} from './components/ExamReviewQuestionCard';
import { AIExamSchema, type AIExamProps } from '@/validations/ai-exam-validations';
import type {
  AIExamGeneratedQuestion,
  AIExamQuestionPayload,
  AIExamQuestionType,
  CreateAIExamRequest,
  GenerateAIExamQuestionsRequest,
} from '@/services/api/types/ai-exam.types';
import FilesFillGreenIcon from '@gradex/assets/icons/FilesFillGreen.svg';
import QuestionBankIcon from '@gradex/assets/icons/QuestionBank.svg';
import SparklesIcon from '@gradex/assets/icons/Sparkles.svg';

const ONLINE_EXAMS_PATH = '/lms/online-exams';
const LAST_STEP = 3;

const STEP1_FIELDS: (keyof AIExamProps)[] = [
  'titleAr',
  'titleEn',
  'topic',
  'language',
  'subject',
  'academicSystem',
  'grades',
  'classrooms',
  'targetAudience',
  'startDate',
  'passingGrade',
];
const STEP2_FIELDS: (keyof AIExamProps)[] = [
  'numberOfQuestions',
  'totalPoints',
  'passingGrade',
  'resultVisibility',
];

const DEFAULT_AI_QUESTION_TYPES: AIExamQuestionType[] = ['MCQ', 'TrueFalse'];

const LANGUAGE_NUMBER_BY_CODE: Record<string, number> = {
  ar: 1,
  en: 2,
  de: 3,
  fr: 4,
  ru: 5,
};

const LANGUAGE_NAME_BY_CODE: Record<string, string> = {
  ar: 'Arabic',
  en: 'English',
  de: 'German',
  fr: 'French',
  ru: 'Russian',
};

const toNumber = (value: unknown): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const toIsoDate = (value: string): string => {
  if (!value) return '';
  return value.includes('T') ? value : new Date(value).toISOString();
};

const mapResultVisibility = (value: string): number => (value === 'afterEachQuestion' ? 2 : 1);

const mapStudentSelect = (value: string): number => (value === 'specific' ? 2 : 1);

const mapLanguageToNumber = (value: string): number => LANGUAGE_NUMBER_BY_CODE[value] ?? 1;

const mapLanguageToName = (value: string): string => LANGUAGE_NAME_BY_CODE[value] ?? value;

const mapDifficultyToReview = (value: string): ReviewDifficulty => {
  const normalized = value.toLowerCase();
  if (normalized === 'hard') return 'hard';
  if (normalized === 'medium') return 'medium';
  return 'easy';
};

const mapDifficultyToApi = (value: ReviewDifficulty): string => {
  if (value === 'hard') return 'Hard';
  if (value === 'medium') return 'Medium';
  return 'Easy';
};

const mapQuestionTypeToReview = (value: string): ReviewQuestionType => {
  const normalized = value.toLowerCase();
  if (normalized.includes('true')) return 'trueFalse';
  if (normalized.includes('essay')) return 'essay';
  return 'multipleChoice';
};

const mapQuestionTypeToApi = (value: ReviewQuestionType): AIExamQuestionType => {
  if (value === 'trueFalse') return 'TrueFalse';
  if (value === 'essay') return 'Essay';
  return 'MCQ';
};

const uniqueNonEmpty = (values: string[]): string[] =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const buildReviewAnswers = (question: AIExamGeneratedQuestion): ReviewAnswer[] => {
  const correctAnswer = question.correctAnswer.trim();
  const questionType = mapQuestionTypeToReview(question.type);

  if (questionType === 'essay') {
    return correctAnswer
      ? [{ id: `${question.id}-answer`, text: correctAnswer, isCorrect: true }]
      : [];
  }

  const options = uniqueNonEmpty([correctAnswer, ...(question.options ?? [])]);
  return options.map((option, index) => ({
    id: `${question.id}-answer-${index}`,
    text: option,
    isCorrect: correctAnswer ? option.toLowerCase() === correctAnswer.toLowerCase() : index === 0,
  }));
};

const mapGeneratedQuestionToReview = (question: AIExamGeneratedQuestion): ReviewQuestion => ({
  id: question.id,
  number: question.order,
  difficulty: mapDifficultyToReview(question.difficulty),
  questionType: mapQuestionTypeToReview(question.type),
  text: question.text,
  answers: buildReviewAnswers(question),
  explanation: question.explanation || undefined,
  points: question.points,
});

const getCorrectAnswer = (question: ReviewQuestion): string =>
  question.answers.find((answer) => answer.isCorrect)?.text ?? question.answers[0]?.text ?? '';

const mapReviewQuestionToGenerated = (question: ReviewQuestion): AIExamGeneratedQuestion => ({
  id: question.id,
  text: question.text,
  type: mapQuestionTypeToApi(question.questionType),
  options:
    question.questionType === 'essay'
      ? []
      : uniqueNonEmpty(question.answers.map((answer) => answer.text)),
  correctAnswer: getCorrectAnswer(question),
  points: question.points ?? 0,
  difficulty: mapDifficultyToApi(question.difficulty),
  order: question.number,
  explanation: question.explanation ?? '',
});

const mapReviewQuestionToPayload = (
  question: ReviewQuestion,
  order: number,
  fallbackPoints: number
): AIExamQuestionPayload => {
  const mapped = mapReviewQuestionToGenerated(question);

  return {
    text: mapped.text,
    type: mapped.type,
    options: mapped.options,
    correctAnswer: mapped.correctAnswer,
    points: mapped.points || fallbackPoints,
    difficulty: mapped.difficulty,
    order,
    explanation: mapped.explanation,
  };
};

const buildGeneratePayload = (values: AIExamProps): GenerateAIExamQuestionsRequest => ({
  topic: values.topic,
  language: mapLanguageToName(values.language),
  questionsCount: toNumber(values.numberOfQuestions),
  totalPoints: toNumber(values.totalPoints),
  passingScore: toNumber(values.passingGrade),
  durationMinutes: toNumber(values.duration),
  resultVisibility: mapResultVisibility(values.resultVisibility),
  isExplainedQuestions: Boolean(values.generateExplanation),
  easyPercentage: toNumber(values.difficultyEasy),
  mediumPercentage: toNumber(values.difficultyMedium),
  hardPercentage: toNumber(values.difficultyHard),
  questionTypes: DEFAULT_AI_QUESTION_TYPES,
});

const buildCreatePayload = (
  values: AIExamProps,
  schoolBranchId: string,
  questions: ReviewQuestion[]
): CreateAIExamRequest => {
  const totalPoints = toNumber(values.totalPoints);
  const fallbackPoints = questions.length > 0 ? Math.round(totalPoints / questions.length) : 0;
  const grades = Array.isArray(values.grades) ? values.grades : [];
  const classrooms = Array.isArray(values.classrooms) ? values.classrooms : [];
  const studentIds = Array.isArray(values.studentIds) ? values.studentIds : [];
  const questionPayloads = questions.map((question, index) =>
    mapReviewQuestionToPayload(question, index + 1, fallbackPoints)
  );

  return {
    schoolBrancheId: schoolBranchId,
    titleAr: values.titleAr,
    titleEn: values.titleEn,
    topic: values.topic,
    language: mapLanguageToNumber(values.language),
    materialId: values.subject,
    gradeId: grades[0] ?? '',
    startDate: toIsoDate(values.startDate),
    endDate: toIsoDate(values.endDate || values.startDate),
    questionsCount: toNumber(values.numberOfQuestions) || questionPayloads.length,
    totalPoints,
    passingScore: toNumber(values.passingGrade),
    durationMinutes: toNumber(values.duration),
    resultVisibility: mapResultVisibility(values.resultVisibility),
    isExplainedQuestions: Boolean(values.generateExplanation),
    easyPercentage: toNumber(values.difficultyEasy),
    mediumPercentage: toNumber(values.difficultyMedium),
    hardPercentage: toNumber(values.difficultyHard),
    studentSelect: mapStudentSelect(values.targetAudience),
    classroomIds: classrooms,
    studentIds: values.targetAudience === 'specific' ? studentIds : [],
    questions: questionPayloads,
  };
};

export default function AddAIExamPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const schoolBranchId = getCurrentSchoolBranchId();
  const generatedQuestions = useAppSelector((state) => state.aiExam.generatedQuestions);
  const isGenerating = useAppSelector((state) => state.aiExam.isGenerating);
  const isCreating = useAppSelector((state) => state.aiExam.isCreating);
  const [currentStep, setCurrentStep] = useState(1);
  const [classificationQuestions, setClassificationQuestions] = useState<ReviewQuestion[]>([]);
  const [isSaveInClassificationOpen, setIsSaveInClassificationOpen] = useState(false);
  const generatedReviewQuestions = useMemo(
    () => generatedQuestions.map(mapGeneratedQuestionToReview),
    [generatedQuestions]
  );

  const methods = useForm<AIExamProps>({
    resolver: yupResolver(AIExamSchema),
    mode: 'onChange',
    reValidateMode: 'onSubmit',
    defaultValues: {
      titleAr: '',
      titleEn: '',
      topic: '',
      language: '',
      subject: '',
      academicSystem: '',
      grades: [],
      classrooms: [],
      targetAudience: '',
      studentIds: [],
      startDate: '',
      endDate: '',
      passingGrade: '',
      duration: '',
      numberOfQuestions: '',
      totalPoints: '',
      resultVisibility: '',
      difficultyEasy: 0,
      difficultyMedium: 0,
      difficultyHard: 0,
      generateExplanation: false,
    },
  });

  const scrollToFirstError = useScrollToFirstError<AIExamProps>();

  useEffect(() => {
    dispatch(resetAIExamState());
    return () => {
      dispatch(resetAIExamState());
    };
  }, [dispatch]);

  const breadcrumbItems = [
    { label: 'sidebar.academicAffairs' },
    { label: 'sidebar.lms' },
    { label: 'eLearning.onlineExams.title', path: ONLINE_EXAMS_PATH },
    { label: 'eLearning.onlineExams.create.ai.title' },
  ];

  const steps = [
    {
      id: 1,
      label: t('eLearning.onlineExams.addAI.steps.basicInfo'),
      icon: <CustomImage src={FilesFillGreenIcon} className="h-6 w-6" alt="" />,
    },
    {
      id: 2,
      label: t('eLearning.onlineExams.addAI.steps.questions'),
      icon: <CustomImage src={QuestionBankIcon} className="h-6 w-6" alt="" />,
    },
    {
      id: 3,
      label: t('eLearning.onlineExams.addAI.steps.review'),
      icon: <CustomImage src={SparklesIcon} className="h-6 w-6" alt="" />,
    },
  ];

  const handleClassificationsSelected = (questions: ReviewQuestion[]) => {
    setClassificationQuestions((prev) => {
      const seen = new Set(prev.map((question) => question.id));
      return [...prev, ...questions.filter((question) => !seen.has(question.id))];
    });
  };

  const showSubmitError = (error: unknown) => {
    if (typeof error === 'string' && error.trim()) {
      showToast({ message: error, type: 'error', isRaw: true });
      return;
    }
    showToast({ message: 'common.errorOccurred', type: 'error' });
  };

  const generateQuestions = async (goToReview: boolean) => {
    try {
      await dispatch(
        generateAIExamQuestionsThunk(buildGeneratePayload(methods.getValues()))
      ).unwrap();
      if (goToReview) {
        setCurrentStep(LAST_STEP);
      }
    } catch (error) {
      showSubmitError(error);
    }
  };

  const handlePrimary = async () => {
    if (currentStep === 1) {
      const isValid = await methods.trigger(STEP1_FIELDS);
      if (isValid) {
        setCurrentStep(2);
      } else {
        scrollToFirstError(methods.formState.errors);
      }
      return;
    }

    if (currentStep === 2) {
      const isValid = await methods.trigger(STEP2_FIELDS);
      if (!isValid) {
        scrollToFirstError(methods.formState.errors);
        return;
      }
      await generateQuestions(true);
      return;
    }

    if (!schoolBranchId) {
      showToast({ message: 'common.errorOccurred', type: 'error' });
      return;
    }

    const questions = [...generatedReviewQuestions, ...classificationQuestions];
    if (questions.length === 0) {
      showToast({ message: 'common.errorOccurred', type: 'error' });
      return;
    }

    try {
      await dispatch(
        createAIExamThunk(buildCreatePayload(methods.getValues(), schoolBranchId, questions))
      ).unwrap();
      showToast({ message: 'common.successAdd', type: 'success' });
      navigate(ONLINE_EXAMS_PATH);
    } catch (error) {
      showSubmitError(error);
    }
  };

  const handleSecondary = () => {
    if (currentStep === 1) {
      navigate(ONLINE_EXAMS_PATH);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveInClassification = () => {
    setIsSaveInClassificationOpen(true);
  };

  const handleUpdateGeneratedQuestion = (question: ReviewQuestion) => {
    dispatch(updateGeneratedQuestion(mapReviewQuestionToGenerated(question)));
  };

  const getPrimaryLabel = () => {
    if (currentStep === 2 && isGenerating) return t('common.generating');
    if (currentStep === LAST_STEP && isCreating) return t('common.saving');
    if (currentStep === 1) return t('common.next');
    if (currentStep === 2) return t('eLearning.onlineExams.addAI.generateQuestions');
    return t('eLearning.onlineExams.addAI.submit');
  };

  const primaryLabel = getPrimaryLabel();
  const secondaryLabel = currentStep === 1 ? t('common.cancel') : t('common.previous');
  const isBusy = isGenerating || isCreating;

  const footer = (
    <div className="flex items-center justify-between">
      <div />
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={handleSecondary} disabled={isBusy}>
          {secondaryLabel}
        </Button>
        {currentStep === LAST_STEP && (
          <button
            type="button"
            onClick={handleSaveInClassification}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#A7F1CA] bg-[#E5FFF4] px-5 py-2 text-lg font-medium text-green-500 transition-colors hover:bg-[#d6fbe9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('eLearning.onlineExams.addAI.review.saveInClassification')}
          </button>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={() => void handlePrimary()}
          disabled={isBusy}
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="eLearning.onlineExams.create.ai.title" />

      <FormProvider {...methods}>
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <StepIndicator steps={steps} currentStep={currentStep} />

          {currentStep === LAST_STEP ? (
            <AIExamReviewStep
              generatedQuestions={generatedReviewQuestions}
              classificationQuestions={classificationQuestions}
              isRegenerating={isGenerating}
              onRegenerate={() => void generateQuestions(false)}
              onRemoveGenerated={(id) => dispatch(removeGeneratedQuestion(id))}
              onUpdateGenerated={handleUpdateGeneratedQuestion}
              onRemoveClassification={(id) =>
                setClassificationQuestions((prev) => prev.filter((question) => question.id !== id))
              }
              footer={footer}
            />
          ) : (
            <Card padding="md">
              <div className="space-y-8">
                {currentStep === 1 && <AIExamBasicInfoStep />}
                {currentStep === 2 && (
                  <AIExamQuestionsStep onClassificationsSelected={handleClassificationsSelected} />
                )}
                {footer}
              </div>
            </Card>
          )}
        </form>
      </FormProvider>

      <SaveInClassificationPopup
        isOpen={isSaveInClassificationOpen}
        onClose={() => setIsSaveInClassificationOpen(false)}
      />
    </div>
  );
}
