import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import Card from '@/shared/components/Card';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import PersonSummaryCard from '@/shared/components/PersonSummaryCard';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import { fetchTaskCorrectionByTaskStudentId } from '@/redux/features/task-corrections/taskCorrectionsSlice';
import { fetchTaskStudentById } from '@/redux/features/task-students/taskStudentsSlice';
import {
  TaskCorrectionEvaluationGrade,
  TaskCorrectionType,
} from '@/types/taskCorrections';
import type { TaskStudentAttachment } from '@/types/taskStudents';

const getFileNameFromPath = (filePath?: string) => {
  if (!filePath) {
    return '';
  }

  const parts = filePath.split('/');
  return parts[parts.length - 1] || filePath;
};

const mapAttachmentsForPreview = (
  attachments?: TaskStudentAttachment[],
  attachmentUrls?: string[]
) => {
  if (attachments?.length) {
    return attachments.map((attachment, index) => ({
      id: attachment.id || `attachment-${index}`,
      filePath: attachment.filePath || attachment.fileUrl || '',
      fileName:
        attachment.fileName || getFileNameFromPath(attachment.filePath || attachment.fileUrl),
    }));
  }

  if (attachmentUrls?.length) {
    return attachmentUrls.map((filePath, index) => ({
      id: `attachment-url-${index}`,
      filePath,
      fileName: getFileNameFromPath(filePath),
    }));
  }

  return [];
};

export default function TaskCorrectionPreview() {
  const { submissionId } = useParams<{ id: string; submissionId: string }>();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isArabic = i18n.language === 'ar';

  const currentTaskStudent = useAppSelector((state) => state.taskStudents.currentTaskStudent);
  const isLoadingTaskStudent = useAppSelector((state) => state.taskStudents.isLoading);
  const currentTaskCorrection = useAppSelector(
    (state) => state.taskCorrections.currentTaskCorrection
  );
  const isLoadingTaskCorrection = useAppSelector((state) => state.taskCorrections.isLoading);

  useEffect(() => {
    if (!submissionId) {
      return;
    }

    dispatch(fetchTaskStudentById(submissionId));
    dispatch(fetchTaskCorrectionByTaskStudentId(submissionId));
  }, [dispatch, submissionId]);

  const taskStudent = useMemo(() => {
    if (!submissionId || !currentTaskStudent || currentTaskStudent.id !== submissionId) {
      return null;
    }

    return currentTaskStudent;
  }, [currentTaskStudent, submissionId]);

  const taskCorrection = useMemo(() => {
    if (
      !submissionId ||
      !currentTaskCorrection ||
      currentTaskCorrection.taskStudentId !== submissionId
    ) {
      return null;
    }

    return currentTaskCorrection;
  }, [currentTaskCorrection, submissionId]);

  const studentAttachments = useMemo(
    () => mapAttachmentsForPreview(taskStudent?.attachments, taskStudent?.attachmentUrls),
    [taskStudent?.attachmentUrls, taskStudent?.attachments]
  );

  const correctionAttachments = useMemo(
    () => mapAttachmentsForPreview(taskCorrection?.attachments, taskCorrection?.attachmentUrls),
    [taskCorrection?.attachmentUrls, taskCorrection?.attachments]
  );

  const localizedStudentName = isArabic
    ? taskStudent?.studentNameAr || taskStudent?.studentNameEn || '-'
    : taskStudent?.studentNameEn || taskStudent?.studentNameAr || '-';
  const localizedClassroom = isArabic
    ? taskStudent?.classroomAr || taskStudent?.classroomEn || '-'
    : taskStudent?.classroomEn || taskStudent?.classroomAr || '-';

  const localizedCorrectionBasedOn = taskCorrection
    ? taskCorrection.correctionType === TaskCorrectionType.Grades
      ? t('tasksManagement.correctionFormPage.basisOptions.grades')
      : t('tasksManagement.correctionFormPage.basisOptions.evaluation')
    : '-';

  const localizedPerformance = taskCorrection
    ? taskCorrection.correctionType === TaskCorrectionType.Grades
      ? `${taskCorrection.studentScore ?? 0}/${taskCorrection.maxScore ?? 0}`
      : taskCorrection.evaluationGrade === TaskCorrectionEvaluationGrade.Excellent
        ? t('tasksManagement.correctionFormPage.performanceOptions.excellent')
        : taskCorrection.evaluationGrade === TaskCorrectionEvaluationGrade.VeryGood
          ? t('tasksManagement.correctionFormPage.performanceOptions.veryGood')
          : taskCorrection.evaluationGrade === TaskCorrectionEvaluationGrade.Good
            ? t('tasksManagement.correctionFormPage.performanceOptions.good')
            : taskCorrection.evaluationGrade === TaskCorrectionEvaluationGrade.Acceptable
              ? t('tasksManagement.correctionFormPage.performanceOptions.acceptable')
              : '-'
    : '-';

  const isInitialLoading =
    (!taskStudent && isLoadingTaskStudent) || (!taskCorrection && isLoadingTaskCorrection);

  if (!submissionId) {
    return (
      <Card>
        <NotFoundMessage message="tasksManagement.messages.notFound" className="py-16" />
      </Card>
    );
  }

  if (isInitialLoading) {
    return (
      <Card>
        <Loading />
      </Card>
    );
  }

  if (!taskStudent || !taskCorrection) {
    return (
      <Card>
        <NotFoundMessage message="tasksManagement.messages.notFound" className="py-16" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PersonSummaryCard
        name={localizedStudentName}
        subtitle={localizedClassroom}
        avatar={DefaultAvatar}
      />

      <Card>
        <section className="space-y-6 rounded-2xl">
          <h2 className="flex text-xl font-medium text-gray-800">
            {t('tasksManagement.correctionPage.studentAttachmentsTitle')}
          </h2>

          {studentAttachments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
              {t('tasksManagement.correctionPage.noAttachments')}
            </div>
          ) : (
            <div className="space-y-3">
              {studentAttachments.map((attachment) => (
                <ExistingFileDisplay
                  key={attachment.id}
                  filePath={attachment.filePath}
                  fileName={attachment.fileName}
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

            {correctionAttachments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                {t('tasksManagement.correctionPage.noAttachments')}
              </div>
            ) : (
              <div className="space-y-3">
                {correctionAttachments.map((attachment) => (
                  <ExistingFileDisplay
                    key={attachment.id}
                    filePath={attachment.filePath}
                    fileName={attachment.fileName}
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
