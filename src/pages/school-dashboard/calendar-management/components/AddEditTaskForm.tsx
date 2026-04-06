import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import FormField from '@/shared/components/FormField';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import FileUpload from '@/shared/components/FileUpload';
import Button from '@/shared/components/Button';
import { useToast } from '@/shared/context/ToastContext';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import type { TaskRecord, TaskType } from '../data/tasks.mock';
import { TASKS_MOCK } from '../data/tasks.mock';
import TaskStudentsPopup, { type TaskStudentOption } from '../popups/TaskStudentsPopup';

export interface TaskFormValues {
  stage: string;
  classroom: string;
  subject: string;
  nameAr: string;
  nameEn: string;
  taskType: TaskType | '';
  taskDate: string;
  deliveryDate: string;
  startPage: string;
  endPage: string;
  descriptionAr: string;
  descriptionEn: string;
  assignTo: 'all' | 'specific' | '';
}

interface TaskFormProps {
  mode: 'add' | 'edit';
  initialTask?: TaskRecord;
}

const getUniqueOptions = (
  values: Array<{ value: string; label: string }>
): CustomSelectOption[] => {
  const seen = new Set<string>();
  return values.filter((item) => {
    if (seen.has(item.value)) {
      return false;
    }
    seen.add(item.value);
    return true;
  });
};

