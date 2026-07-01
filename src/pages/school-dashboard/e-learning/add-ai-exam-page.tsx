import { useState } from 'react';
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
import { logger } from '@/lib/utils/logger';
import AIExamBasicInfoStep from './components/AIExamBasicInfoStep';
import AIExamQuestionsStep from './components/AIExamQuestionsStep';
import AIExamReviewStep from './components/AIExamReviewStep';
import SaveInClassificationPopup from './popups/SaveInClassificationPopup';
import type { ReviewQuestion } from './components/ExamReviewQuestionCard';
import { AIExamSchema, type AIExamProps } from '@/validations/ai-exam-validations';
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

export default function AddAIExamPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [classificationQuestions, setClassificationQuestions] = useState<ReviewQuestion[]>([]);
  const [isSaveInClassificationOpen, setIsSaveInClassificationOpen] = useState(false);

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
      // "Generate questions" — validate the step, then move on to review.
      const isValid = await methods.trigger(STEP2_FIELDS);
      if (!isValid) {
        scrollToFirstError(methods.formState.errors);
        return;
      }
      logger.debug('AI exam — generate questions', methods.getValues());
      setCurrentStep(LAST_STEP);
      return;
    }
    // Final step — creation will be wired to the backend later.
    logger.debug('AI exam — finalize', { values: methods.getValues(), classificationQuestions });
    navigate(ONLINE_EXAMS_PATH);
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

  const primaryLabel =
    currentStep === 1
      ? t('common.next')
      : currentStep === 2
        ? t('eLearning.onlineExams.addAI.generateQuestions')
        : t('eLearning.onlineExams.addAI.submit');
  const secondaryLabel = currentStep === 1 ? t('common.cancel') : t('common.previous');

  const footer = (
    <div className="flex items-center justify-between">
      <div />
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={handleSecondary}>
          {secondaryLabel}
        </Button>
        {currentStep === LAST_STEP && (
          <button
            type="button"
            onClick={handleSaveInClassification}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#A7F1CA] bg-[#E5FFF4] px-5 py-2 text-lg font-medium text-green-500 transition-colors hover:bg-[#d6fbe9]"
          >
            {t('eLearning.onlineExams.addAI.review.saveInClassification')}
          </button>
        )}
        <Button type="button" variant="primary" onClick={() => void handlePrimary()}>
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
            <div className="space-y-6">
              <AIExamReviewStep
                classificationQuestions={classificationQuestions}
                onRemoveClassification={(id) =>
                  setClassificationQuestions((prev) =>
                    prev.filter((question) => question.id !== id)
                  )
                }
              />
              {footer}
            </div>
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
