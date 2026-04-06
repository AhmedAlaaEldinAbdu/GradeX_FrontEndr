import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import IconButton from '@/shared/components/IconButton';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';
import { TASK_CORRECTION_META, TASKS_MOCK } from '../data/tasks.mock';
import { TASK_SUBMISSIONS_MOCK, type TaskSubmissionRecord } from '../data/task-submissions.mock';

const PAGE_SIZE = 6;

const formatTaskDate = (value: string) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-GB');
};

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const task = useMemo(() => TASKS_MOCK.find((item) => item.id === id), [id]);

  if (!task) {
    return (
      <Card>
        <NotFoundMessage message="tasksManagement.messages.notFound" className="py-16" />
      </Card>
    );
  }

  const localizedDescription = isArabic ? task.descriptionAr : task.descriptionEn;
  const statusMeta = TASK_CORRECTION_META[task.correctionStatus];
  const assignmentValue =
    task.assignedTo === 'specific'
      ? t('tasksManagement.detailsPage.assignmentSpecific')
      : t('tasksManagement.detailsPage.assignmentAll');
  const handleOpenCorrection = (submissionId: string) => {
    navigate(`/calendar/tasks/details/${task.id}/correction/${submissionId}`);
  };

  const handleOpenCorrectionPreview = (submissionId: string) => {
    navigate(`/calendar/tasks/details/${task.id}/correction-preview/${submissionId}`);
  };

  const handleOpenEditCorrection = (submissionId: string) => {
    navigate(`/calendar/tasks/details/${task.id}/edit-correction/${submissionId}`);
  };

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return TASK_SUBMISSIONS_MOCK.filter((submission) => {
      if (submission.taskId !== task.id) {
        return false;
      }

      const localizedStudentName = isArabic ? submission.studentNameAr : submission.studentNameEn;
      return !normalizedSearch || localizedStudentName.toLowerCase().includes(normalizedSearch);
    });
  }, [isArabic, searchTerm, task.id]);

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredSubmissions
      .slice(startIndex, startIndex + PAGE_SIZE)
      .map((submission, index) => ({
        ...submission,
        index: startIndex + index + 1,
      }));
  }, [filteredSubmissions, page]);

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

  const submissionColumns: DataTableColumn<TaskSubmissionRecord & { index: number }>[] = [
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
                alt={isArabic ? row.studentNameAr : row.studentNameEn}
                className="h-full w-full object-cover"
              />
            </div>
            <span>{isArabic ? row.studentNameAr : row.studentNameEn}</span>
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
        const meta = TASK_CORRECTION_META[row.correctionStatus];
        return (
          <span
            className={`flex w-full justify-center rounded-full px-4 py-2 text-sm font-medium ${meta.className}`}
          >
            {t(`tasksManagement.correctionStatuses.${row.correctionStatus}`)}
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

  return (
    <div className="space-y-6">
      <div className={'flex items-center justify-end'}>
        <span
          className={`flex min-w-[120px] justify-center rounded-full px-4 py-2 text-sm font-medium ${statusMeta.className}`}
        >
          {t(`tasksManagement.correctionStatuses.${task.correctionStatus}`)}
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
                  <span>{isArabic ? task.stageAr : task.stageEn}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.subject')}:
                  </span>
                  <span>{isArabic ? task.subjectAr : task.subjectEn}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.date')}:
                  </span>
                  <span>{formatTaskDate(task.taskDate || task.dueDate)}</span>
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
                  <span>{isArabic ? task.classroomAr : task.classroomEn}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-gray-900">
                    {t('tasksManagement.detailsPage.fields.taskType')}:
                  </span>
                  <span>{t(`tasksManagement.taskTypes.${task.taskType}`)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[22px] border border-gray-200 px-5 py-6 sm:px-8">
            <h2 className="mb-6 text-xl font-medium text-gray-800">
              {t('tasksManagement.detailsPage.attachmentsSectionTitle')}
            </h2>

            {task.attachments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                {t('tasksManagement.detailsPage.noAttachments')}
              </div>
            ) : (
              <div className="space-y-3">
                {task.attachments.map((attachment) => (
                  <ExistingFileDisplay
                    key={attachment.id}
                    filePath={attachment.filePath}
                    fileName={attachment.name}
                    className="mb-0"
                  />
                ))}
              </div>
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
              {task.submissionsLabel}
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
