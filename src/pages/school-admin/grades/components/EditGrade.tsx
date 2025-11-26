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
import { EditGradeSchema, type EditGradeProps } from '@/validations/grades-validations';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';

export default function EditGrade() {
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
  const academicSystems: any[] = [];
  const isLoadingAcademicSystems = false;
  const educationalStages: any[] = [];
  const isLoadingEducationalStages = false;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(EditGradeSchema),
    defaultValues: {
      academicSystem: '',
      educationalStage: '',
      nameAr: '',
      nameEn: '',
      nicknameAr: '',
      nicknameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      maxStudents: 0,
    },
  });

  useEffect(() => {
    // TODO: Fetch grade data when Redux is ready
    // dispatch(getGradeById(gradeId))
    // For now, simulate loading
    setTimeout(() => {
      // Mock data - replace with actual data from Redux
      reset({
        academicSystem: 'system-id',
        educationalStage: 'stage-id',
        nameAr: 'الصف الثاني الإعدادي',
        nameEn: '2/ع',
        nicknameAr: 'الثاني الإعدادي',
        nicknameEn: '2nd Middle',
        descriptionAr: 'صف دراسي للمرحلة الإعدادية',
        descriptionEn: 'Middle school grade',
        maxStudents: 30,
      });
      setExistingFilePath('/path/to/image.jpg');
      setExistingFileName('class-image.jpg');
      setIsLoading(false);
    }, 500);
  }, [id, reset]);

  const onSubmit = (data: EditGradeProps) => {
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
      <div className="rounded-md border p-4">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xl font-bold text-gray-700">{t('academicSystem.title')}</div>
          <div className="flex items-center gap-3">
            <button>
              <img src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Academic System and Educational Stage Selectors */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Academic System */}
            <FormField
              label={t('grades.academicSystem')}
              required
              error={errors.academicSystem?.message}
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

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Grade Name Arabic */}
              <FormField label={t('grades.gradeNameAr')} required error={errors.nameAr?.message}>
                <Controller
                  name="nameAr"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('grades.enterGradeNameAr')}
                      className="w-full"
                    />
                  )}
                />
              </FormField>

              {/* Grade Name English */}
              <FormField label={t('grades.gradeNameEn')} required error={errors.nameEn?.message}>
                <Controller
                  name="nameEn"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('grades.enterGradeNameEn')}
                      className="w-full"
                    />
                  )}
                />
              </FormField>

              {/* Nickname Arabic */}
              <FormField label={t('grades.nicknameAr')} optional error={errors.nicknameAr?.message}>
                <Controller
                  name="nicknameAr"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('grades.enterNicknameAr')}
                      className="w-full"
                    />
                  )}
                />
              </FormField>

              {/* Nickname English */}
              <FormField label={t('grades.nicknameEn')} optional error={errors.nicknameEn?.message}>
                <Controller
                  name="nicknameEn"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('grades.enterNicknameEn')}
                      className="w-full"
                    />
                  )}
                />
              </FormField>

              {/* Description Arabic */}
              <FormField
                label={t('grades.descriptionAr')}
                optional
                error={errors.descriptionAr?.message}
              >
                <Controller
                  name="descriptionAr"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('grades.enterDescriptionAr')}
                      className="w-full"
                    />
                  )}
                />
              </FormField>

              {/* Description English */}
              <FormField
                label={t('grades.descriptionEn')}
                optional
                error={errors.descriptionEn?.message}
              >
                <Controller
                  name="descriptionEn"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('grades.enterDescriptionEn')}
                      className="w-full"
                    />
                  )}
                />
              </FormField>

              {/* Max Students */}
              <FormField
                label={t('grades.maxStudents')}
                required
                error={errors.maxStudents?.message}
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
                    />
                  )}
                />
              </FormField>

              {/* Class Image */}
              <FormField label={t('grades.classImage')} optional>
                {existingFilePath && existingFileName && getFileName().length === 0 && (
                  <ExistingFileDisplay filePath={existingFilePath} fileName={existingFileName} />
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

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/educational-stages/grades')}
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
        navigateAfterClose={
          showPopupMessage.type === 'success' ? '/educational-stages/grades' : undefined
        }
      />
    </Card>
  );
}
