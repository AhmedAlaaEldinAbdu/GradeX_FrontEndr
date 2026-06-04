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
import QuestionBankBasicInfoStep from './components/QuestionBankBasicInfoStep';
import QuestionBankQuestionsStep from './components/QuestionBankQuestionsStep';
import QuestionBankReviewStep from './components/QuestionBankReviewStep';
import {
  QuestionBankExamSchema,
  type QuestionBankExamProps,
} from '@/validations/question-bank-exam-validations';
import FilesFillGreenIcon from '@gradex/assets/icons/FilesFillGreen.svg';
import QuestionBankIcon from '@gradex/assets/icons/QuestionBank.svg';
import DataSourcesIcon from '@gradex/assets/icons/DataSources.svg';

const ONLINE_EXAMS_PATH = '/lms/online-exams';
const LAST_STEP = 3;

const STEP1_FIELDS: (keyof QuestionBankExamProps)[] = [
  'titleAr',
  'titleEn',
  'subject',
  'stage',
  'grades',
  'targetAudience',
  'startDate',
  'totalPoints',
  'passingGrade',
  'resultVisibility',
];

export default function AddQuestionBankExamPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const methods = useForm<QuestionBankExamProps>({
    resolver: yupResolver(QuestionBankExamSchema),
    mode: 'onChange',
    reValidateMode: 'onSubmit',
    defaultValues: {
      titleAr: '',
      titleEn: '',
      subject: '',
      stage: '',
      grades: [],
      targetAudience: '',
      startDate: '',
      endDate: '',
      totalPoints: '',
      duration: '',
      passingGrade: '',
      resultVisibility: '',
    },
  });

  const scrollToFirstError = useScrollToFirstError<QuestionBankExamProps>();

  const breadcrumbItems = [
    { label: 'sidebar.academicAffairs' },
    { label: 'sidebar.lms' },
    { label: 'eLearning.onlineExams.title', path: ONLINE_EXAMS_PATH },
    { label: 'eLearning.onlineExams.create.questionBank.title' },
  ];

  const steps = [
    {
      id: 1,
      label: t('eLearning.onlineExams.addQuestionBank.steps.basicInfo'),
      icon: <CustomImage src={FilesFillGreenIcon} className="h-6 w-6" alt="" />,
    },
    {
      id: 2,
      label: t('eLearning.onlineExams.addQuestionBank.steps.questions'),
      icon: <CustomImage src={QuestionBankIcon} className="h-6 w-6" alt="" />,
    },
    {
      id: 3,
      label: t('eLearning.onlineExams.addQuestionBank.steps.review'),
      icon: <CustomImage src={DataSourcesIcon} className="h-6 w-6" alt="" />,
    },
  ];

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
    if (currentStep < LAST_STEP) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    // Final step — creation will be wired to the backend later.
    logger.debug('Question bank exam — finalize', {
      values: methods.getValues(),
      selectedQuestionIds,
    });
    navigate(ONLINE_EXAMS_PATH);
  };

  const handleSecondary = () => {
    if (currentStep === 1) {
      navigate(ONLINE_EXAMS_PATH);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const primaryLabel =
    currentStep === LAST_STEP
      ? t('eLearning.onlineExams.addQuestionBank.submit')
      : t('common.next');
  const secondaryLabel = currentStep === 1 ? t('common.cancel') : t('common.previous');

  const footer = (
    <div className="flex items-center justify-between">
      <div />
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={handleSecondary}>
          {secondaryLabel}
        </Button>
        <Button type="button" variant="primary" onClick={() => void handlePrimary()}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="eLearning.onlineExams.create.questionBank.title" />

      <FormProvider {...methods}>
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <StepIndicator steps={steps} currentStep={currentStep} />

          {currentStep === LAST_STEP ? (
            <div className="space-y-6">
              <QuestionBankReviewStep
                selectedIds={selectedQuestionIds}
                onRemove={(id) =>
                  setSelectedQuestionIds((prev) => prev.filter((questionId) => questionId !== id))
                }
              />
              {footer}
            </div>
          ) : (
            <Card padding="md">
              <div className="space-y-8">
                {currentStep === 1 && <QuestionBankBasicInfoStep />}
                {currentStep === 2 && (
                  <QuestionBankQuestionsStep
                    selectedIds={selectedQuestionIds}
                    onSelectedChange={setSelectedQuestionIds}
                  />
                )}
                {footer}
              </div>
            </Card>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
