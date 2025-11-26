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
import {
  EducationalStagesSchema,
  type EducationalStagesProps,
} from '@/validations/academic-system-validations';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import { addEducationalStage } from '@/redux/features/educational-stages/educationalStagesSlice';
import type { CreateEducationalStageRequest } from '@/services/api/types/educational-stages.types';
import CustomSelect from '@/shared/components/CustomSelect';
import { Button } from '@/shared/components/components';

export default function AddEducationalStages() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [numOfStages, setNumOfStages] = useState<number[]>([1]);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const academicSubSystems = useAppSelector((state) => state.academicSubSystems.academicSubSystems);
  const isLoadingSubSystems = useAppSelector((state) => state.academicSubSystems.isLoading);
  const stagesErrors = useAppSelector((state) => state.educationalStages.validationErrors);

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
      educationalStages: [{ nameAr: '', nameEn: '', academicSystem: '' }],
    },
  });

  const onSubmit = (data: EducationalStagesProps) => {
    const payload: CreateEducationalStageRequest[] = data?.educationalStages?.map((educational) => {
      return {
        nameAr: educational.nameAr,
        nameEn: educational.nameEn,
        age: 0,
        academicSubSystemId: educational.academicSystem,
      } as CreateEducationalStageRequest;
    });

    dispatch(addEducationalStage(payload))
      .unwrap()
      .then((res) => {
        if (res.isSuccess) {
          setShowPopupMessage({
            show: true,
            type: 'success',
            message: t('academicSystem.educationalStagesAddedSuccessfully'),
          });
        } else {
          const firstError = stagesErrors?.[0];
          const errorMessage =
            typeof firstError === 'string' ? firstError : (firstError?.errorMessage ?? '');
          setShowPopupMessage({
            show: true,
            type: 'error',
            message: errorMessage || t('common.errorOccurred'),
          });
        }
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
            <div
              key={`add-stage-${index + 1}`}
              className="grid grid-cols-1 gap-6 rounded-md border p-4"
            >
              <div className="flex">
                <div className="flex flex-grow flex-col gap-5 md:flex-row">
                  <div className="flex-grow">
                    <FormField
                      label={t('academicSystem.educationalStageAr')}
                      required
                      htmlFor={`educationalStages.${index}.nameAr`}
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
                            placeholder={t('academicSystem.enterEducationalStageAr')}
                            required
                            id={`educationalStages.${index}.nameAr`}
                          />
                        )}
                      />
                    </FormField>
                  </div>
                  <div className="flex-grow">
                    <FormField
                      label={t('academicSystem.educationalStageEn')}
                      required
                      htmlFor={`educationalStages.${index}.nameEn`}
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
                            placeholder={t('academicSystem.enterEducationalStageEn')}
                            required
                            id={`educationalStages.${index}.nameEn`}
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
                    htmlFor={`educationalStages.${index}.academicSystem`}
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
                          <CustomSelect
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
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
                <div aria-hidden="true">
                  <div className="h-8 w-8"></div>
                </div>
              </div>
            </div>
          ))}

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

        {/* Popups */}
        <PopupMessage
          open={showPopupMessage.show}
          type={showPopupMessage.type}
          message={showPopupMessage.message}
          iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
          autoClose={true}
          onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
          navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
        />
      </div>
    </Card>
  );
}
