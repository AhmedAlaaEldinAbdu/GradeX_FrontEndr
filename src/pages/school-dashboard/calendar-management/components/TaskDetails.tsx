import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import ViewModeFileDisplay from '@/shared/components/ViewModeFileDisplay';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';
import {
  fetchSchoolTaskById,
  fetchSchoolTaskStatuses,
} from '@/redux/features/school-tasks/schoolTasksSlice';
import type { SchoolTask, SchoolTaskStatusItem, SchoolTaskType } from '@/types/schoolTasks';

const PAGE_SIZE = 6;

type CorrectionStatusKey = 'corrected' | 'notCorrected';

type TaskSubmissionRow = SchoolTaskStatusItem & {
  index: number;
  id: string;
  studentName: string;
  avatar?: string;
  correctionStatusKey: CorrectionStatusKey;
};

const TASK_CORRECTION_META: Record<CorrectionStatusKey, { className: string }> = {
  corrected: {
    className: 'bg-emerald-100 text-emerald-700',
  },
  notCorrected: {
    className: 'bg-rose-100 text-rose-700',
  },
};

const TASK_TYPE_LABEL_KEYS: Partial<Record<SchoolTaskType, string>> = {
  1: 'tasksManagement.taskTypes.homework',
  2: 'tasksManagement.taskTypes.training',
  3: 'tasksManagement.taskTypes.dictation',
  4: 'tasksManagement.taskTypes.quiz',
};

const formatTaskDate = (value: string) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB');
};

const getStringValue = (value: unknown) => (typeof value === 'string' ? value : '');

const getSubmissionId = (submission: SchoolTaskStatusItem) => {
  return getStringValue(
    submission.id ||
      submission.studentId ||
      submission.taskStudentId ||
      submission.taskStudentID ||
      submission.submissionId
  );
};

const getLocalizedStudentName = (submission: SchoolTaskStatusItem, isArabic: boolean) => {
  const nameAr = getStringValue(submission.studentNameAr || submission.nameAr);
  const nameEn = getStringValue(submission.studentNameEn || submission.nameEn);
  const fallbackName = getStringValue(submission.studentName || submission.name);

  if (isArabic) {
    return nameAr || nameEn || fallbackName || '-';
  }

  return nameEn || nameAr || fallbackName || '-';
};

const getSubmissionAvatar = (submission: SchoolTaskStatusItem) => {
  return getStringValue(
    submission.avatar || submission.imageUrl || submission.profilePicture || submission.image
  );
};

const getCorrectionStatusKey = (submission: SchoolTaskStatusItem): CorrectionStatusKey => {
  const status = submission.correctionStatus;

  if (status === 'corrected' || status === 'notCorrected') {
    return status;
  }

  if (submission.isCorrected === true || submission.corrected === true) {
    return 'corrected';
  }

  if (
    submission.correctionId ||
    submission.correctedAt ||
    submission.studentScore ||
    submission.evaluationGrade
  ) {
    return 'corrected';
  }

  return 'notCorrected';
};

const getTaskCorrectionStatusKey = (task: SchoolTask): CorrectionStatusKey =>
  task.correctTaskNumber > 0 ? 'corrected' : 'notCorrected';

