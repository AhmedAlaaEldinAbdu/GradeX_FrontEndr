import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import PopupMessage from '@/shared/components/PopupMessage';
import FormField from '@/shared/components/FormField';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import FileUpload from '@/shared/components/FileUpload';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import { EditClassroomSchema, type EditClassroomProps } from '@/validations/classrooms-validations';

export default function EditClassroom() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [existingFilePath, setExistingFilePath] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // TODO: Replace with actual Redux selectors when slice is created
  const academicSystems: any[] = [
    { id: 'sys1', nameAr: 'العالمي', nameEn: 'International' },
    { id: 'sys2', nameAr: 'الأمريكي', nameEn: 'American' },
    { id: 'sys3', nameAr: 'البريطاني', nameEn: 'British' },
  ];
  const isLoadingAcademicSystems = false;

  const educationalStages: any[] = [
    { id: 'stage1', nameAr: 'المرحلة الابتدائية', nameEn: 'Primary School' },
    { id: 'stage2', nameAr: 'المرحلة الإعدادية', nameEn: 'Middle School' },
    { id: 'stage3', nameAr: 'المرحلة الثانوية', nameEn: 'High School' },
  ];
  const isLoadingEducationalStages = false;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(EditClassroomSchema),
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

  useEffect(() => {
    // TODO: Fetch classroom data when Redux is ready
    // dispatch(getClassroomById(id))
    // For now, simulate loading
    setTimeout(() => {
      // Mock data - replace with actual data from Redux
      reset({
        academicSystem: 'system-id',
        educationalStage: 'stage-id',
        name: 'الصف الثاني الإعدادي',
        nameEn: '2/ع',
        alias: 'الثاني الإعدادي',
        aliasEn: '2nd Middle',
        note: 'صف دراسي للمرحلة الإعدادية',
        noteEn: 'Middle school grade',
        maxStudents: 30,
      });
      setExistingFilePath('/path/to/image.jpg');
      setExistingFileName('class-image.jpg');
      setIsLoading(false);
    }, 500);
  }, [id, reset]);

  const onSubmit = (data: EditClassroomProps) => {
    // TODO: Implement submit when Redux is ready
    console.log('Form data:', data);
    console.log('Uploaded file:', uploadedFile);
    setShowPopupMessage({
      show: true,
      type: 'success',
      message: t('grades.gradeUpdatedSuccessfully'),
    });
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
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Academic System and Educational Stage Selectors */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Academic System */}
            <FormField
              label={t('grades.academicSystem')}
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
              label={t('grades.educationalStage')}
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
                    onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                    options={
                      Array.isArray(educationalStages)
                        ? educationalStages.map((stage) => ({
                            value: stage?.id || '',
                            label: currentLang === 'ar' ? stage?.nameAr || '' : stage?.nameEn || '',
                          }))
                        : []
                    }
                    placeholder={
                      isLoadingEducationalStages
                        ? t('common.loading')
                        : t('grades.selectEducationalStage')
                    }
                    disabled={isLoadingEducationalStages}
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
                  {/* Grade Name Arabic */}
                  <FormField
                    label={t('grades.gradeNameAr')}
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
                          placeholder={t('grades.enterGradeNameAr')}
                          className="w-full"
                          id="name"
                        />
                      )}
                    />
                  </FormField>

                  {/* Grade Name English */}
                  <FormField
                    label={t('grades.gradeNameEn')}
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
                          placeholder={t('grades.enterGradeNameEn')}
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
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder={t('grades.enterMaxStudents')}
                          className="w-full"
                          min="1"
                          id="maxStudents"
                        />
                      )}
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
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('common.save')}
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
