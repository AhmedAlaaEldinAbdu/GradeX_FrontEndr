import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import { useToast } from '@/shared/context/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { createClassroom } from '@/redux/features/classrooms/classroomsSlice';
import { getAcademicSystems } from '@/redux/features/academic-system/academicSystemSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { EditClassroomSchema, type EditClassroomProps } from '@/validations/classrooms-validations';
import CloseXGreenIcon from '@gradex/assets/icons/CloseXGreen.svg';
import ImageUploadGreenIcon from '@gradex/assets/icons/ImageUploadGreen.svg';
import WhitePlusIcon from '@gradex/assets/icons/WhitePlus.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';

const MAX_STUDENTS_LIMIT = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Field styling comes straight from the Figma modal spec, which is tighter and
// lighter than the app-wide default field look.
const FIELD_CLASS =
  'h-auto! min-h-0! rounded-xl! border-[#e2e8f0]! bg-[#f8fafc]/50! px-[15px]! py-[10px]! text-xs! placeholder:text-xs! placeholder:text-[#9d9d9d]!';
const BODY_LABEL_CLASS = '[&_label]:text-sm! [&_label]:font-medium! [&_label]:text-black-900!';

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
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const academicSystems = useAppSelector((state) => state.academicSystems.academicSystems);
  const isLoadingAcademicSystems = useAppSelector((state) => state.academicSystems.isLoading);
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const isLoadingEducationalStages = useAppSelector((state) => state.educationalStages.isLoading);
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
    defaultValues: {
      academicSystem: '',
      educationalStage: gradeId ?? '',
      name: '',
      nameEn: '',
      alias: '',
      aliasEn: '',
      note: '',
      noteEn: '',
      maxStudents: MAX_STUDENTS_LIMIT,
    },
  });

  const scrollToFirstError = useScrollToFirstError<EditClassroomProps>();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dispatch(getAcademicSystems({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
  }, [dispatch, isOpen, schoolBranchId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      academicSystem: '',
      educationalStage: gradeId ?? '',
      name: '',
      nameEn: '',
      alias: '',
      aliasEn: '',
      note: '',
      noteEn: '',
      maxStudents: MAX_STUDENTS_LIMIT,
    });
    setImageFile(null);
  }, [isOpen, gradeId, reset]);

  const acceptImage = (file?: File) => {
    if (!file) {
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      showToast({ message: t('classrooms.imageFormatsHint'), type: 'error' });
      return;
    }

    setImageFile(file);
  };

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

  const selectOptions = (items: { id?: string; nameAr?: string; nameEn?: string }[] | undefined) =>
    Array.isArray(items)
      ? items.map((item) => ({
          value: item?.id || '',
          label: (currentLang === 'ar' ? item?.nameAr : item?.nameEn) || '',
        }))
      : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
      size="md"
      panelClassName="rounded-2xl! border border-[rgba(226,232,240,0.9)] shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]"
      contentClassName="p-0!"
    >
      {/* Children are ordered start -> end: in RTL the first child renders on the right. */}
      <div className="flex items-start justify-between border-b border-[#f1f5f9] px-8 pt-7 pb-[21px]">
        <div className="flex flex-col items-start justify-start gap-1">
          <h2 className="text-xl leading-7 font-bold text-black-900">{t('grades.addClassroom')}</h2>
          <p className="text-xs text-[#9d9d9d]">{t('classrooms.addModalSubtitle')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.cancel')}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <CustomImage src={CloseXGreenIcon} alt="" className="h-5 w-5" />
        </button>
      </div>

      <div className={`flex flex-col gap-5 px-8 py-6 ${BODY_LABEL_CLASS}`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label={t('grades.academicSystemLabel')}
            required
            error={errors.academicSystem?.message}
            name="academicSystem"
          >
            <Controller
              name="academicSystem"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                  options={selectOptions(academicSystems)}
                  placeholder={
                    isLoadingAcademicSystems
                      ? t('common.loading')
                      : t('grades.selectAcademicSystem')
                  }
                  disabled={isLoadingAcademicSystems}
                  error={!!errors.academicSystem}
                  triggerClassName={FIELD_CLASS}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('grades.gradeLabel')}
            required
            error={errors.educationalStage?.message}
            name="educationalStage"
          >
            <Controller
              name="educationalStage"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                  options={selectOptions(educationalStages)}
                  placeholder={
                    isLoadingEducationalStages ? t('common.loading') : t('common.selectAnOption')
                  }
                  disabled={isLoadingEducationalStages || Boolean(gradeId)}
                  error={!!errors.educationalStage}
                  triggerClassName={FIELD_CLASS}
                />
              )}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label={t('classrooms.classroomNameAr')}
            required
            error={errors.name?.message}
            name="name"
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={t('classrooms.enterClassroomNameAr')}
                  className={FIELD_CLASS}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('classrooms.classroomNameEn')}
            required
            error={errors.nameEn?.message}
            name="nameEn"
          >
            <Controller
              name="nameEn"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={t('classrooms.enterClassroomNameEn')}
                  className={FIELD_CLASS}
                />
              )}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label={t('classrooms.aliasArLabel')}
            error={errors.alias?.message}
            name="alias"
          >
            <Controller
              name="alias"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={t('classrooms.enterClassroomNameAr')}
                  className={FIELD_CLASS}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('classrooms.aliasEnLabel')}
            error={errors.aliasEn?.message}
            name="aliasEn"
          >
            <Controller
              name="aliasEn"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={t('classrooms.enterClassroomNameEn')}
                  className={FIELD_CLASS}
                />
              )}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label={t('grades.descriptionAr')} error={errors.note?.message} name="note">
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={t('grades.enterDescriptionAr')}
                  className={FIELD_CLASS}
                />
              )}
            />
          </FormField>

          <FormField label={t('grades.descriptionEn')} error={errors.noteEn?.message} name="noteEn">
            <Controller
              name="noteEn"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={t('grades.enterDescriptionEn')}
                  className={FIELD_CLASS}
                />
              )}
            />
          </FormField>
        </div>

        <FormField
          label={t('grades.maxStudents')}
          required
          error={errors.maxStudents?.message}
          name="maxStudents"
        >
          <Controller
            name="maxStudents"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  type="text"
                  inputMode="numeric"
                  placeholder={t('grades.enterMaxStudents')}
                  className={`${FIELD_CLASS} pe-[49px]! text-sm! font-semibold!`}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (/^[0-9]*$/.test(value) && Number(value) <= MAX_STUDENTS_LIMIT) {
                      field.onChange(value === '' ? value : Number(value));
                    }
                  }}
                />
                <span className="pointer-events-none absolute inset-y-0 end-[15px] flex items-center text-xs text-[#9d9d9d]">
                  {t('grades.studentPlural')}
                </span>
              </div>
            )}
          />
        </FormField>

        <FormField label={t('grades.classImage')} name="classImage">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              acceptImage(event.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-[26px] transition-colors ${
              isDragging
                ? 'border-[#1e7a52] bg-[#ecfdf5]'
                : 'border-[#1e7a52] bg-[#ecfdf5]/30 hover:bg-[#ecfdf5]/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.svg"
              className="hidden"
              onChange={(event) => acceptImage(event.target.files?.[0])}
            />
            <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-[#ecfdf5]">
              <CustomImage src={ImageUploadGreenIcon} alt="" className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#1e7a52]">
                {t('grades.uploadClassImage')}
              </span>
              <span className="text-xs text-[#9d9d9d]">{t('classrooms.dragImageHere')}</span>
            </div>
            <span className="text-xs text-[#9d9d9d]">{t('classrooms.imageFormatsHint')}</span>
          </div>
        </FormField>

        {imageFile && (
          <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[rgba(248,250,252,0.5)] px-4 py-2">
            <span className="truncate text-xs text-black-800">{imageFile.name}</span>
            <button
              type="button"
              onClick={() => setImageFile(null)}
              aria-label={t('actions.delete')}
              className="rounded p-1 transition-colors hover:bg-red-100"
            >
              <CustomImage src={TrashIcon} alt="" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-[#f1f5f9] bg-[rgba(248,250,252,0.7)] px-8 pt-[21px] pb-5">
        <Button
          variant="success"
          actionKey="add"
          onClick={handleSubmit(onSubmit, scrollToFirstError)}
          disabled={isCreating}
          imgSrc={WhitePlusIcon}
          imgClassName="h-4 w-4"
          className={`rounded-lg! border-[#1e7a52]! bg-[#1e7a52]! px-6! py-2.5! text-sm! hover:bg-[#1e7a52]/90! ${
            isRTL ? 'flex-row-reverse' : ''
          }`}
        >
          {isCreating ? t('common.saving') : t('common.add')}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isCreating}
          className="rounded-lg! border! border-[#1e7a52]! px-6! py-2.5! text-sm! text-[#1e7a52]!"
        >
          {t('common.cancel')}
        </Button>
      </div>
    </Modal>
  );
}
