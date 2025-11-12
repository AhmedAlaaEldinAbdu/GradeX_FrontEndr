import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import PopupMessage from '@/shared/components/PopupMessage';
import MultiSelectTagInput from '@/shared/components/MultiSelectTagInput';
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

export default function EditEducationalStages() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const academicSubSystems = useAppSelector((state) => state.academicSubSystems.academicSubSystems);
  const isLoadingSubSystems = useAppSelector((state) => state.academicSubSystems.isLoading);
  const educationalStageDetails = useAppSelector(
    (state) => state.educationalStages.educationalStageDetails
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditEducationalStagesProps>({
    resolver: yupResolver(EditEducationalStagesSchema),
    defaultValues: {
      nameAr: '',
      nameEn: '',
      academicSystem: [],
    },
  });

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
        academicSystem: [
          educationalStageDetails.academicSubSystemId ||
            (educationalStageDetails as any).academicSubSystemGradeId ||
            '',
        ],
      });
    }
  }, [educationalStageDetails, isLoadingData, reset]);

  const onSubmit = async (data: EditEducationalStagesProps) => {
    if (!id) return;
    try {
      // const gradeId = Array.isArray(data.academicSystem) ? (data.academicSystem[0] ?? '') : '';
      
      const payload: UpdateEducationalStageRequest = {
        id,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        age: 3,
        academicSubSystemId: (data.academicSystem || []).filter(Boolean) as string[],
      };
      const res = await dispatch(editEducationalStage(payload)).unwrap();
      if (res.isSuccess) setShowPopupMessage(true);
    } catch (e) {}
  };

  return (
    <Card>
      <div className="rounded-md border p-4">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xl font-bold text-gray-700">
            {t('academicSystem.educationalStage')}
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate={true} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-6 rounded-md border p-4">
            <div className="flex">
              <div className="flex flex-grow flex-col gap-5 md:flex-row">
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.educationalStageAr')}
                    required
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
                        />
                      )}
                    />
                  </FormField>
                </div>
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.educationalStageEn')}
                    required
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
                  error={errors.academicSystem?.message && t(errors.academicSystem.message)}
                >
                  <Controller
                    name={`academicSystem`}
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
                          error={!!errors.academicSystem}
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
              className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800 disabled:opacity-70"
            >
              {isSubmitting ? t('common.loading') : t('common.edit')}
            </button>
          </div>
        </form>

        {/* Popups */}
        {showPopupMessage && (
          <PopupMessage
            type="success"
            message="academicSystem.educationalStageEditedSuccessfully"
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
