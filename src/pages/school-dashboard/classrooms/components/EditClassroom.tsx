import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import PopupMessage from '@/shared/popups/PopupMessage';
import Loading from '@/shared/components/Loading';
import FormField from '@/shared/components/FormField';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import { fetchClassroomById, editClassroom } from '@/redux/features/classrooms/classroomsSlice';
import { getAcademicSystems } from '@/redux/features/academic-system/academicSystemSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import Button from '@/shared/components/Button';
import FileUpload from '@/shared/components/FileUpload';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import { EditClassroomSchema, type EditClassroomProps } from '@/validations/classrooms-validations';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { getBackendMessage } from '@/lib/http';

export default function EditClassroom() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [existingFilePath, setExistingFilePath] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const userData = localStorage.getItem('userData') || undefined;
  const schoolBranchId = userData ? JSON.parse(userData)?.schoolBranchId : undefined;

  // Redux state
  const currentClassroom = useAppSelector((state) => state.classrooms.currentClassroom);
  const isLoading = useAppSelector((state) => state.classrooms.isLoading);
  const isUpdating = useAppSelector((state) => state.classrooms.isUpdating);
  const academicSystems = useAppSelector((state) => state.academicSystems.academicSystems);
  const isLoadingAcademicSystems = useAppSelector((state) => state.academicSystems.isLoading);
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const isLoadingEducationalStages = useAppSelector((state) => state.educationalStages.isLoading);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(EditClassroomSchema),
    mode: 'onBlur',
    defaultValues: {
      academicSystem: '',
      educationalStage: '',
      name: '',
      nameEn: '',
      alias: '',
      aliasEn: '',
      note: '',
      noteEn: '',
      maxStudents: 0,
    },
  });

  const scrollToFirstError = useScrollToFirstError<EditClassroomProps>();

  useEffect(() => {
    dispatch(getAcademicSystems({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
    if (id) {
      dispatch(fetchClassroomById(id));
    }
  }, [id, dispatch, schoolBranchId]);

  useEffect(() => {
    if (currentClassroom) {
      reset({
        academicSystem: currentClassroom.academicSystemId,
        educationalStage: currentClassroom.gradeId,
        name: currentClassroom.name,
        nameEn: currentClassroom.nameEn,
        alias: currentClassroom.alias || '',
        aliasEn: currentClassroom.aliasEn || '',
        note: currentClassroom.note || '',
        noteEn: currentClassroom.noteEn || '',
        maxStudents: currentClassroom.studentNumber,
      });

      if (currentClassroom.imagePath) {
        setExistingFilePath(currentClassroom.imagePath);
        setExistingFileName(currentClassroom.imagePath.split('/').pop() || null);
      }
    }
  }, [currentClassroom, reset]);

  const onSubmit = async (data: EditClassroomProps) => {
    if (!id) return;

    try {
      const formData = new FormData();

      // Append classroom id
      formData.append('id', id);

      // Append classroom data
      formData.append('academicSystemId', data.academicSystem);
      formData.append('gradeId', data.educationalStage);
      formData.append('name', data.name);
      formData.append('nameEn', data.nameEn);
      formData.append('alias', data.alias || '');
      formData.append('aliasEn', data.aliasEn || '');
      formData.append('note', data.note || '');
      formData.append('noteEn', data.noteEn || '');
      formData.append('studentNumber', data.maxStudents.toString());
      schoolBranchId && formData.append('schoolBranchId', schoolBranchId || '');

      if (uploadedFile) {
        formData.append('image', uploadedFile);
      } else if (existingFilePath) {
        formData.append('imagePath', existingFilePath);
      }

      await dispatch(editClassroom({ data: formData }))
        .unwrap()
        .then((res: any) => {
          if (res.isSuccess) {
            setShowPopupMessage({
              show: true,
              type: 'success',
              message: t('grades.gradeUpdatedSuccessfully'),
            });
          } else {
            const msg = getBackendMessage(res) || t('common.errorOccurred');
            setShowPopupMessage({
              show: true,
              type: 'error',
              message: msg,
            });
          }
        });
    } catch (error: any) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: getBackendMessage(error) || t('common.errorOccurred'),
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setValue('classImage', file);
    }
  };

  const handleFileDelete = () => {
    setUploadedFile(null);
    setValue('classImage', undefined);
  };

  const getFileName = (): string[] => {
    return uploadedFile ? [uploadedFile.name] : [];
  };

  if (isLoading) {
    return (
      <Card>
        <Loading />
      </Card>
    );
  }

  return (
    <Card>
      <div>
        <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)}>
          {/* Academic System and Educational Stage Selectors */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Academic System */}
            <FormField
              label={t('grades.academicSystemLabel')}
              required
              error={errors.academicSystem?.message}
              htmlFor="academicSystem"
            >
              <Controller
                name="academicSystem"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                    options={
                      Array.isArray(academicSystems)
                        ? academicSystems.map((system) => ({
                            value: system?.id || '',
                            label:
                              currentLang === 'ar' ? system?.nameAr || '' : system?.nameEn || '',
                          }))
                        : []
                    }
                    placeholder={
                      isLoadingAcademicSystems
                        ? t('common.loading')
                        : t('grades.selectAcademicSystem')
                    }
                    disabled={isLoadingAcademicSystems}
                    error={!!errors.academicSystem}
                  />
                )}
              />
            </FormField>

            {/* Educational Stage */}
            <FormField
              label={t('grades.gradeLabel')}
              required
              error={errors.educationalStage?.message}
              htmlFor="educationalStage"
            >
              <Controller
                name="educationalStage"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      const val = Array.isArray(value) ? value[0] : value;
                      field.onChange(val);
                    }}
                    options={
                      Array.isArray(educationalStages)
                        ? educationalStages.map((stage) => ({
                            value: stage?.id || '',
                            label: currentLang === 'ar' ? stage?.nameAr || '' : stage?.nameEn || '',
                          }))
                        : []
                    }
                    placeholder={
                      isLoadingEducationalStages ? t('common.loading') : t('common.selectAnOption')
                    }
                    disabled={true}
                    error={!!errors.educationalStage}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="rounded-md border p-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Classroom Name Arabic */}
                  <FormField
                    label={t('classrooms.classroomNameAr')}
                    required
                    error={errors.name?.message}
                    htmlFor="name"
                  >
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('classrooms.enterClassroomNameAr')}
                          className="w-full"
                          id="name"
                        />
                      )}
                    />
                  </FormField>

                  {/* Classroom Name English */}
                  <FormField
                    label={t('classrooms.classroomNameEn')}
                    required
                    error={errors.nameEn?.message}
                    htmlFor="nameEn"
                  >
                    <Controller
                      name="nameEn"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('classrooms.enterClassroomNameEn')}
                          className="w-full"
                          id="nameEn"
                        />
                      )}
                    />
                  </FormField>

                  {/* Nickname Arabic */}
                  <FormField
                    label={t('grades.nicknameAr')}
                    optional
                    error={errors.alias?.message}
                    htmlFor="alias"
                  >
                    <Controller
                      name="alias"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('grades.enterNicknameAr')}
                          className="w-full"
                          id="alias"
                        />
                      )}
                    />
                  </FormField>

                  {/* Nickname English */}
                  <FormField
                    label={t('grades.nicknameEn')}
                    optional
                    error={errors.aliasEn?.message}
                    htmlFor="aliasEn"
                  >
                    <Controller
                      name="aliasEn"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('grades.enterNicknameEn')}
                          className="w-full"
                          id="aliasEn"
                        />
                      )}
                    />
                  </FormField>

                  {/* Description Arabic */}
                  <FormField
                    label={t('grades.descriptionAr')}
                    optional
                    error={errors.note?.message}
                    htmlFor="note"
                  >
                    <Controller
                      name="note"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('grades.enterDescriptionAr')}
                          className="w-full"
                          id="note"
                        />
                      )}
                    />
                  </FormField>

                  {/* Description English */}
                  <FormField
                    label={t('grades.descriptionEn')}
                    optional
                    error={errors.noteEn?.message}
                    htmlFor="noteEn"
                  >
                    <Controller
                      name="noteEn"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('grades.enterDescriptionEn')}
                          className="w-full"
                          id="noteEn"
                        />
                      )}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Max Students */}
                  <FormField
                    label={t('grades.maxStudents')}
                    required
                    error={errors.maxStudents?.message}
                    htmlFor="maxStudents"
                  >
                    <Controller
                      name="maxStudents"
                      control={control}
                      render={({ field }) => {
                        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                          const val = e.target.value;

                          if (/^[0-9]*$/.test(val) && Number(val) <= 100) {
                            field.onChange(val);
                          }
                        };

                        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (
                            !/[0-9]/.test(e.key) &&
                            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
                              e.key
                            )
                          ) {
                            e.preventDefault();
                          }
                        };

                        return (
                          <Input
                            {...field}
                            type="text"
                            placeholder={t('grades.enterMaxStudents')}
                            className="w-full"
                            id={`maxStudents`}
                            inputMode="numeric"
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                          />
                        );
                      }}
                    />
                  </FormField>

                  {/* Class Image */}
                  <FormField label={t('grades.classImage')} optional>
                    {existingFilePath && existingFileName && getFileName().length === 0 && (
                      <ExistingFileDisplay
                        filePath={existingFilePath}
                        fileName={existingFileName}
                      />
                    )}
                    <FileUpload
                      label=""
                      accept=".jpg,.jpeg,.png,.gif,.svg"
                      onChange={handleFileUpload}
                      onDelete={handleFileDelete}
                      fileNames={getFileName()}
                      uploadText={t('grades.uploadClassImage')}
                      formatHints={['JPG', 'PNG', 'GIF', 'SVG']}
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting || isUpdating}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || isUpdating}>
              {isSubmitting || isUpdating ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>

      {/* Popup Message */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
        navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
      />
    </Card>
  );
}
