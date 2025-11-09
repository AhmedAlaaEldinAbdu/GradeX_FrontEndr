import { useTranslation } from 'react-i18next';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import Card from '@/shared/components/Card';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import PopupMessage from '@/shared/components/PopupMessage';
import MultiSelectTagInput from '@/shared/components/MultiSelectTagInput';
import FormField from '@/shared/components/FormField';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  EducationalStagesSchema,
  type EducationalStagesProps,
} from '@/validations/academic-system-validations';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import { addEducationalStage } from '@/redux/features/educational-stages/educationalStagesSlice';
import type { CreateEducationalStageRequest } from '@/services/api/types/educational-stages.types';

export default function AddEducationalStages() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [numOfStages, setNumOfStages] = useState<number[]>([1]);
  const [showPopupMessage, setShowPopupMessage] = useState(false);

  const academicSubSystems = useAppSelector((state) => state.academicSubSystems.academicSubSystems);
  const isLoadingSubSystems = useAppSelector((state) => state.academicSubSystems.isLoading);

  useEffect(() => {
    dispatch(getAcademicSubSystems({ pageIndex: 1, pageSize: 1000 }));
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EducationalStagesProps>({
    resolver: yupResolver(EducationalStagesSchema),
    defaultValues: {
      educationalStages: [{ nameAr: '', nameEn: '', academicSystem: [] }],
    },
  });

  const onSubmit = (data: EducationalStagesProps) => {
    const payload: CreateEducationalStageRequest[] = data?.educationalStages?.map(
      (educational) => ({
        nameAr: educational.nameAr,
        nameEn: educational.nameEn,
        age: 3,
        academicSubSystemId: Array.isArray(educational.academicSystem)
          ? (educational.academicSystem[0] ?? '')
          : '',
      })
    );

    dispatch(addEducationalStage(payload))
      .unwrap()
      .then((res) => {
        if (res.isSuccess) {
          setShowPopupMessage(true);
          navigate(-1);
        }
      })
      .catch((err) => {
        console.error('Error creating Educational stage:', err);
      });
  };

  const handleAddEducationalStages = () => {
    setNumOfStages((prev) => [...prev, prev.length + 1]);
  };

  const handleDeleteEducationalStage = (selectedIdx: number) => {
    setNumOfStages((prev) => prev.filter((_, i) => i !== selectedIdx));
  };

  return (
    <Card>
      <div className="rounded-md border p-4">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xl font-bold text-gray-700">
            {t('academicSystem.educationalStages')}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleAddEducationalStages()}>
              <img src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate={true} className="flex flex-col gap-8">
          {numOfStages.map((_, index) => (
            <div className="grid grid-cols-1 gap-6 rounded-md border p-4">
              <div className="flex">
                <div className="flex flex-grow flex-col gap-5 md:flex-row">
                  <div className="flex-grow">
                    <FormField
                      label={t('academicSystem.academicSystemAr')}
                      required
                      error={
                        errors.educationalStages?.[index]?.nameAr?.message &&
                        t(errors.educationalStages?.[index]?.nameAr.message)
                      }
                    >
                      <Controller
                        name={`educationalStages.${index}.nameAr`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={t('academicSystem.enterAcademicSystemAr')}
                            required
                          />
                        )}
                      />
                    </FormField>
                  </div>
                  <div className="flex-grow">
                    <FormField
                      label={t('academicSystem.academicSystemEn')}
                      required
                      error={
                        errors.educationalStages?.[index]?.nameEn?.message &&
                        t(errors.educationalStages?.[index]?.nameEn.message)
                      }
                    >
                      <Controller
                        name={`educationalStages.${index}.nameEn`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={t('academicSystem.enterAcademicSystemEn')}
                            required
                          />
                        )}
                      />
                    </FormField>
                  </div>
                </div>
                <div>
                  {numOfStages?.length !== 1 ? (
                    <>
                      <button
                        onClick={() => handleDeleteEducationalStage(index)}
                        className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                      >
                        <img src={TrashIcon} alt="Trash" className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="h-8 w-8"></div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex">
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.academicSystemName')}
                    required
                    error={
                      errors.educationalStages?.[index]?.academicSystem?.message &&
                      t(errors.educationalStages[index]?.academicSystem.message)
                    }
                  >
                    <Controller
                      name={`educationalStages.${index}.academicSystem`}
                      control={control}
                      render={({ field }) => {
                        return (
                          <MultiSelectTagInput
                            value={
                              Array.isArray(field.value) ? field.value.join(',') : field.value || ''
                            }
                            onChange={(value) => {
                              const parsedValue = value.split(',').filter((v) => v.trim());
                              field.onChange(parsedValue);
                            }}
                            options={
                              Array.isArray(academicSubSystems)
                                ? academicSubSystems.map((s) => ({
                                    value: s.id,
                                    label: currentLang === 'ar' ? s.nameAr : s.nameEn,
                                  }))
                                : []
                            }
                            disabled={isLoadingSubSystems}
                            placeholder={
                              isLoadingSubSystems
                                ? t('common.loading')
                                : t('academicSystem.selectEducationSystem')
                            }
                            error={!!errors.educationalStages?.[index]?.academicSystem}
                          />
                        );
                      }}
                    />
                  </FormField>
                </div>
                <div>
                  <div className="h-8 w-8"></div>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border border-green-700 px-6 py-2 text-green-700 hover:bg-green-50"
              onClick={() => navigate(-1)}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
            >
              {isSubmitting ? t('common.loading') : t('common.add')}
            </button>
          </div>
        </form>

        {/* Popups */}
        {showPopupMessage && (
          <PopupMessage
            type="success"
            message="academicSystem.educationalStagesAddedSuccessfully"
            iconSrc={BigSuccessIcon}
            autoClose={true}
            duration={2000}
            onClose={() => setShowPopupMessage(false)}
            navigateAfterClose={-1}
          />
        )}
      </div>
    </Card>
  );
}
