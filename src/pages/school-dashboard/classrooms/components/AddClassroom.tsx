import { useTranslation } from 'react-i18next';
import IconButton from '@/shared/components/IconButton';
import Card from '@/shared/components/Card';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import PopupMessage from '@/shared/popups/PopupMessage';
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
import { createClassroom } from '@/redux/features/classrooms/classroomsSlice';
import { getAcademicSystems } from '@/redux/features/academic-system/academicSystemSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import CustomImage from '@/shared/components/CustomImage';

export default function AddClassroom() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [numOfClassrooms, setNumOfClassrooms] = useState<number[]>([1]);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: File | null }>({});
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Redux state
  const academicSystems = useAppSelector((state) => state.academicSystems.academicSystems);
  const isLoadingAcademicSystems = useAppSelector((state) => state.academicSystems.isLoading);
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const isLoadingEducationalStages = useAppSelector((state) => state.educationalStages.isLoading);
  const isCreating = useAppSelector((state) => state.classrooms.isCreating);

  useEffect(() => {
    dispatch(getAcademicSystems({ pageIndex: 1, pageSize: 10000 }));
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000 }));
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors },
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

  const onSubmit = async (data: ClassroomsProps) => {
    try {
      const formData = new FormData();

      // Create array of all DTOs
      const dtos = data.classrooms.map((classroom) => ({
        academicSystemId: data.academicSystem,
        gradeId: data.educationalStage,
        name: classroom.name,
        nameEn: classroom.nameEn,
        alias: classroom.alias || '',
        aliasEn: classroom.aliasEn || '',
        studentNumber: classroom.maxStudents,
        note: classroom.note || '',
        noteEn: classroom.noteEn || '',
      }));

      // Append DtosJson FIRST as a single JSON array string
      formData.append('DtosJson', JSON.stringify(dtos));

      // Append all image files AFTER as separate Images entries
      Object.values(uploadedFiles).forEach((file) => {
        if (file) {
          formData.append('Images', file);
        }
      });

      await dispatch(createClassroom(formData as any))
        .unwrap()
        .then((res) => {
          if (res.isSuccess) {
            setShowPopupMessage({
              show: true,
              type: 'success',
              message: t('grades.gradesAddedSuccessfully'),
            });
          } else {
            setShowPopupMessage({
              show: true,
              type: 'error',
              message: t('common.errorOccurred'),
            });
          }
        });
    } catch (error: any) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: error?.message || t('common.errorOccurred'),
      });
    }
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
                {numOfClassrooms.map((_, index) => (
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
                              render={({ field }) => {
                                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                  const val = e.target.value;

                                  if (/^[0-9]*$/.test(val)) {
                                    field.onChange(val);
                                  }
                                };

                                const handleKeyDown = (
                                  e: React.KeyboardEvent<HTMLInputElement>
                                ) => {
                                  if (
                                    !/[0-9]/.test(e.key) &&
                                    ![
                                      'Backspace',
                                      'Delete',
                                      'ArrowLeft',
                                      'ArrowRight',
                                      'Tab',
                                      'Control',
                                    ].includes(e.key)
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
                                    id={`classrooms.${index}.maxStudents`}
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
                          <IconButton
                            status="delete"
                            variant="danger"
                            onClick={() => handleDeleteClassroom(index)}
                            ariaLabel="Delete"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex w-10">
                <div className="w-full pt-1">
                  <button type="button" onClick={handleAddClassroom}>
                    <CustomImage src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
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
              disabled={isCreating}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? t('common.saving') : t('common.add')}
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
