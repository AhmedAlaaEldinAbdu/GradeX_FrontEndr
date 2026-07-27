import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyState from '@/shared/components/EmptyState';
import ErrorMessage from '@/shared/components/ErrorMessage';
import Loading from '@/shared/components/Loading';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useLanguage } from '@/hooks/useLanguage';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { fetchAIExams } from '@/redux/features/ai-exam/aiExamSlice';
import {
  AIExamDifficulty,
  AIExamStatus,
  type AIExamListItem,
} from '@/services/api/types/ai-exam.types';
import OnlineExamCard, {
  type ExamDifficulty,
  type ExamSource,
  type ExamStatus,
  type OnlineExamItem,
} from './OnlineExamCard';
import MathIcon from '@gradex/assets/icons/Math.svg';

const OVERVIEW_PAGE_SIZE = 4;

const DIFFICULTY_FROM_API: Record<number, ExamDifficulty> = {
  [AIExamDifficulty.Easy]: 'easy',
  [AIExamDifficulty.Medium]: 'medium',
  [AIExamDifficulty.Hard]: 'hard',
};

const STATUS_FROM_API: Record<number, ExamStatus> = {
  [AIExamStatus.Active]: 'active',
  [AIExamStatus.Scheduled]: 'scheduled',
};

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatTime(value: string | null | undefined, locale: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getExamSource(exam: AIExamListItem): ExamSource {
  return exam.isAIGenerated ? 'ai' : 'manual';
}

function getTitleSuffix(title: string, gradeName: string): string | undefined {
  if (!gradeName || title.includes(gradeName)) return undefined;
  return gradeName;
}

function toOnlineExamItem(exam: AIExamListItem, isArabic: boolean, locale: string): OnlineExamItem {
  const title = (isArabic ? exam.titleAr : exam.titleEn) || exam.titleAr || exam.titleEn || '';
  const gradeName = exam.gradeName || '';

  return {
    id: exam.id,
    source: getExamSource(exam),
    difficulty: DIFFICULTY_FROM_API[exam.difficulty] ?? 'easy',
    status: STATUS_FROM_API[exam.status] ?? 'scheduled',
    title,
    titleSuffix: getTitleSuffix(title, gradeName),
    titleDirection: isArabic ? 'rtl' : 'ltr',
    stage: gradeName,
    subject: exam.materialName || '',
    studentsCount: exam.studentsCount ?? 0,
    completedCount: exam.submittedCount ?? 0,
    date: formatDate(exam.startDate, locale),
    time: formatTime(exam.startDate, locale),
    progress: exam.successRate ?? 0,
  };
}

export default function ExamsList() {
  const { t } = useTranslation();
  const { currentLanguage, isArabic } = useLanguage();
  const dispatch = useAppDispatch();
  const schoolBranchId = getCurrentSchoolBranchId();

  const exams = useAppSelector((state) => state.aiExam.exams);
  const isLoading = useAppSelector((state) => state.aiExam.isLoadingList);
  const error = useAppSelector((state) => state.aiExam.error);

  useEffect(() => {
    if (!schoolBranchId) return;

    dispatch(
      fetchAIExams({
        SchoolBranchId: schoolBranchId,
        PageNumber: 1,
        PageSize: OVERVIEW_PAGE_SIZE,
      })
    );
  }, [dispatch, schoolBranchId]);

  const examItems = useMemo(
    () => exams.map((exam) => toOnlineExamItem(exam, isArabic, currentLanguage)),
    [currentLanguage, exams, isArabic]
  );

  if (!schoolBranchId) {
    return <ErrorMessage message="common.errorOccurred" />;
  }

  if (error && !isLoading) {
    return <ErrorMessage message={error || 'common.errorOccurred'} />;
  }

  if (isLoading && examItems.length === 0) {
    return <Loading />;
  }

  if (examItems.length === 0) {
    return (
      <EmptyState
        icon={
          <CustomImage
            src={MathIcon}
            alt=""
            className="mx-auto h-[150px] w-[150px] mix-blend-luminosity"
          />
        }
        description={t('eLearning.exams.emptyDescription')}
      />
    );
  }

  return (
    <div className={isLoading ? 'flex flex-col gap-4 opacity-60' : 'flex flex-col gap-4'}>
      {examItems.map((exam) => (
        <OnlineExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  );
}
