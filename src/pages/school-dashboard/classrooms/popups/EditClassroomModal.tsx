import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { editClassroom, fetchClassroomById } from '@/redux/features/classrooms/classroomsSlice';
import { EditClassroomSchema, type EditClassroomProps } from '@/validations/classrooms-validations';
import ClassroomFormModal from './ClassroomFormModal';
import { EMPTY_CLASSROOM_VALUES, MAX_STUDENTS_LIMIT } from './ClassroomFormDefaults';

export type EditClassroomModalProps = {
  isOpen: boolean;
  classroomId: string | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
};

export default function EditClassroomModal({
  isOpen,
  classroomId,
  onClose,
  onSuccess,
}: EditClassroomModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const schoolBranchId = getCurrentSchoolBranchId();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null);
  const [loadedClassroomId, setLoadedClassroomId] = useState<string | null>(null);
  const isUpdating = useAppSelector((state) => state.classrooms.isUpdating);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditClassroomProps>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(EditClassroomSchema) as any,
    mode: 'onBlur',
    defaultValues: EMPTY_CLASSROOM_VALUES,
  });

  const scrollToFirstError = useScrollToFirstError<EditClassroomProps>();

  useEffect(() => {
    if (!isOpen || !classroomId) {
      return;
    }

    setImageFile(null);
    setExistingImagePath(null);
    setLoadedClassroomId(null);
    reset(EMPTY_CLASSROOM_VALUES);

    let cancelled = false;
    dispatch(fetchClassroomById(classroomId))
      .unwrap()
      .then((classroom) => {
        if (cancelled) return;
        reset({
          academicSystem: classroom.academicSystemId ?? '',
          educationalStage: classroom.gradeId ?? '',
          name: classroom.name ?? '',
          nameEn: classroom.nameEn ?? '',
          alias: classroom.alias || '',
          aliasEn: classroom.aliasEn || '',
          note: classroom.note || '',
          noteEn: classroom.noteEn || '',
          maxStudents: classroom.maxStudentNumber ?? MAX_STUDENTS_LIMIT,
        });
        setExistingImagePath(classroom.imagePath || null);
        setLoadedClassroomId(classroomId);
      })
      .catch(() => {
        if (cancelled) return;
        showToast({ message: t('common.errorOccurred'), type: 'error' });
        onClose();
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, classroomId, reset, dispatch]);

  const onSubmit = async (data: EditClassroomProps) => {
    if (!classroomId) return;

    const formData = new FormData();
    formData.append('id', classroomId);
    formData.append('academicSystemId', data.academicSystem);
    formData.append('gradeId', data.educationalStage);
    formData.append('name', data.name);
    formData.append('nameEn', data.nameEn);
    formData.append('alias', data.alias || '');
    formData.append('aliasEn', data.aliasEn || '');
    formData.append('note', data.note || '');
    formData.append('noteEn', data.noteEn || '');
    formData.append('studentNumber', String(data.maxStudents));
    if (schoolBranchId) formData.append('schoolBranchId', schoolBranchId);
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (existingImagePath) {
      formData.append('imagePath', existingImagePath);
    }

    try {
      const response = await dispatch(editClassroom({ data: formData })).unwrap();

      if (!response.isSuccess) {
        showToast({ message: t('common.errorOccurred'), type: 'error' });
        return;
      }

      onSuccess?.(t('classrooms.updatedSuccessfully'));
      onClose();
    } catch (error) {
      const message = typeof error === 'string' ? error : t('common.errorOccurred');
      showToast({ message, type: 'error', isRaw: typeof error === 'string' });
    }
  };

  return (
    <ClassroomFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('grades.editClassroom')}
      subtitle={t('classrooms.editModalSubtitle')}
      control={control}
      errors={errors}
      imageFile={imageFile}
      onImageFileChange={setImageFile}
      existingImagePath={existingImagePath}
      onRemoveExistingImage={() => setExistingImagePath(null)}
      isLoading={loadedClassroomId !== classroomId}
      isSaving={isUpdating}
      submitLabel={t('common.save')}
      submitActionKey="edit"
      onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
    />
  );
}
