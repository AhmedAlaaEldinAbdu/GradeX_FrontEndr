import { useTranslation } from 'react-i18next';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import Card from '@/shared/components/Card';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import PopupMessage from '@/shared/components/PopupMessage';
import FormField from '@/shared/components/FormField';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import FileUpload from '@/shared/components/FileUpload';
import { ClassroomsSchema, type ClassroomsProps } from '@/validations/classrooms-validations';

export default function AddClassroom() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [numOfClassrooms, setNumOfClassrooms] = useState<number[]>([1]);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: File | null }>({});
  const [selectedAcademicSystem, setSelectedAcademicSystem] = useState('');
  const [selectedEducationalStage, setSelectedEducationalStage] = useState('');
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
  } = useForm({
    resolver: yupResolver(ClassroomsSchema),
    defaultValues: {
      academicSystem: '',
      educationalStage: '',
      classrooms: [
        {
          name: '',
          nameEn: '',
          alias: '',
          aliasEn: '',
          note: '',
          noteEn: '',
          maxStudents: 0,
        },
      ],
    },
  });

  const onSubmit = (data: ClassroomsProps) => {
    // TODO: Implement submit when Redux is ready
    console.log('Form data:', data);
    setShowPopupMessage({
      show: true,
      type: 'success',
      message: t('grades.gradesAddedSuccessfully'),
    });
  };

  const handleAddClassroom = () => {
    setNumOfClassrooms((prev) => [...prev, prev.length + 1]);
  };

  const handleDeleteClassroom = (selectedIdx: number) => {
    if (numOfClassrooms.length === 1) return;
    setNumOfClassrooms((prev) => prev.filter((_, i) => i !== selectedIdx));
    // Remove uploaded file for this index
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[selectedIdx];
      return newFiles;
    });
  };

  const handleFileUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [index]: file }));
      setValue(`classrooms.${index}.classImage`, file);
    }
  };

  const handleFileDelete = (index: number) => () => {
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    setValue(`classrooms.${index}.classImage`, undefined);
  };

  const getFileName = (index: number): string[] => {
    const file = uploadedFiles[index];
    return file ? [file.name] : [];
  };

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
                    onChange={(value) => {
                      const val = Array.isArray(value) ? value[0] : value;
                      field.onChange(val);
                      setSelectedAcademicSystem(val);
                    }}
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
                    onChange={(value) => {
                      const val = Array.isArray(value) ? value[0] : value;
                      field.onChange(val);
                      setSelectedEducationalStage(val);
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
            <div className="flex flex-col-reverse items-end gap-1 md:flex-row md:items-start">
              <div className="flex-grow space-y-6">
                {numOfClassrooms.map((num, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col-reverse items-end gap-1 md:flex-row md:items-start">
                      <div className="flex flex-grow flex-col gap-4">
                        <div className="grid flex-grow grid-cols-1 gap-4 lg:grid-cols-2">
                          {/* Grade Name Arabic */}
                          <FormField
                            label={t('grades.gradeNameAr')}
                            required
                            error={errors.classrooms?.[index]?.name?.message}
                            htmlFor={`classrooms.${index}.name`}
                          >
                            <Controller
                              name={`classrooms.${index}.name`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder={t('grades.enterGradeNameAr')}
                                  className="w-full"
                                  id={`classrooms.${index}.name`}
                                />
                              )}
                            />
                          </FormField>

                          {/* Grade Name English */}
                          <FormField
                            label={t('grades.gradeNameEn')}
                            required
                            error={errors.classrooms?.[index]?.nameEn?.message}
                            htmlFor={`classrooms.${index}.nameEn`}
                          >
                            <Controller
                              name={`classrooms.${index}.nameEn`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder={t('grades.enterGradeNameEn')}
                                  className="w-full"
                                  id={`classrooms.${index}.nameEn`}
                                />
                              )}
                            />
                          </FormField>

                          {/* Nickname Arabic */}
                          <FormField
                            label={t('grades.nicknameAr')}
                            optional
                            error={errors.classrooms?.[index]?.alias?.message}
                            htmlFor={`classrooms.${index}.alias`}
                          >
                            <Controller
                              name={`classrooms.${index}.alias`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder={t('grades.enterNicknameAr')}
                                  className="w-full"
                                  id={`classrooms.${index}.alias`}
                                />
                              )}
                            />
                          </FormField>

                          {/* Nickname English */}
                          <FormField
                            label={t('grades.nicknameEn')}
                            optional
                            error={errors.classrooms?.[index]?.aliasEn?.message}
                            htmlFor={`classrooms.${index}.aliasEn`}
                          >
                            <Controller
                              name={`classrooms.${index}.aliasEn`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder={t('grades.enterNicknameEn')}
                                  className="w-full"
                                  id={`classrooms.${index}.aliasEn`}
                                />
                              )}
                            />
                          </FormField>

                          {/* Description Arabic */}
                          <FormField
                            label={t('grades.descriptionAr')}
                            optional
                            error={errors.classrooms?.[index]?.note?.message}
                            htmlFor={`classrooms.${index}.note`}
                          >
                            <Controller
                              name={`classrooms.${index}.note`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder={t('grades.enterDescriptionAr')}
                                  className="w-full"
                                  id={`classrooms.${index}.note`}
                                />
                              )}
                            />
                          </FormField>

                          {/* Description English */}
                          <FormField
                            label={t('grades.descriptionEn')}
                            optional
                            error={errors.classrooms?.[index]?.noteEn?.message}
                            htmlFor={`classrooms.${index}.noteEn`}
                          >
                            <Controller
                              name={`classrooms.${index}.noteEn`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder={t('grades.enterDescriptionEn')}
                                  className="w-full"
                                  id={`classrooms.${index}.noteEn`}
                                />
                              )}
                            />
                          </FormField>
                        </div>
                        <div className="grid flex-grow grid-cols-1 gap-4">
                          {/* Max Students */}
                          <FormField
                            label={t('grades.maxStudents')}
                            required
                            error={errors.classrooms?.[index]?.maxStudents?.message}
                            htmlFor={`classrooms.${index}.maxStudents`}
                          >
                            <Controller
                              name={`classrooms.${index}.maxStudents`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder={t('grades.enterMaxStudents')}
                                  className="w-full"
                                  min="1"
                                  id={`classrooms.${index}.maxStudents`}
                                />
                              )}
                            />
                          </FormField>

                          {/* Class Image */}
                          <FormField label={t('grades.classImage')} optional>
                            <FileUpload
                              label=""
                              accept=".jpg,.jpeg,.png,.gif,.svg"
                              onChange={handleFileUpload(index)}
                              onDelete={handleFileDelete(index)}
                              fileNames={getFileName(index)}
                              uploadText={t('grades.uploadClassImage')}
                              formatHints={['JPG', 'PNG', 'GIF', 'SVG']}
                            />
                          </FormField>
                        </div>
                      </div>
                      <div>
                        {numOfClassrooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteClassroom(index)}
                            className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                          >
                            <img src={TrashIcon} alt="Delete" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex w-10">
                <div className="w-full pt-1">
                  <button type="button" onClick={handleAddClassroom}>
                    <img src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
                  </button>
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
              {isSubmitting ? t('common.saving') : t('common.add')}
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
