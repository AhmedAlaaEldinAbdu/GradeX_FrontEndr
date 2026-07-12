import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import Card from '@/shared/components/Card';
import ErrorMessage from '@/shared/components/ErrorMessage';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import useLanguage from '@/hooks/useLanguage';
import {
  fetchAIExamQuestionsStats,
  fetchAIExamResultsDistribution,
  fetchAIExamSummary,
} from '@/redux/features/ai-exam/aiExamSlice';
import type {
  AIExamQuestionStats,
  AIExamResultsDistributionBucket,
  AIExamSummary,
} from '@/services/api/types/ai-exam.types';
import ExamSummaryBanner from './components/ExamSummaryBanner';
import ExamResultsDistribution from './components/ExamResultsDistribution';
import ExamQuestionsList from './components/ExamQuestionsList';
import type { ExamDetailsItem, ExamQuestionItem, ResultBucket } from './components/examDetailsData';
import type { ExamDifficulty, ExamSource } from './components/OnlineExamCard';

const DIFFICULTY_MAP: Record<number, ExamDifficulty> = {
  1: 'easy',
  2: 'medium',
  3: 'hard',
};

const getDifficulty = (difficulty: number): ExamDifficulty => DIFFICULTY_MAP[difficulty] ?? 'easy';

const getExamSource = (isAIGenerated: boolean): ExamSource =>
  isAIGenerated ? 'ai' : 'questionBank';

const getDistributionColor = (rangeTo: number): string => {
  if (rangeTo < 40) return '#DD0417';
  if (rangeTo < 60) return '#F8951B';
  if (rangeTo < 80) return '#117BD7';
  return '#1A9F58';
};

const getLocalizedTitle = (exam: AIExamSummary, language: string): string => {
  if (language === 'ar') {
    return exam.titleAr || exam.titleEn || exam.topic || '';
  }

  return exam.titleEn || exam.titleAr || exam.topic || '';
};

