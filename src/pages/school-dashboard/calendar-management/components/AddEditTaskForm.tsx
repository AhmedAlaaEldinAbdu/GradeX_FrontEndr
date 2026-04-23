import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import FileUpload, { type FileUploadRef } from '@/shared/components/FileUpload';
import Loading from '@/shared/components/Loading';
import TextArea from '@/shared/components/TextArea';
import Button from '@/shared/components/Button';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import {
  addSchoolTask,
  fetchSchoolTaskById,
  updateSchoolTask,
} from '@/redux/features/school-tasks/schoolTasksSlice';
import { tokenManager } from '@/lib/auth/token-manager';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { AddSchoolTaskSchema, EditSchoolTaskSchema } from '@/validations/school-tasks-validations';
import { SchoolTaskType, type SchoolTask } from '@/types/schoolTasks';
import TaskStudentsPopup, { type TaskStudentOption } from '../popups/TaskStudentsPopup';

export interface TaskFormValues {
  schoolBranchesId: string;
  gradeId: string;
  classroomId: string;
  materialId: string;
  nameAr: string;
  nameEn: string;
  taskType: SchoolTaskType | 0;
  date: string;
  deliveryDate: string;
  startPageNumber: number | undefined;
  endPageNumber: number | undefined;
  descriptionAr: string;
  descriptionEn: string;
  assignmentType: number;
  studentIds: string[];
  attachment: File[];
  id?: string;
}

interface TaskFormProps {
  mode: 'add' | 'edit';
  initialTask?: SchoolTask;
}

const ASSIGNMENT_TYPE_ALL = 1;
const ASSIGNMENT_TYPE_SPECIFIC = 2;

const TASK_TYPE_OPTIONS: Array<{ value: SchoolTaskType; labelKey: string }> = [
  { value: SchoolTaskType.Type1, labelKey: 'tasksManagement.taskTypes.homework' },
  { value: SchoolTaskType.Type2, labelKey: 'tasksManagement.taskTypes.training' },
  { value: SchoolTaskType.Type3, labelKey: 'tasksManagement.taskTypes.dictation' },
  { value: SchoolTaskType.Type4, labelKey: 'tasksManagement.taskTypes.quiz' },
  { value: SchoolTaskType.Type5, labelKey: 'tasksManagement.form.taskType' },
  { value: SchoolTaskType.Type6, labelKey: 'tasksManagement.form.taskType' },
];

