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
import {
  AIExamBasicInfoSchema,
  type AIExamBasicInfoProps,
} from '@/validations/ai-exam-validations';
import FilesFillGreenIcon from '@gradex/assets/icons/FilesFillGreen.svg';
import QuestionBankIcon from '@gradex/assets/icons/QuestionBank.svg';
import SparklesIcon from '@gradex/assets/icons/Sparkles.svg';

const ONLINE_EXAMS_PATH = '/lms/online-exams';
const LAST_STEP = 3;

export default function AddAIExamPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const methods = useForm<AIExamBasicInfoProps>({
    resolver: yupResolver(AIExamBasicInfoSchema),
    mode: 'onChange',
    reValidateMode: 'onSubmit',
    defaultValues: {
      titleAr: '',
      titleEn: '',
      topic: '',
      language: '',
      subject: '',
      stage: '',
      grades: [],
      targetAudience: '',
      startDate: '',
      endDate: '',
      passingGrade: '',
      duration: '',
    },
  });

  const scrollToFirstError = useScrollToFirstError<AIExamBasicInfoProps>();

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

  // Step 1 passed validation — advance. Persisting/creating is wired to the backend later.
  const handleBasicInfoValid = (data: AIExamBasicInfoProps) => {
    logger.debug('AI exam basic info submitted', data);
    setCurrentStep(2);
  };

  const handlePrimary = () => {
    if (currentStep === 1) {
      void methods.handleSubmit(handleBasicInfoValid, scrollToFirstError)();
      return;
    }
    if (currentStep < LAST_STEP) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    navigate(ONLINE_EXAMS_PATH);
  };

  const handleSecondary = () => {
    if (currentStep === 1) {
      navigate(ONLINE_EXAMS_PATH);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const primaryLabel = currentStep === LAST_STEP ? t('common.save') : t('common.next');
  const secondaryLabel = currentStep === 1 ? t('common.cancel') : t('common.previous');

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="eLearning.onlineExams.create.ai.title" />

      <FormProvider {...methods}>
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <StepIndicator steps={steps} currentStep={currentStep} />

          <Card padding="md">
            <div className="space-y-8">
              {currentStep === 1 ? (
                <AIExamBasicInfoStep />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center">
                  <p className="text-base font-normal text-[#646969]">
                    {t('eLearning.onlineExams.addAI.comingSoon')}
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div />
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={handleSecondary}>
                    {secondaryLabel}
                  </Button>
                  <Button type="button" variant="primary" onClick={handlePrimary}>
                    {primaryLabel}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}