const getDateValue = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value: string | null | undefined, language: string): string => {
  const date = getDateValue(value);
  if (!date) return '';

  return new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatTime = (value: string | null | undefined, language: string): string => {
  const date = getDateValue(value);
  if (!date || (date.getHours() === 0 && date.getMinutes() === 0)) return '';

  return new Intl.DateTimeFormat(language, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const buildExamDetails = (summary: AIExamSummary, language: string): ExamDetailsItem => {
  const title = getLocalizedTitle(summary, language);
  const gradeName = summary.gradeName?.trim() ?? '';
  const startDate = formatDate(summary.startDate, language);
  const endDate = formatDate(summary.endDate, language);

  return {
    id: summary.examId,
    name: title,
    source: getExamSource(summary.isAIGenerated),
    difficulty: getDifficulty(Number(summary.difficulty)),
    fullTitle: title,
    fullTitleSuffix: gradeName && !title.includes(gradeName) ? gradeName : undefined,
    titleDirection: language === 'ar' ? 'rtl' : 'ltr',
    stage: summary.stageName || gradeName || '-',
    date: [startDate, endDate].filter(Boolean).join(' - '),
    time: formatTime(summary.startDate, language),
    successRate: Math.round(summary.successRate ?? 0),
    avgTimeMinutes: summary.averageTimeMinutes ?? 0,
    questionsCount: summary.questionsCount ?? 0,
    attendance: `${summary.attendedCount ?? 0}/${summary.assignedCount ?? 0}`,
  };
};

const mapQuestionStats = (question: AIExamQuestionStats): ExamQuestionItem => ({
  id: question.questionId,
  number: question.order,
  difficulty: getDifficulty(Number(question.difficulty)),
  text: question.text,
  successRate: Math.round(question.successRate ?? 0),
  correctCount: question.correctAnswersCount ?? 0,
  wrongCount: question.wrongAnswersCount ?? 0,
  avgSeconds: question.averageTimeSeconds ?? 0,
});

const mapResultsDistribution = (
  distribution: AIExamResultsDistributionBucket[]
): ResultBucket[] => {
  const maxStudentsCount = distribution.reduce(
    (max, bucket) => Math.max(max, bucket.studentsCount ?? 0),
    0
  );

  return distribution.map((bucket) => ({
    range: `${bucket.rangeFrom} - ${bucket.rangeTo}%`,
    studentsCount: bucket.studentsCount ?? 0,
    percent: maxStudentsCount > 0 ? ((bucket.studentsCount ?? 0) / maxStudentsCount) * 100 : 0,
    color: getDistributionColor(bucket.rangeTo),
  }));
};

export default function ExamDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentLanguage } = useLanguage();

  const summary = useAppSelector((state) => state.aiExam.currentExamSummary);
  const questionsStats = useAppSelector((state) => state.aiExam.examQuestionsStats);
  const resultsDistribution = useAppSelector((state) => state.aiExam.examResultsDistribution);
  const isLoadingSummary = useAppSelector((state) => state.aiExam.isLoadingExamSummary);
  const isLoadingQuestions = useAppSelector((state) => state.aiExam.isLoadingExamQuestionsStats);
  const isLoadingResultsDistribution = useAppSelector(
    (state) => state.aiExam.isLoadingExamResultsDistribution
  );
  const summaryError = useAppSelector((state) => state.aiExam.examSummaryError);
  const questionsError = useAppSelector((state) => state.aiExam.examQuestionsStatsError);
  const resultsDistributionError = useAppSelector(
    (state) => state.aiExam.examResultsDistributionError
  );

  const loadExamDetails = useCallback(() => {
    if (!id) return;
    dispatch(fetchAIExamSummary({ ExamId: id }));
    dispatch(fetchAIExamQuestionsStats({ ExamId: id }));
    dispatch(fetchAIExamResultsDistribution({ ExamId: id }));
  }, [dispatch, id]);

  useEffect(() => {
    loadExamDetails();
  }, [loadExamDetails]);

  const isLoadedExam = Boolean(summary && summary.examId === id);
  const exam = useMemo(
    () => (summary && isLoadedExam ? buildExamDetails(summary, currentLanguage) : null),
    [currentLanguage, isLoadedExam, summary]
  );
  const questions = useMemo(() => questionsStats.map(mapQuestionStats), [questionsStats]);
  const distributionBuckets = useMemo(
    () => mapResultsDistribution(resultsDistribution),
    [resultsDistribution]
  );
  const pageTitle = exam?.name || t('eLearning.onlineExams.title');

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.onlineExams.title'), path: '/lms/online-exams' },
    { label: pageTitle },
  ];

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: t('eLearning.onlineExams.details.tabs.overview'),
      content: (
        <ExamResultsDistribution
          buckets={distributionBuckets}
          comparisonPercentage={summary?.comparedToPreviousExamPercentage}
          isLoading={isLoadingResultsDistribution}
          error={resultsDistributionError}
          onRetry={loadExamDetails}
        />
      ),
    },
    {
      id: 'questions',
      label: t('eLearning.onlineExams.details.tabs.questions'),
      content: (
        <ExamQuestionsList
          questions={questions}
          isLoading={isLoadingQuestions}
          error={questionsError}
          onRetry={loadExamDetails}
        />
      ),
    },
    {
      id: 'students',
      label: t('eLearning.onlineExams.details.tabs.students'),
      content: <NotFoundMessage message="eLearning.onlineExams.details.studentsEmpty" />,
    },
  ];

  if (!id) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <Card className="rounded-3xl border border-[#E6E6E6]" padding="md">
          <p className="py-10 text-center text-sm text-[#646969]">{t('common.noDataFound')}</p>
        </Card>
      </div>
    );
  }

  if (isLoadingSummary && !exam) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <Loading />
      </div>
    );
  }

  if (summaryError && !exam) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <ErrorMessage
          message="common.errorOccurred"
          details={summaryError}
          onRetry={loadExamDetails}
        />
      </div>
    );
  }

  if (!exam) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <Card className="rounded-3xl border border-[#E6E6E6]" padding="md">
          <p className="py-10 text-center text-sm text-[#646969]">{t('common.noDataFound')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={exam.name} hasHeaderControls={false} />

      <div className="space-y-6">
        <ExamSummaryBanner exam={exam} />

        <Tabs
          items={tabs}
          searchParamKey="tab"
          listClassName="flex justify-start gap-3"
          panelClassName="mt-4"
        />
      </div>
    </div>
  );
}
