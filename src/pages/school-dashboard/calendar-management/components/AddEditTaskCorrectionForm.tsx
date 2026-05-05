import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import FileUpload from '@/shared/components/FileUpload';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import PersonSummaryCard from '@/shared/components/PersonSummaryCard';
import TextArea from '@/shared/components/TextArea';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import {
  addTaskCorrection,
  editTaskCorrection,
  fetchTaskCorrectionByTaskStudentId,
} from '@/redux/features/task-corrections/taskCorrectionsSlice';
import { fetchTaskStudentById } from '@/redux/features/task-students/taskStudentsSlice';
import {
  AddTaskCorrectionSchema,
  EditTaskCorrectionSchema,
} from '@/validations/task-corrections-validations';
import {
  TaskCorrectionEvaluationGrade,
  TaskCorrectionType,
  type CreateTaskCorrectionRequest,
  type UpdateTaskCorrectionRequest,
} from '@/types/taskCorrections';
import type { TaskStudentAttachment } from '@/types/taskStudents';
import Loading from '@/shared/components/Loading';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';

type TaskCorrectionFormMode = 'create' | 'edit';

interface AddEditTaskCorrectionFormProps {
  mode: TaskCorrectionFormMode;
}

interface TaskCorrectionFormValues {
  id: string;
  taskStudentId: string;
  correctionType: TaskCorrectionType;
  studentScore?: number;
  maxScore?: number;
  evaluationGrade?: TaskCorrectionEvaluationGrade;
  feedback: string;
  attachment: File[];
}

const DEFAULT_VALUES: TaskCorrectionFormValues = {
  id: '',
  taskStudentId: '',
  correctionType: TaskCorrectionType.Grades,
  studentScore: undefined,
  maxScore: undefined,
  evaluationGrade: undefined,
  feedback: '',
  attachment: [],
};

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