const normalizeDateForInput = (value?: string) => {
  if (!value) {
    return '';
  }

  const normalizedValue = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

const DEFAULT_VALUES = (schoolBranchId: string): TaskFormValues => ({
  id: '',
  schoolBranchesId: schoolBranchId,
  gradeId: '',
  classroomId: '',
  materialId: '',
  nameAr: '',
  nameEn: '',
  taskType: 0,
  date: '',
  deliveryDate: '',
  startPageNumber: undefined,
  endPageNumber: undefined,
  descriptionAr: '',
  descriptionEn: '',
  assignmentType: ASSIGNMENT_TYPE_ALL,
  studentIds: [],
  attachment: [],
});

export default function AddEditTaskForm({ mode, initialTask }: TaskFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId =
    getCurrentSchoolBranchId() ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  const [isStudentsPopupOpen, setIsStudentsPopupOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<TaskStudentOption[]>([]);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const fileUploadRef = useRef<FileUploadRef>(null);

  const subjects = useAppSelector((state) => state.subjects.subjects);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const isLoadingClassrooms = useAppSelector((state) => state.classrooms.isLoading);
  const grades = useAppSelector((state) => state.educationalStages.educationalStages);
  const isLoadingGrades = useAppSelector((state) => state.educationalStages.isLoading);
  const currentSchoolTask = useAppSelector((state) => state.schoolTasks.currentSchoolTask);
  const isLoadingTask = useAppSelector((state) => state.schoolTasks.isLoading);
  const isCreating = useAppSelector((state) => state.schoolTasks.isCreating);
  const isUpdating = useAppSelector((state) => state.schoolTasks.isUpdating);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<TaskFormValues>({
    resolver: yupResolver(
      mode === 'edit' ? EditSchoolTaskSchema : AddSchoolTaskSchema
    ) as Resolver<TaskFormValues>,
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES(schoolBranchId),
  });

  const watchedClassroomId = watch('classroomId');
  const watchedTaskType = watch('taskType');
  const watchedAssignmentType = watch('assignmentType');
  const watchedStudentIds = watch('studentIds') || [];

  useEffect(() => {
    dispatch(
      fetchSubjects({
        page: 1,
        limit: 10000,
        filters: { schoolBranchesId: schoolBranchId || undefined },
      })
    );
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: { schoolBranchId: schoolBranchId || undefined },
      })
    );
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      dispatch(fetchSchoolTaskById(id));
    }
  }, [dispatch, id, mode]);

  useEffect(() => {
    const task = mode === 'edit' ? currentSchoolTask || initialTask : initialTask;

    if (!task) {
      return;
    }

    reset({
      id: task.id,
      schoolBranchesId: task.schoolBranchesId || schoolBranchId,
      gradeId: task.gradeId || '',
      classroomId: task.classroomId || '',
      materialId: task.materialId || '',
      nameAr: task.nameAr || task.name || '',
      nameEn: task.nameEn || task.name || '',
      taskType: task.taskType,
      date: normalizeDateForInput(task.date),
      deliveryDate: normalizeDateForInput(task.deliveryDate),
      startPageNumber: task.startPageNumber,
      endPageNumber: task.endPageNumber,
      descriptionAr: task.descriptionAr || task.description || '',
      descriptionEn: task.descriptionEn || task.description || '',
      assignmentType: task.assignmentType || ASSIGNMENT_TYPE_ALL,
      studentIds: task.studentIds || [],
      attachment: [],
    });
  }, [currentSchoolTask, id, initialTask, mode, reset, schoolBranchId]);

  useEffect(() => {
    setValue('schoolBranchesId', schoolBranchId);
  }, [schoolBranchId, setValue]);

  const stageOptions = useMemo(
    () =>
      grades.map((grade) => ({
        value: grade.id,
        label: currentLang === 'ar' ? grade.nameAr : grade.nameEn,
      })),
    [currentLang, grades]
  );

  const classroomOptions = useMemo(
    () =>
      classrooms.map((classroom) => ({
        value: classroom.id,
        label: currentLang === 'ar' ? classroom.name : classroom.nameEn || classroom.name,
      })),
    [classrooms, currentLang]
  );

  const subjectOptions = useMemo(
    () =>
      subjects.map((subject) => ({
        value: subject.id,
        label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
      })),
    [currentLang, subjects]
  );

  const selectedClassroom = useMemo(
    () => classrooms.find((classroom) => classroom.id === watchedClassroomId),
    [classrooms, watchedClassroomId]
  );

  const selectedTaskTypeLabel = (taskType: SchoolTaskType) => {
    const match = TASK_TYPE_OPTIONS.find((option) => option.value === taskType);
    if (!match) {
      return `${t('tasksManagement.form.taskType')} ${taskType}`;
    }

    const translatedLabel = t(match.labelKey);
    return match.value > SchoolTaskType.Type4
      ? `${translatedLabel} ${match.value}`
      : translatedLabel;
  };

  const handleAssignAll = () => {
    setValue('assignmentType', ASSIGNMENT_TYPE_ALL, { shouldDirty: true, shouldValidate: true });
    setValue('studentIds', [], { shouldDirty: true, shouldValidate: true });
    setSelectedStudents([]);
    setIsStudentsPopupOpen(false);
  };

  const handleAssignSpecific = () => {
    setValue('assignmentType', ASSIGNMENT_TYPE_SPECIFIC, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setIsStudentsPopupOpen(true);
  };

  const handleStudentsConfirm = (students: TaskStudentOption[]) => {
    setSelectedStudents(students);
    setValue(
      'studentIds',
      students.map((student) => student.id),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const primarySelectedStudent = selectedStudents[0];

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const payload = {
        schoolBranchesId: schoolBranchId,
        gradeId: data.gradeId,
        classroomId: data.classroomId,
        materialId: data.materialId,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        taskType: data.taskType as SchoolTaskType,
        date: data.date,
        deliveryDate: data.deliveryDate,
        startPageNumber: Number(data.startPageNumber ?? 0),
        endPageNumber: Number(data.endPageNumber ?? 0),
        descriptionAr: data.descriptionAr || undefined,
        descriptionEn: data.descriptionEn || undefined,
        assignmentType: Number(data.assignmentType),
        attachment: fileUploadRef.current?.getFiles() ?? [],
        studentIds:
          Number(data.assignmentType) === ASSIGNMENT_TYPE_SPECIFIC ? data.studentIds || [] : [],
      };

      if (mode === 'edit' && id) {
        await dispatch(
          updateSchoolTask({
            id,
            data: {
              ...payload,
              id,
            },
          })
        ).unwrap();
      } else {
        await dispatch(addSchoolTask(payload)).unwrap();
      }

      setShowPopupMessage({
        show: true,
        type: 'success',
        message:
          mode === 'add'
            ? 'tasksManagement.messages.addSuccess'
            : 'tasksManagement.messages.editSuccess',
      });
    } catch (error) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: typeof error === 'string' ? error : 'common.errorOccurred',
      });
    }
  };

  const isLoadingInitialTask =
    mode === 'edit' && !initialTask && isLoadingTask && !currentSchoolTask;

  if (isLoadingInitialTask) {
    return (
      <Card>
        <Loading />
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label={t('tasksManagement.form.educationalStage')}
              required
              error={errors.gradeId?.message}
            >
              <Controller
                name="gradeId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) =>
                      field.onChange(Array.isArray(value) ? (value[0] ?? '') : value)
                    }
                    options={stageOptions}
                    placeholder={
                      isLoadingGrades
                        ? t('common.loading')
                        : t('tasksManagement.form.educationalStagePlaceholder')
                    }
                    showSearch={false}
                    disabled={isLoadingGrades}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('tasksManagement.form.classroom')}
              required
              error={errors.classroomId?.message}
            >
              <Controller
                name="classroomId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) =>
                      field.onChange(Array.isArray(value) ? (value[0] ?? '') : value)
                    }
                    options={classroomOptions}
                    placeholder={
                      isLoadingClassrooms
                        ? t('common.loading')
                        : t('tasksManagement.form.classroomPlaceholder')
                    }
                    showSearch={false}
                    disabled={isLoadingClassrooms}
                  />
                )}
              />
            </FormField>
          </div>

          <FormField
            label={t('tasksManagement.form.subject')}
            required
            error={errors.materialId?.message}
          >
            <Controller
              name="materialId"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={(value) =>
                    field.onChange(Array.isArray(value) ? (value[0] ?? '') : value)
                  }
                  options={subjectOptions}
                  placeholder={
                    isLoadingSubjects
                      ? t('common.loading')
                      : t('tasksManagement.form.subjectPlaceholder')
                  }
                  showSearch={false}
                  disabled={isLoadingSubjects}
                />
              )}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label={t('tasksManagement.form.taskNameAr')}
              required
              error={errors.nameAr?.message}
            >
              <Controller
                name="nameAr"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder={t('tasksManagement.form.taskNameArPlaceholder')}
                  />
                )}
              />
            </FormField>
            <FormField
              label={t('tasksManagement.form.taskNameEn')}
              required
              error={errors.nameEn?.message}
            >
              <Controller
                name="nameEn"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder={t('tasksManagement.form.taskNameEnPlaceholder')}
                  />
                )}
              />
            </FormField>
          </div>

          <FormField
            label={t('tasksManagement.form.taskType')}
            required
            error={errors.taskType?.message}
          >
            <div className="flex flex-wrap items-center gap-8 px-2 py-2">
              {TASK_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-base text-black-800"
                >
                  <input
                    type="radio"
                    checked={watchedTaskType === option.value}
                    onChange={() => setValue('taskType', option.value, { shouldValidate: true })}
                    className="h-4 w-4"
                  />
                  {selectedTaskTypeLabel(option.value)}
                </label>
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label={t('tasksManagement.form.taskDate')}
              required
              error={errors.date?.message}
            >
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    value={field.value || ''}
                    placeholder={t('tasksManagement.form.taskDatePlaceholder')}
                  />
                )}
              />
            </FormField>
            <FormField
              label={t('tasksManagement.form.deliveryDate')}
              required
              error={errors.deliveryDate?.message}
            >
              <Controller
                name="deliveryDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    value={field.value || ''}
                    placeholder={t('tasksManagement.form.deliveryDatePlaceholder')}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label={t('tasksManagement.form.startPage')}
              required
              error={errors.startPageNumber?.message}
            >
              <Controller
                name="startPageNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === '' ? undefined : Math.max(0, Number(value)));
                    }}
                    placeholder={t('tasksManagement.form.startPagePlaceholder')}
                  />
                )}
              />
            </FormField>
            <FormField
              label={t('tasksManagement.form.endPage')}
              required
              error={errors.endPageNumber?.message}
            >
              <Controller
                name="endPageNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === '' ? undefined : Math.max(0, Number(value)));
                    }}
                    placeholder={t('tasksManagement.form.endPagePlaceholder')}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <FormField
              label={t('tasksManagement.form.descriptionAr')}
              optional
              error={errors.descriptionAr?.message}
            >
              <Controller
                name="descriptionAr"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    value={field.value || ''}
                    placeholder={t('tasksManagement.form.descriptionArPlaceholder')}
                    className="min-h-[60px]"
                  />
                )}
              />
            </FormField>
            <FormField
              label={t('tasksManagement.form.descriptionEn')}
              optional
              error={errors.descriptionEn?.message}
            >
              <Controller
                name="descriptionEn"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    value={field.value || ''}
                    placeholder={t('tasksManagement.form.descriptionEnPlaceholder')}
                    className="min-h-[60px]"
                  />
                )}
              />
            </FormField>
          </div>

          <FormField
            label={t('tasksManagement.form.assignTo')}
            required
            error={errors.assignmentType?.message || errors.studentIds?.message}
          >
            <div className="space-y-4 px-2 py-2">
              <div className="flex flex-wrap items-center gap-8">
                <label className="flex items-center gap-2 text-base text-black-800">
                  <input
                    type="radio"
                    checked={watchedAssignmentType === ASSIGNMENT_TYPE_ALL}
                    onChange={handleAssignAll}
                    className="h-4 w-4"
                  />
                  {t('tasksManagement.form.assignAll')}
                </label>
                <label
                  className="flex cursor-pointer items-center gap-2 text-base text-black-800"
                  onClick={() => {
                    if (watchedAssignmentType === ASSIGNMENT_TYPE_SPECIFIC) {
                      setIsStudentsPopupOpen(true);
                    }
                  }}
                >
                  <input
                    type="radio"
                    checked={watchedAssignmentType === ASSIGNMENT_TYPE_SPECIFIC}
                    onChange={handleAssignSpecific}
                    className="h-4 w-4"
                  />
                  {t('tasksManagement.form.assignSpecific')}
                </label>
              </div>

              {watchedAssignmentType === ASSIGNMENT_TYPE_SPECIFIC &&
              (selectedStudents.length > 0 || watchedStudentIds.length > 0) ? (
                <button
                  type="button"
                  onClick={() => setIsStudentsPopupOpen(true)}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                        <CustomImage
                          src={primarySelectedStudent?.avatar || DefaultAvatar}
                          fallbackSrc={DefaultAvatar}
                          alt={
                            primarySelectedStudent?.name || t('tasksManagement.form.assignSpecific')
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="truncate text-[1.25rem] text-gray-800">
                        {primarySelectedStudent?.name || t('tasksManagement.form.selectedStudents')}
                      </span>
                    </div>
                    <span className="text-[1.25rem] font-semibold leading-none text-green-500">
                      +{Math.max(selectedStudents.length, watchedStudentIds.length)}
                      <span className="mx-1">{t('tasksManagement.form.student')}</span>
                    </span>
                  </div>
                </button>
              ) : null}
            </div>
          </FormField>

          <FormField label={t('tasksManagement.form.attachments')} optional>
            <FileUpload
              ref={fileUploadRef}
              label=""
              accept=".pdf,.png,.jpg,.jpeg,.gif,.svg"
              uploadText={t('tasksManagement.form.uploadAttachment')}
              formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
              multiple
              attachmentUrls={
                mode === 'edit' ? (currentSchoolTask || initialTask)?.attachmentUrls : undefined
              }
            />
          </FormField>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="min-w-[120px]"
              onClick={() => navigate('/calendar/tasks')}
              disabled={isSubmitting || isCreating || isUpdating}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="min-w-[160px]"
              disabled={isSubmitting || isCreating || isUpdating}
            >
              {isSubmitting || isCreating || isUpdating
                ? t('common.saving')
                : mode === 'add'
                  ? t('tasksManagement.addPage.submitButton')
                  : t('tasksManagement.editPage.submitButton')}
            </Button>
          </div>
        </form>
      </Card>

      <TaskStudentsPopup
        isOpen={isStudentsPopupOpen}
        onClose={() => setIsStudentsPopupOpen(false)}
        onConfirm={handleStudentsConfirm}
        initialSelectedStudents={selectedStudents}
        classroomName={
          selectedClassroom
            ? currentLang === 'ar'
              ? selectedClassroom.name
              : selectedClassroom.nameEn || selectedClassroom.name
            : undefined
        }
      />

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage((current) => ({ ...current, show: false }))}
        navigateAfterClose={showPopupMessage.type === 'success' ? '/calendar/tasks' : undefined}
      />
    </div>
  );
}
