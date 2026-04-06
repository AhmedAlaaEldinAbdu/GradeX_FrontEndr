import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import FileUpload from '@/shared/components/FileUpload';
import Input from '@/shared/components/Input';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import PersonSummaryCard from '@/shared/components/PersonSummaryCard';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import { TASKS_MOCK } from '../data/tasks.mock';
import { TASK_SUBMISSIONS_MOCK } from '../data/task-submissions.mock';

type TaskCorrectionFormMode = 'create' | 'edit';
type CorrectionBasis = 'grades' | 'evaluation';

interface AddEditTaskCorrectionFormProps {
  mode: TaskCorrectionFormMode;
}

export default function AddEditTaskCorrectionForm({ mode }: AddEditTaskCorrectionFormProps) {
  const { id, submissionId } = useParams<{ id: string; submissionId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const task = useMemo(() => TASKS_MOCK.find((item) => item.id === id), [id]);
  const submission = useMemo(
    () => TASK_SUBMISSIONS_MOCK.find((item) => item.id === submissionId && item.taskId === id),
    [id, submissionId]
  );

  const [correctionBasis, setCorrectionBasis] = useState<CorrectionBasis>('grades');
  const [trainingGrade, setTrainingGrade] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentPerformance, setStudentPerformance] = useState('excellent');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [existingAttachmentName, setExistingAttachmentName] = useState(
    mode === 'edit' ? (submission?.correctionAttachments[0]?.name ?? '') : ''
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

  const performanceOptions = [
    {
      value: 'excellent',
      label: t('tasksManagement.correctionFormPage.performanceOptions.excellent'),
    },
    {
      value: 'veryGood',
      label: t('tasksManagement.correctionFormPage.performanceOptions.veryGood'),
    },
    {
      value: 'good',
      label: t('tasksManagement.correctionFormPage.performanceOptions.good'),
    },
    {
      value: 'acceptable',
      label: t('tasksManagement.correctionFormPage.performanceOptions.acceptable'),
    },
  ];

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setAttachmentFile(file);
    if (file) {
      setExistingAttachmentName('');
    }
  };

  const handleAttachmentDelete = () => {
    setAttachmentFile(null);
    setExistingAttachmentName('');
  };

  const handleSubmit = () => {
    setShowPopupMessage(true);
  };

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
            {t(
              mode === 'edit'
                ? 'tasksManagement.editCorrectionPage.title'
                : 'tasksManagement.correctionFormPage.title'
            )}
          </h2>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-base font-medium text-gray-900">
                <span>{t('tasksManagement.correctionFormPage.fields.correctionBasedOn')}</span>
                <span className="text-red-500">*</span>
              </div>

              <div className="flex flex-wrap items-center gap-8">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value="grades"
                    checked={correctionBasis === 'grades'}
                    onChange={() => setCorrectionBasis('grades')}
                    className="h-4 w-4 accent-green-600 focus:ring-green-500"
                  />
                  <span className="text-base text-black-800">
                    {t('tasksManagement.correctionFormPage.basisOptions.grades')}
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value="evaluation"
                    checked={correctionBasis === 'evaluation'}
                    onChange={() => setCorrectionBasis('evaluation')}
                    className="h-4 w-4 accent-green-600 focus:ring-green-500"
                  />
                  <span className="text-base text-black-800">
                    {t('tasksManagement.correctionFormPage.basisOptions.evaluation')}
                  </span>
                </label>
              </div>
            </div>

            {correctionBasis === 'grades' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-base font-medium text-gray-900">
                    <span>{t('tasksManagement.correctionFormPage.fields.trainingGrade')}</span>
                    <span className="text-red-500">*</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={trainingGrade}
                    onChange={(event) => setTrainingGrade(event.target.value)}
                    placeholder={t(
                      'tasksManagement.correctionFormPage.fields.trainingGradePlaceholder'
                    )}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-base font-medium text-gray-900">
                    <span>{t('tasksManagement.correctionFormPage.fields.studentGrade')}</span>
                    <span className="text-red-500">*</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={studentGrade}
                    onChange={(event) => setStudentGrade(event.target.value)}
                    placeholder={t(
                      'tasksManagement.correctionFormPage.fields.studentGradePlaceholder'
                    )}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-base font-medium text-gray-900">
                  <span>{t('tasksManagement.correctionFormPage.fields.studentPerformance')}</span>
                  <span className="text-red-500">*</span>
                </div>
                <CustomSelect
                  value={studentPerformance}
                  onChange={(value) =>
                    setStudentPerformance(Array.isArray(value) ? (value[0] ?? '') : value)
                  }
                  options={performanceOptions}
                  placeholder={t(
                    'tasksManagement.correctionFormPage.fields.studentPerformancePlaceholder'
                  )}
                  maxHeight="200px"
                  showSearch={false}
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="text-base font-medium text-gray-900">
                {t('tasksManagement.correctionFormPage.fields.attachmentsOptional')}
              </div>
              <FileUpload
                label={t('tasksManagement.correctionFormPage.fields.attachmentsOptional')}
                accept=".pdf,.png,.jpg,.jpeg,.gif,.svg"
                onChange={handleAttachmentChange}
                onDelete={handleAttachmentDelete}
                fileName={attachmentFile?.name || existingAttachmentName}
                uploadText={t('tasksManagement.form.uploadAttachment')}
                formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
                id={`correction-attachment-${mode}`}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                {t('common.cancel')}
              </Button>
              <Button type="button" variant="primary" onClick={handleSubmit}>
                {t(
                  mode === 'edit'
                    ? 'tasksManagement.editCorrectionPage.submitButton'
                    : 'tasksManagement.correctionFormPage.submitButton'
                )}
              </Button>
            </div>
          </div>
        </section>
      </Card>

      <PopupMessage
        open={showPopupMessage}
        type="success"
        message={
          mode === 'edit'
            ? 'tasksManagement.messages.editCorrectionSuccess'
            : 'tasksManagement.messages.addCorrectionSuccess'
        }
        iconSrc={BigSuccessIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage(false)}
        navigateAfterClose={`/calendar/tasks/details/${task.id}/correction-preview/${submission.id}`}
      />
    </div>
  );
}