export default function AddEditTaskCorrectionForm({ mode }: AddEditTaskCorrectionFormProps) {
  const { id, submissionId } = useParams<{ id: string; submissionId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isArabic = i18n.language === 'ar';

  const [existingAttachmentNames, setExistingAttachmentNames] = useState<string[]>([]);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const currentTaskStudent = useAppSelector((state) => state.taskStudents.currentTaskStudent);
  const isLoadingTaskStudent = useAppSelector((state) => state.taskStudents.isLoading);
  const currentTaskCorrection = useAppSelector(
    (state) => state.taskCorrections.currentTaskCorrection
  );
  const isLoadingTaskCorrection = useAppSelector((state) => state.taskCorrections.isLoading);
  const isCreating = useAppSelector((state) => state.taskCorrections.isCreating);
  const isUpdating = useAppSelector((state) => state.taskCorrections.isUpdating);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<TaskCorrectionFormValues>({
    resolver: yupResolver(
      mode === 'edit' ? EditTaskCorrectionSchema : AddTaskCorrectionSchema
    ) as any,
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES,
  });

  const scrollToFirstError = useScrollToFirstError<TaskCorrectionFormValues>();

  const watchedCorrectionType = watch('correctionType');
  const watchedAttachments = watch('attachment');

  useEffect(() => {
    if (!submissionId) {
      return;
    }

    dispatch(fetchTaskStudentById(submissionId));

    if (mode === 'edit') {
      dispatch(fetchTaskCorrectionByTaskStudentId(submissionId));
    }
  }, [dispatch, mode, submissionId]);

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

  useEffect(() => {
    if (!submissionId) {
      return;
    }

    if (mode === 'edit' && taskCorrection) {
      reset({
        id: taskCorrection.id,
        taskStudentId: taskCorrection.taskStudentId,
        correctionType: taskCorrection.correctionType,
        studentScore: taskCorrection.studentScore,
        maxScore: taskCorrection.maxScore,
        evaluationGrade: taskCorrection.evaluationGrade,
        feedback: taskCorrection.feedback || '',
        attachment: [],
      });

      setExistingAttachmentNames(
        mapAttachmentsForPreview(taskCorrection.attachments, taskCorrection.attachmentUrls).map(
          (attachment) => attachment.fileName
        )
      );
      return;
    }

    reset({
      ...DEFAULT_VALUES,
      taskStudentId: submissionId,
    });
    setExistingAttachmentNames([]);
  }, [mode, reset, submissionId, taskCorrection]);

  useEffect(() => {
    if (watchedCorrectionType === TaskCorrectionType.Grades) {
      setValue('evaluationGrade', undefined);
      return;
    }

    setValue('studentScore', undefined);
    setValue('maxScore', undefined);
  }, [setValue, watchedCorrectionType]);

  const isInitialLoading =
    !taskStudent && (isLoadingTaskStudent || (mode === 'edit' && isLoadingTaskCorrection));

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

  if (!taskStudent) {
    return (
      <Card>
        <NotFoundMessage message="tasksManagement.messages.notFound" className="py-16" />
      </Card>
    );
  }

  const localizedStudentName = isArabic
    ? taskStudent.studentNameAr || taskStudent.studentNameEn || '-'
    : taskStudent.studentNameEn || taskStudent.studentNameAr || '-';
  const localizedClassroom = isArabic
    ? taskStudent.classroomAr || taskStudent.classroomEn || '-'
    : taskStudent.classroomEn || taskStudent.classroomAr || '-';

  const studentAttachments = mapAttachmentsForPreview(
    taskStudent.attachments,
    taskStudent.attachmentUrls
  );

  const performanceOptions = [
    {
      value: String(TaskCorrectionEvaluationGrade.Excellent),
      label: t('tasksManagement.correctionFormPage.performanceOptions.excellent'),
    },
    {
      value: String(TaskCorrectionEvaluationGrade.VeryGood),
      label: t('tasksManagement.correctionFormPage.performanceOptions.veryGood'),
    },
    {
      value: String(TaskCorrectionEvaluationGrade.Good),
      label: t('tasksManagement.correctionFormPage.performanceOptions.good'),
    },
    {
      value: String(TaskCorrectionEvaluationGrade.Acceptable),
      label: t('tasksManagement.correctionFormPage.performanceOptions.acceptable'),
    },
  ];

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setValue('attachment', files, { shouldValidate: true, shouldDirty: true });
    if (files.length > 0) {
      setExistingAttachmentNames([]);
    }
  };

  const handleAttachmentDelete = (index?: number) => {
    const currentFiles = getValues('attachment') || [];

    if (currentFiles.length > 0) {
      if (typeof index === 'number') {
        setValue(
          'attachment',
          currentFiles.filter((_, fileIndex) => fileIndex !== index),
          { shouldValidate: true, shouldDirty: true }
        );
        return;
      }

      setValue('attachment', [], { shouldValidate: true, shouldDirty: true });
      return;
    }

    if (typeof index === 'number') {
      setExistingAttachmentNames((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
      return;
    }

    setExistingAttachmentNames([]);
  };

  const onSubmit = async (values: TaskCorrectionFormValues) => {
    try {
      const payload: CreateTaskCorrectionRequest = {
        taskStudentId: submissionId,
        correctionType: values.correctionType,
        studentScore:
          values.correctionType === TaskCorrectionType.Grades ? values.studentScore : undefined,
        maxScore: values.correctionType === TaskCorrectionType.Grades ? values.maxScore : undefined,
        evaluationGrade:
          values.correctionType === TaskCorrectionType.Evaluation
            ? values.evaluationGrade
            : undefined,
        feedback: values.feedback || undefined,
        attachment: values.attachment.length > 0 ? values.attachment : undefined,
      };

      if (mode === 'edit' && taskCorrection) {
        const updatePayload: UpdateTaskCorrectionRequest = {
          ...payload,
          id: taskCorrection.id,
        };

        await dispatch(
          editTaskCorrection({
            id: taskCorrection.id,
            data: updatePayload,
          })
        ).unwrap();
      } else {
        await dispatch(addTaskCorrection(payload)).unwrap();
      }

      setShowPopupMessage({
        show: true,
        type: 'success',
        message:
          mode === 'edit'
            ? 'tasksManagement.messages.editCorrectionSuccess'
            : 'tasksManagement.messages.addCorrectionSuccess',
      });
    } catch (error) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: typeof error === 'string' ? error : 'common.errorOccurred',
      });
    }
  };

  return (
    <div className="space-y-6">
      <PersonSummaryCard
        name={localizedStudentName}
        subtitle={localizedClassroom}
        avatar={taskStudent.avatar as string}
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
            {t(
              mode === 'edit'
                ? 'tasksManagement.editCorrectionPage.title'
                : 'tasksManagement.correctionFormPage.title'
            )}
          </h2>

          <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)} className="space-y-6">
            <FormField
              label={t('tasksManagement.correctionFormPage.fields.correctionBasedOn')}
              required
            >
              <div className="flex flex-wrap items-center gap-8">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value="grades"
                    checked={watchedCorrectionType === TaskCorrectionType.Grades}
                    onChange={() => setValue('correctionType', TaskCorrectionType.Grades)}
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
                    checked={watchedCorrectionType === TaskCorrectionType.Evaluation}
                    onChange={() => setValue('correctionType', TaskCorrectionType.Evaluation)}
                    className="h-4 w-4 accent-green-600 focus:ring-green-500"
                  />
                  <span className="text-base text-black-800">
                    {t('tasksManagement.correctionFormPage.basisOptions.evaluation')}
                  </span>
                </label>
              </div>
            </FormField>

            {watchedCorrectionType === TaskCorrectionType.Grades ? (
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  label={t('tasksManagement.correctionFormPage.fields.trainingGrade')}
                  required
                  error={errors.maxScore?.message}
                  htmlFor="trainingGrade"
                >
                  <Controller
                    name="maxScore"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="trainingGrade"
                        type="number"
                        min={0}
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        placeholder={t(
                          'tasksManagement.correctionFormPage.fields.trainingGradePlaceholder'
                        )}
                        className="w-full"
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label={t('tasksManagement.correctionFormPage.fields.studentGrade')}
                  required
                  error={errors.studentScore?.message}
                  htmlFor="studentGrade"
                >
                  <Controller
                    name="studentScore"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="studentGrade"
                        type="number"
                        min={0}
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                        placeholder={t(
                          'tasksManagement.correctionFormPage.fields.studentGradePlaceholder'
                        )}
                        className="w-full"
                      />
                    )}
                  />
                </FormField>
              </div>
            ) : (
              <FormField
                label={t('tasksManagement.correctionFormPage.fields.studentPerformance')}
                required
                error={errors.evaluationGrade?.message}
              >
                <Controller
                  name="evaluationGrade"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value ? String(field.value) : ''}
                      onChange={(value) => {
                        const selected = Array.isArray(value) ? (value[0] ?? '') : value;
                        field.onChange(selected ? Number(selected) : undefined);
                      }}
                      options={performanceOptions}
                      placeholder={t(
                        'tasksManagement.correctionFormPage.fields.studentPerformancePlaceholder'
                      )}
                      maxHeight="200px"
                      showSearch={false}
                    />
                  )}
                />
              </FormField>
            )}

            <FormField label={t('tasksManagement.detailsPage.fields.description')} optional>
              <Controller
                name="feedback"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    placeholder={t('tasksManagement.detailsPage.noDescription')}
                  />
                )}
              />
            </FormField>

            <FormField>
              <FileUpload
                label={t('tasksManagement.correctionFormPage.fields.attachments')}
                accept=".pdf,.png,.jpg,.jpeg,.gif,.svg"
                onChange={handleAttachmentChange}
                onDelete={handleAttachmentDelete}
                fileNames={
                  watchedAttachments.length > 0
                    ? watchedAttachments.map((file) => file.name)
                    : existingAttachmentNames
                }
                files={watchedAttachments}
                uploadText={t('tasksManagement.form.uploadAttachment')}
                formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
                id={`correction-attachment-${mode}`}
                optional={true}
                multiple={true}
              />
            </FormField>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={isCreating || isUpdating}>
                {t(
                  mode === 'edit'
                    ? 'tasksManagement.editCorrectionPage.submitButton'
                    : 'tasksManagement.correctionFormPage.submitButton'
                )}
              </Button>
            </div>
          </form>
        </section>
      </Card>

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={BigSuccessIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage((current) => ({ ...current, show: false }))}
        navigateAfterClose={
          showPopupMessage.type === 'success'
            ? `/calendar/tasks/details/${id}/correction-preview/${submissionId}`
            : undefined
        }
      />
    </div>
  );
}
