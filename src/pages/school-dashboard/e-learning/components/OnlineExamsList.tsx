import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyState from '@/shared/components/EmptyState';
import ErrorMessage from '@/shared/components/ErrorMessage';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import Pagination from '@/shared/components/Pagination';
import SearchInput from '@/shared/components/SearchInput';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useLanguage } from '@/hooks/useLanguage';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { fetchAIExams } from '@/redux/features/ai-exam/aiExamSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import {
  AIExamDifficulty,
  AIExamStatus,
  type AIExamListItem,
  type AIExamsListQueryParams,
} from '@/services/api/types/ai-exam.types';
import OnlineExamCard, {
  type ExamDifficulty,
  type ExamSource,
  type ExamStatus,
  type OnlineExamItem,
} from './OnlineExamCard';
import MathIcon from '@gradex/assets/icons/Math.svg';
import CancelXGreenIcon from '@gradex/assets/icons/CancelXGreen.svg';

const PAGE_SIZE = 10;

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

export default function OnlineExamsList() {
  const { t } = useTranslation();
  const { currentLanguage, isArabic } = useLanguage();
  const dispatch = useAppDispatch();
  const schoolBranchId = getCurrentSchoolBranchId();

  const exams = useAppSelector((state) => state.aiExam.exams);
  const pagination = useAppSelector((state) => state.aiExam.pagination);
  const isLoading = useAppSelector((state) => state.aiExam.isLoadingList);
  const error = useAppSelector((state) => state.aiExam.error);
  const materials = useAppSelector((state) => state.subjects.subjects);
  const isLoadingMaterials = useAppSelector((state) => state.subjects.isLoading);
  const stages = useAppSelector((state) => state.educationalStages.educationalStages);
  const isLoadingStages = useAppSelector((state) => state.educationalStages.isLoading);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');
  const [stage, setStage] = useState('');
  const [subject, setSubject] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!schoolBranchId) return;

    dispatch(
      getEducationalStages({
        pageIndex: 1,
        pageSize: 10000,
      })
    );
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (!schoolBranchId) return;

    dispatch(
      fetchSubjects({
        page: 1,
        limit: 10000,
        filters: {
          schoolBranchesId: schoolBranchId,
          gradeId: stage || undefined,
        },
      })
    );
  }, [dispatch, schoolBranchId, stage]);

  const queryParams = useMemo<AIExamsListQueryParams | null>(() => {
    if (!schoolBranchId) return null;

    return {
      SchoolBranchId: schoolBranchId,
      PageNumber: page,
      PageSize: PAGE_SIZE,
      Search: search.trim() || undefined,
      MaterialId: subject || undefined,
      GradeId: stage || undefined,
      Difficulty: level ? (Number(level) as AIExamDifficulty) : undefined,
      Status: status ? (Number(status) as AIExamStatus) : undefined,
    };
  }, [level, page, schoolBranchId, search, stage, status, subject]);

  useEffect(() => {
    if (!queryParams) return;

    dispatch(fetchAIExams(queryParams));
  }, [dispatch, queryParams]);

  const examItems = useMemo(
    () => exams.map((exam) => toOnlineExamItem(exam, isArabic, currentLanguage)),
    [currentLanguage, exams, isArabic]
  );

  const statusOptions = [
    { value: String(AIExamStatus.Active), label: t('eLearning.onlineExams.status.active') },
    { value: String(AIExamStatus.Scheduled), label: t('eLearning.onlineExams.status.scheduled') },
  ];
  const levelOptions = [
    { value: String(AIExamDifficulty.Easy), label: t('eLearning.onlineExams.difficulty.easy') },
    { value: String(AIExamDifficulty.Medium), label: t('eLearning.onlineExams.difficulty.medium') },
    { value: String(AIExamDifficulty.Hard), label: t('eLearning.onlineExams.difficulty.hard') },
  ];
  const stageOptions = useMemo(
    () =>
      stages
        .map((item) => ({
          value: item.id,
          label: (isArabic ? item.nameAr : item.nameEn) || item.nameAr || item.nameEn || '',
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [isArabic, stages]
  );
  const subjectOptions = useMemo(
    () =>
      materials
        .map((item) => ({
          value: item.id,
          label: (isArabic ? item.name : item.nameEn) || item.name || item.nameEn || '',
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [isArabic, materials]
  );

  const hasActiveFilters = Boolean(search || status || level || stage || subject);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSubjectChange = (value: string | string[]) => {
    setSubject(value as string);
    setPage(1);
  };

  const handleStageChange = (value: string | string[]) => {
    setStage(value as string);
    setSubject('');
    setPage(1);
  };

  const handleLevelChange = (value: string | string[]) => {
    setLevel(value as string);
    setPage(1);
  };

  const handleStatusChange = (value: string | string[]) => {
    setStatus(value as string);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setLevel('');
    setStage('');
    setSubject('');
    setPage(1);
  };

  const selectClass = 'min-w-[140px] flex-1';
  const totalItems = pagination.totalItems ?? 0;
  const totalPages = pagination.totalPages ?? 0;
  const hasNoResults = !isLoading && examItems.length === 0 && hasActiveFilters;
  const shouldShowEmptyState = !isLoading && examItems.length === 0 && !hasActiveFilters;

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-start text-base font-medium text-[#3A3A3A]">
        {t('eLearning.onlineExams.listTitle')}
      </h3>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder={t('eLearning.onlineExams.searchPlaceholder')}
          wrapperClassName="min-w-[200px] flex-1"
        />
        <CustomSelect
          value={subject}
          onChange={handleSubjectChange}
          options={subjectOptions}
          placeholder={
            isLoadingMaterials ? t('common.loading') : t('eLearning.onlineExams.filters.subject')
          }
          showSearch={false}
          disabled={isLoadingMaterials}
          className={selectClass}
        />
        <CustomSelect
          value={stage}
          onChange={handleStageChange}
          options={stageOptions}
          placeholder={
            isLoadingStages ? t('common.loading') : t('eLearning.onlineExams.filters.stage')
          }
          showSearch={false}
          disabled={isLoadingStages}
          className={selectClass}
        />
        <CustomSelect
          value={level}
          onChange={handleLevelChange}
          options={levelOptions}
          placeholder={t('eLearning.onlineExams.filters.level')}
          showSearch={false}
          className={selectClass}
        />
        <CustomSelect
          value={status}
          onChange={handleStatusChange}
          options={statusOptions}
          placeholder={t('eLearning.onlineExams.filters.status')}
          showSearch={false}
          className={selectClass}
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-[48px] shrink-0 items-center gap-2 rounded-2xl border border-green-500 bg-green-500/10 px-4 text-sm font-normal text-green-500"
          >
            <CustomImage src={CancelXGreenIcon} alt="" className="h-5 w-5" />
            {t('eLearning.onlineExams.clearFilter')}
          </button>
        )}
      </div>

      {!schoolBranchId ? (
        <ErrorMessage message="common.errorOccurred" />
      ) : error && !isLoading ? (
        <ErrorMessage message={error || 'common.errorOccurred'} />
      ) : isLoading && examItems.length === 0 ? (
        <Loading />
      ) : hasNoResults ? (
        <NotFoundMessage message="common.noResults" className="py-14" />
      ) : shouldShowEmptyState ? (
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
      ) : (
        <div className={isLoading ? 'flex flex-col gap-4 opacity-60' : 'flex flex-col gap-4'}>
          {examItems.map((exam) => (
            <OnlineExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}

      {examItems.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={pagination.pageIndex || page}
          totalPages={totalPages}
          to={Math.min(
            (pagination.pageIndex || page) * (pagination.pageSize || PAGE_SIZE),
            totalItems
          )}
          from={totalItems}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