const getTaskTypeLabel = (taskType: SchoolTaskType, t: (key: string) => string) => {
  const labelKey = TASK_TYPE_LABEL_KEYS[taskType];
  return labelKey ? t(labelKey) : `${t('tasksManagement.table.taskType')} ${taskType}`;
};

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isArabic = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const currentSchoolTask = useAppSelector((state) => state.schoolTasks.currentSchoolTask);
  const taskStatuses = useAppSelector((state) => state.schoolTasks.taskStatuses);
  const isLoading = useAppSelector((state) => state.schoolTasks.isLoading);

  useEffect(() => {
    if (!id) {
      return;
    }

    dispatch(fetchSchoolTaskById(id));
    dispatch(
      fetchSchoolTaskStatuses({
        id,
        page: 1,
        limit: 1000,
      })
    );
  }, [dispatch, id]);

  const task = useMemo(() => {
    if (!id || !currentSchoolTask || currentSchoolTask.id !== id) {
      return null;
    }

    return currentSchoolTask;
  }, [currentSchoolTask, id]);

  const attachmentUrls = task?.attachmentUrls || [];

  const submissions = useMemo(
    () => taskStatuses.filter((submission) => getSubmissionId(submission)),
    [taskStatuses]
  );

  const taskId = task?.id || id || '';
  const localizedDescription = isArabic ? task?.descriptionAr : task?.descriptionEn;
  const statusKey = task ? getTaskCorrectionStatusKey(task) : 'notCorrected';
  const statusMeta = TASK_CORRECTION_META[statusKey];
  const assignmentValue =
    task?.assignmentType === 2
      ? t('tasksManagement.detailsPage.assignmentSpecific')
      : t('tasksManagement.detailsPage.assignmentAll');
  const handleOpenCorrection = (submissionId: string) => {
    navigate(`/calendar/tasks/details/${taskId}/correction/${submissionId}`);
  };

  const handleOpenCorrectionPreview = (submissionId: string) => {
    navigate(`/calendar/tasks/details/${taskId}/correction-preview/${submissionId}`);
  };

  const handleOpenEditCorrection = (submissionId: string) => {
    navigate(`/calendar/tasks/details/${taskId}/edit-correction/${submissionId}`);
  };

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return submissions.filter((submission) => {
      const localizedStudentName = getLocalizedStudentName(submission, isArabic);
      return !normalizedSearch || localizedStudentName.toLowerCase().includes(normalizedSearch);
    });
  }, [isArabic, searchTerm, submissions]);

  useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
  }, [filteredSubmissions.length, page]);

  const paginatedSubmissions = useMemo<TaskSubmissionRow[]>(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredSubmissions
      .slice(startIndex, startIndex + PAGE_SIZE)
      .map((submission, index) => ({
        ...submission,
        id: getSubmissionId(submission),
        studentName: getLocalizedStudentName(submission, isArabic),
        avatar: getSubmissionAvatar(submission),
        correctionStatusKey: getCorrectionStatusKey(submission),
        index: startIndex + index + 1,
      }));
  }, [filteredSubmissions, isArabic, page]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'task-submissions-search',
      placeholder: t('tasksManagement.detailsPage.searchStudentPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '25%',
    },
  ];

  const submissionColumns: DataTableColumn<TaskSubmissionRow>[] = [
    {
      header: '#',
      accessor: (row) => <span>{row.index}</span>,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.detailsPage.submissionsTable.studentName',
      accessor: (row) => (
        <div className="flex w-full items-center justify-evenly gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <CustomImage
                src={row.avatar}
                fallbackSrc={DefaultAvatar}
                alt={row.studentName}
                className="h-full w-full object-cover"
              />
            </div>
            <span>{row.studentName}</span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenCorrectionPreview(row.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shadow-md transition-colors hover:bg-blue-200"
            aria-label={t('actions.view')}
          >
            <CustomImage src={EyeStyledIcon} alt={t('actions.view')} className="h-5 w-5" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[320px]',
    },
    {
      header: 'tasksManagement.table.correctionStatus',
      accessor: (row) => {
        const meta = TASK_CORRECTION_META[row.correctionStatusKey];
        return (
          <span
            className={`flex w-full justify-center rounded-full px-4 py-2 text-sm font-medium ${meta.className}`}
          >
            {t(`tasksManagement.correctionStatuses.${row.correctionStatusKey}`)}
          </span>
        );
      },
      headerClassName: 'min-w-[220px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenCorrection(row.id)}
            aria-label={t('actions.view')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shadow-md transition-colors hover:bg-blue-200"
          >
            <CustomImage src={EyeDarkBlueIcon} alt={t('actions.view')} className="h-5 w-5" />
          </button>
          <IconButton
            status="edit"
            variant="success"
            ariaLabel={t('actions.edit')}
            onClick={() => handleOpenEditCorrection(row.id)}
            className="flex h-10 w-10 items-center justify-center"
          />
        </div>
      ),
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
  ];

  if (isLoading && !task) {
    return (
      <Card>
        <Loading />
      </Card>
    );
  }

  if (!task) {
    return (
      <Card>
        <NotFoundMessage message="tasksManagement.messages.notFound" className="py-16" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className={'flex items-center justify-end'}>
        <span
          className={`flex min-w-[120px] justify-center rounded-full px-4 py-2 text-sm font-medium ${statusMeta.className}`}
        >
          {t(`tasksManagement.correctionStatuses.${statusKey}`)}
        </span>
      </div>

      <Card className="border-gray-100">
        <div className="space-y-6">
          <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xl font-medium text-gray-800">
                {t('tasksManagement.detailsPage.detailsSectionTitle')}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-16">
              <div className="space-y-5 text-gray-700">
                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.taskNameAr')}:
                  </span>
                  <span>{task.nameAr}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.educationalStage')}:
                  </span>
                  <span>{task.gradeName || '-'}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.subject')}:
                  </span>
                  <span>{task.materialName || '-'}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.date')}:
                  </span>
                  <span>{formatTaskDate(task.deliveryDate || task.date)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.description')}:
                  </span>
                  <span>
                    {localizedDescription || t('tasksManagement.detailsPage.noDescription')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.assignTo')}:
                  </span>
                  <span>{assignmentValue}</span>
                </div>
              </div>

              <div className="space-y-5 text-gray-700">
                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.taskNameEn')}:
                  </span>
                  <span>{task.nameEn}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.classroom')}:
                  </span>
                  <span>{task.classroomName || '-'}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.taskType')}:
                  </span>
                  <span>{getTaskTypeLabel(task.taskType, t)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[22px] border border-gray-200 px-5 py-6 sm:px-8">
            <h2 className="mb-6 flex text-xl font-medium text-gray-800">
              {t('tasksManagement.detailsPage.attachmentsSectionTitle')}
            </h2>

            {attachmentUrls.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                {t('tasksManagement.detailsPage.noAttachments')}
              </div>
            ) : (
              <ViewModeFileDisplay files={attachmentUrls} baseUrl={baseUrl} />
            )}
          </section>
        </div>
      </Card>
      <Card className="border-gray-100">
        <section className="space-y-6 rounded-2xl border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center text-xl font-medium text-gray-800">
              {t('tasksManagement.detailsPage.submissionsSectionTitle')}
            </div>
            <span className="flex min-w-[72px] justify-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
              {`${task.correctTaskNumber}/${task.totalTaskNumber}`}
            </span>
          </div>

          <DataTable
            data={paginatedSubmissions}
            columns={submissionColumns}
            keyExtractor={(row) => row.id}
            pagination={{
              page,
              limit: PAGE_SIZE,
              total: filteredSubmissions.length,
              totalPages,
            }}
            onPageChange={setPage}
            filters={filterConfigs}
            showFilters={true}
            emptyMessage={t('tasksManagement.detailsPage.noStudents')}
            t={t}
            floatingActions={false}
          />
        </section>
      </Card>
    </div>
  );
}