export default function AddEditTaskForm({ mode, initialTask }: TaskFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isArabic = i18n.language === 'ar';

  const createInitialValues = (task?: TaskRecord): TaskFormValues => ({
    stage: task?.stageAr ?? '',
    classroom: task?.classroomAr ?? '',
    subject: task?.subjectAr ?? '',
    nameAr: task?.nameAr ?? '',
    nameEn: task?.nameEn ?? '',
    taskType: task?.taskType ?? '',
    taskDate: task?.dueDate ?? '',
    deliveryDate: task?.dueDate ?? '',
    startPage: task ? '10' : '',
    endPage: task ? '11' : '',
    descriptionAr: '',
    descriptionEn: '',
    assignTo: task ? 'all' : '',
  });

  const [values, setValues] = useState<TaskFormValues>(createInitialValues(initialTask));
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isStudentsPopupOpen, setIsStudentsPopupOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<TaskStudentOption[]>([]);
  const [existingFileNames, setExistingFileNames] = useState<string[]>(
    mode === 'edit' ? [t('tasksManagement.form.attachmentFileName')] : []
  );

  useEffect(() => {
    if (!initialTask) {
      return;
    }

    setValues(createInitialValues(initialTask));
  }, [initialTask]);

  const stageOptions = useMemo(
    () =>
      getUniqueOptions(
        TASKS_MOCK.map((task) => ({
          value: task.stageAr,
          label: isArabic ? task.stageAr : task.stageEn,
        }))
      ),
    [isArabic]
  );

  const classroomOptions = useMemo(
    () =>
      getUniqueOptions(
        TASKS_MOCK.filter((task) => !values.stage || task.stageAr === values.stage).map((task) => ({
          value: task.classroomAr,
          label: isArabic ? task.classroomAr : task.classroomEn,
        }))
      ),
    [isArabic, values.stage]
  );

  const subjectOptions = useMemo(
    () =>
      getUniqueOptions(
        TASKS_MOCK.map((task) => ({
          value: task.subjectAr,
          label: isArabic ? task.subjectAr : task.subjectEn,
        }))
      ),
    [isArabic]
  );

  const taskTypeOptions: Array<{ value: TaskType; label: string }> = [
    { value: 'homework', label: t('tasksManagement.taskTypes.homework') },
    { value: 'training', label: t('tasksManagement.taskTypes.training') },
    { value: 'dictation', label: t('tasksManagement.taskTypes.dictation') },
    { value: 'quiz', label: t('tasksManagement.taskTypes.quiz') },
  ];

  const patchValue = <K extends keyof TaskFormValues>(key: K, newValue: TaskFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachmentFiles(files);
    if (files.length > 0) {
      setExistingFileNames([]);
    }
  };

  const handleFileDelete = () => {
    setAttachmentFiles([]);
    setExistingFileNames([]);
  };

  const handleAssignAll = () => {
    patchValue('assignTo', 'all');
    setSelectedStudents([]);
    setIsStudentsPopupOpen(false);
  };

  const handleAssignSpecific = () => {
    patchValue('assignTo', 'specific');
    setIsStudentsPopupOpen(true);
  };

  const handleStudentsConfirm = (students: TaskStudentOption[]) => {
    setSelectedStudents(students);
  };

  const primarySelectedStudent = selectedStudents[0];

  const handleSubmit = () => {
    showToast({
      message:
        mode === 'add'
          ? 'tasksManagement.messages.addSuccess'
          : 'tasksManagement.messages.editSuccess',
      type: 'success',
    });
    navigate('/calendar/tasks');
  };

  return (
    <div>
      <Card>
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('tasksManagement.form.educationalStage')} required>
              <CustomSelect
                value={values.stage}
                onChange={(value) => {
                  patchValue('stage', Array.isArray(value) ? (value[0] ?? '') : value);
                  patchValue('classroom', '');
                }}
                options={stageOptions}
                placeholder={t('tasksManagement.form.educationalStagePlaceholder')}
                showSearch={false}
              />
            </FormField>

            <FormField label={t('tasksManagement.form.classroom')} required>
              <CustomSelect
                value={values.classroom}
                onChange={(value) =>
                  patchValue('classroom', Array.isArray(value) ? (value[0] ?? '') : value)
                }
                options={classroomOptions}
                placeholder={t('tasksManagement.form.classroomPlaceholder')}
                showSearch={false}
              />
            </FormField>
          </div>

          <FormField label={t('tasksManagement.form.subject')} required>
            <CustomSelect
              value={values.subject}
              onChange={(value) =>
                patchValue('subject', Array.isArray(value) ? (value[0] ?? '') : value)
              }
              options={subjectOptions}
              placeholder={t('tasksManagement.form.subjectPlaceholder')}
              showSearch={false}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('tasksManagement.form.taskNameAr')} required>
              <Input
                value={values.nameAr}
                onChange={(event) => patchValue('nameAr', event.target.value)}
                placeholder={t('tasksManagement.form.taskNameArPlaceholder')}
              />
            </FormField>
            <FormField label={t('tasksManagement.form.taskNameEn')} required>
              <Input
                value={values.nameEn}
                onChange={(event) => patchValue('nameEn', event.target.value)}
                placeholder={t('tasksManagement.form.taskNameEnPlaceholder')}
              />
            </FormField>
          </div>

          <FormField label={t('tasksManagement.form.taskType')} required>
            <div className="flex flex-wrap items-center gap-8 px-2 py-2">
              {taskTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-base text-black-800"
                >
                  <input
                    type="radio"
                    checked={values.taskType === option.value}
                    onChange={() => patchValue('taskType', option.value)}
                    className="h-4 w-4"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('tasksManagement.form.taskDate')} required>
              <Input
                type="date"
                value={values.taskDate}
                onChange={(event) => patchValue('taskDate', event.target.value)}
                placeholder={t('tasksManagement.form.taskDatePlaceholder')}
              />
            </FormField>
            <FormField label={t('tasksManagement.form.deliveryDate')} required>
              <Input
                type="date"
                value={values.deliveryDate}
                onChange={(event) => patchValue('deliveryDate', event.target.value)}
                placeholder={t('tasksManagement.form.deliveryDatePlaceholder')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('tasksManagement.form.startPage')} optional>
              <Input
                type="number"
                value={values.startPage}
                onChange={(event) => patchValue('startPage', event.target.value)}
                placeholder={t('tasksManagement.form.startPagePlaceholder')}
              />
            </FormField>
            <FormField label={t('tasksManagement.form.endPage')} optional>
              <Input
                type="number"
                value={values.endPage}
                onChange={(event) => patchValue('endPage', event.target.value)}
                placeholder={t('tasksManagement.form.endPagePlaceholder')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <FormField label={t('tasksManagement.form.descriptionAr')} optional>
              <textarea
                value={values.descriptionAr}
                onChange={(event) => patchValue('descriptionAr', event.target.value)}
                placeholder={t('tasksManagement.form.descriptionArPlaceholder')}
                className="min-h-[60px] w-full rounded-lg border border-gray-300 px-4 py-3 transition-all placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </FormField>
            <FormField label={t('tasksManagement.form.descriptionEn')} optional>
              <textarea
                value={values.descriptionEn}
                onChange={(event) => patchValue('descriptionEn', event.target.value)}
                placeholder={t('tasksManagement.form.descriptionEnPlaceholder')}
                className="min-h-[60px] w-full rounded-lg border border-gray-300 px-4 py-3 transition-all placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </FormField>
          </div>

          <FormField label={t('tasksManagement.form.assignTo')} required>
            <div className="space-y-4 px-2 py-2">
              <div className="flex flex-wrap items-center gap-8">
                <label className="flex items-center gap-2 text-base text-black-800">
                  <input
                    type="radio"
                    checked={values.assignTo === 'all'}
                    onChange={handleAssignAll}
                    className="h-4 w-4"
                  />
                  {t('tasksManagement.form.assignAll')}
                </label>
                <label
                  className="flex cursor-pointer items-center gap-2 text-base text-black-800"
                  onClick={() => {
                    if (values.assignTo === 'specific') {
                      setIsStudentsPopupOpen(true);
                    }
                  }}
                >
                  <input
                    type="radio"
                    checked={values.assignTo === 'specific'}
                    onChange={handleAssignSpecific}
                    className="h-4 w-4"
                  />
                  {t('tasksManagement.form.assignSpecific')}
                </label>
              </div>

              {values.assignTo === 'specific' && selectedStudents.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setIsStudentsPopupOpen(true)}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                        <CustomImage
                          src={primarySelectedStudent?.avatar}
                          fallbackSrc={DefaultAvatar}
                          alt={
                            primarySelectedStudent?.name || t('tasksManagement.form.assignSpecific')
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="truncate text-[1.25rem] text-gray-800">
                        {primarySelectedStudent?.name}
                      </span>
                    </div>
                    <span className="text-[1.25rem] font-semibold leading-none text-green-500">
                      +{selectedStudents.length}
                      <span className="mx-1">{t('tasksManagement.form.student')}</span>
                    </span>
                  </div>
                </button>
              ) : null}
            </div>
          </FormField>

          <FormField label={t('tasksManagement.form.attachments')} required>
            <FileUpload
              label=""
              onChange={handleFileChange}
              onDelete={handleFileDelete}
              fileNames={
                attachmentFiles.length
                  ? attachmentFiles.map((file) => file.name)
                  : existingFileNames
              }
              files={attachmentFiles}
              accept=".pdf,.png,.jpg,.jpeg,.gif,.svg"
              uploadText={t('tasksManagement.form.uploadAttachment')}
              formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
            />
          </FormField>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="min-w-[120px]"
              onClick={() => navigate('/calendar/tasks')}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              className="min-w-[160px]"
              onClick={handleSubmit}
            >
              {mode === 'add'
                ? t('tasksManagement.addPage.submitButton')
                : t('tasksManagement.editPage.submitButton')}
            </Button>
          </div>
        </div>
      </Card>

      <TaskStudentsPopup
        isOpen={isStudentsPopupOpen}
        onClose={() => setIsStudentsPopupOpen(false)}
        onConfirm={handleStudentsConfirm}
        initialSelectedStudents={selectedStudents}
        classroomName={values.classroom}
      />
    </div>
  );
}
