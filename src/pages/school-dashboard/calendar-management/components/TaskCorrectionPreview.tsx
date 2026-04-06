import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import PersonSummaryCard from '@/shared/components/PersonSummaryCard';
import { TASKS_MOCK } from '../data/tasks.mock';
import { TASK_SUBMISSIONS_MOCK } from '../data/task-submissions.mock';

export default function TaskCorrectionPreview() {
  const { id, submissionId } = useParams<{ id: string; submissionId: string }>();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const task = useMemo(() => TASKS_MOCK.find((item) => item.id === id), [id]);
  const submission = useMemo(
    () => TASK_SUBMISSIONS_MOCK.find((item) => item.id === submissionId && item.taskId === id),
    [id, submissionId]
  );

  if (!task || !submission) {
    return (
      <Card>
        <NotFoundMessage message="tasksManagement.messages.notFound" className="py-16" />
      </Card>
    );
  }

  const localizedStudentName = isArabic ? submission.studentNameAr : submission.studentNameEn;
  const localizedClassroom = isArabic ? submission.classroomAr : submission.classroomEn;
  const localizedCorrectionBasedOn = isArabic
    ? submission.correctionBasedOnAr
    : submission.correctionBasedOnEn;
  const localizedPerformance = isArabic ? submission.performanceAr : submission.performanceEn;

  return (
    <div className="space-y-6">
      <PersonSummaryCard
        name={localizedStudentName}
        subtitle={localizedClassroom}
        avatar={submission.avatar}
      />

      <Card>
        <section className="space-y-6 rounded-2xl">
          <h2 className="flex text-xl font-medium text-gray-800">
            {t('tasksManagement.correctionPage.studentAttachmentsTitle')}
          </h2>

          {submission.studentAttachments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
              {t('tasksManagement.correctionPage.noAttachments')}
            </div>
          ) : (
            <div className="space-y-3">
              {submission.studentAttachments.map((attachment) => (
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
      </Card>

      <Card>
        <section className="space-y-6 rounded-2xl">
          <h2 className="flex text-xl font-medium text-gray-800">
            {t('tasksManagement.correctionPage.title')}
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-wrap items-center gap-3 text-gray-700">
              <span className="font-medium text-gray-900">
                {t('tasksManagement.correctionPage.fields.correctionBasedOn')}:
              </span>
              <span>{localizedCorrectionBasedOn}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-gray-700">
              <span className="font-medium text-gray-900">
                {t('tasksManagement.correctionPage.fields.studentPerformance')}:
              </span>
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                {localizedPerformance}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex text-xl font-medium text-gray-800">
              {t('tasksManagement.correctionPage.correctionAttachmentsTitle')}
            </h3>

            {submission.correctionAttachments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                {t('tasksManagement.correctionPage.noAttachments')}
              </div>
            ) : (
              <div className="space-y-3">
                {submission.correctionAttachments.map((attachment) => (
                  <ExistingFileDisplay
                    key={attachment.id}
                    filePath={attachment.filePath}
                    fileName={attachment.name}
                    className="mb-0"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </Card>
    </div>
  );
}
