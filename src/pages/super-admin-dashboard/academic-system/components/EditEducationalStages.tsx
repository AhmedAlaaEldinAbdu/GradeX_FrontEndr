import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import PopupMessage from '@/shared/popups/PopupMessage';
import FormField from '@/shared/components/FormField';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  EditEducationalStagesSchema,
  type EditEducationalStagesProps,
} from '@/validations/academic-system-validations';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  getEducationalStageBySubsystemId,
  editEducationalStage,
} from '@/redux/features/educational-stages/educationalStagesSlice';
import { getAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import type { UpdateEducationalStageRequest } from '@/services/api/types/educational-stages.types';
import CustomSelect from '@/shared/components/CustomSelect';
import { Button } from '@/shared/components/components';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';

export default function EditEducationalStages() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const academicSubSystems = useAppSelector((state) => state.academicSubSystems.academicSubSystems);
  const isLoadingSubSystems = useAppSelector((state) => state.academicSubSystems.isLoading);
  const educationalStageDetails = useAppSelector(
    (state) => state.educationalStages.educationalStageDetails
  );
  const stagesErrors = useAppSelector((state) => state.educationalStages.validationErrors);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditEducationalStagesProps>({
    resolver: yupResolver(EditEducationalStagesSchema),
    defaultValues: {
      nameAr: '',
      nameEn: '',
      academicSystem: '',
    },
  });

  const scrollToFirstError = useScrollToFirstError<EditEducationalStagesProps>();

  const isEditing = useAppSelector((state) => state.educationalStages.isUpdating);

  useEffect(() => {
    dispatch(getAcademicSubSystems({ pageIndex: 1, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      dispatch(getEducationalStageBySubsystemId(id))
        .unwrap()
        .then(() => setIsLoadingData(false))
        .catch(() => setIsLoadingData(false));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (educationalStageDetails && !isLoadingData) {
      reset({
        nameAr: educationalStageDetails.nameAr,
        nameEn: educationalStageDetails.nameEn,
        academicSystem:
          educationalStageDetails.academicSubSystemId ||
          (educationalStageDetails as any).academicSubSystemGradeId ||
          '',
      });
    }
  }, [educationalStageDetails, isLoadingData, reset]);

  const onSubmit = (data: EditEducationalStagesProps) => {
    if (!id) return;

    const payload: UpdateEducationalStageRequest = {
      id,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      age: educationalStageDetails?.age,
      academicSubSystemId: data.academicSystem,
    };
    dispatch(editEducationalStage(payload))
      .unwrap()
      .then((res) => {
        if (res.isSuccess) {
          setShowPopupMessage({
            show: true,
            type: 'success',
            message: t('academicSystem.educationalStageEditedSuccessfully'),
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

  return (
    <Card>
      <div className="rounded-md border p-4">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xl font-bold text-gray-700">
            {t('academicSystem.educationalStage')}
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)} noValidate={true} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-6 rounded-md border p-4">
            <div className="flex">
              <div className="flex flex-grow flex-col gap-5 md:flex-row">
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.educationalStageAr')}
                    required
                    htmlFor={`nameAr`}
                    error={errors.nameAr?.message && t(errors.nameAr.message)}
                  >
                    <Controller
                      name={`nameAr`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t('academicSystem.enterEducationalStageAr')}
                          required
                          id={`nameAr`}
                        />
                      )}
                    />
                  </FormField>
                </div>
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.educationalStageEn')}
                    required
                    htmlFor={`nameEn`}
                    error={errors.nameEn?.message && t(errors.nameEn.message)}
                  >
                    <Controller
                      name={`nameEn`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t('academicSystem.enterEducationalStageEn')}
                          required
                          id={`nameEn`}
                        />
                      )}
                    />
                  </FormField>
                </div>
              </div>
              <div>
                <div className="h-8 w-8"></div>
              </div>
            </div>

            <div className="flex">
              <div className="flex-grow">
                <FormField
                  label={t('academicSystem.academicSystemName')}
                  required
                  htmlFor={`academicSystem`}
                  error={errors.academicSystem?.message && t(errors.academicSystem.message)}
                >
                  <Controller
                    name={`academicSystem`}
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
                          error={!!errors.academicSystem}
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

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isEditing}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isEditing}>
              {isEditing ? t('common.saving') : t('common.edit')}
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
