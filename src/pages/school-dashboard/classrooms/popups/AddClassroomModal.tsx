import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { createClassroom } from '@/redux/features/classrooms/classroomsSlice';
import { EditClassroomSchema, type EditClassroomProps } from '@/validations/classrooms-validations';
import WhitePlusIcon from '@gradex/assets/icons/WhitePlus.svg';
import ClassroomFormModal from './ClassroomFormModal';
import { EMPTY_CLASSROOM_VALUES } from './ClassroomFormDefaults';

export type AddClassroomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Preselects and locks the grade, e.g. when opened from a grade's classrooms page. */
  gradeId?: string;
  onSuccess?: () => void;
};

export default function AddClassroomModal({
  isOpen,
  onClose,
  gradeId,
  onSuccess,
}: AddClassroomModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const schoolBranchId = getCurrentSchoolBranchId();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isCreating = useAppSelector((state) => state.classrooms.isCreating);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditClassroomProps>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(EditClassroomSchema) as any,
    mode: 'onBlur',
    defaultValues: { ...EMPTY_CLASSROOM_VALUES, educationalStage: gradeId ?? '' },
  });

  const scrollToFirstError = useScrollToFirstError<EditClassroomProps>();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({ ...EMPTY_CLASSROOM_VALUES, educationalStage: gradeId ?? '' });
    setImageFile(null);
  }, [isOpen, gradeId, reset]);

  const onSubmit = async (data: EditClassroomProps) => {
    const formData = new FormData();

    formData.append(
      'DtosJson',
      JSON.stringify([
        {
          academicSystemId: data.academicSystem,
          gradeId: data.educationalStage,
          name: data.name,
          nameEn: data.nameEn,
          alias: data.alias || '',
          aliasEn: data.aliasEn || '',
          studentNumber: data.maxStudents,
          note: data.note || '',
          noteEn: data.noteEn || '',
          ...(schoolBranchId && { schoolBranchId }),
        },
      ])
    );

    if (imageFile) {
      formData.append('Images', imageFile);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await dispatch(createClassroom(formData as any)).unwrap();

      if (!response.isSuccess) {
        showToast({ message: t('common.errorOccurred'), type: 'error' });
        return;
      }

      showToast({ message: t('grades.gradesAddedSuccessfully'), type: 'success' });
      onSuccess?.();
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
      title={t('grades.addClassroom')}
      subtitle={t('classrooms.addModalSubtitle')}
      control={control}
      errors={errors}
      gradeLocked={Boolean(gradeId)}
      imageFile={imageFile}
      onImageFileChange={setImageFile}
      isSaving={isCreating}
      submitLabel={t('common.add')}
      submitActionKey="add"
      submitIconSrc={WhitePlusIcon}
      onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
    />
  );
}
