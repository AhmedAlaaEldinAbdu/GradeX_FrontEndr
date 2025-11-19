import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import PopupMessage from '@/shared/components/PopupMessage';
import MultiSelectTagInput from '@/shared/components/MultiSelectTagInput';
import FormField from '@/shared/components/FormField';
import { Controller, useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  EditAcademicSystemSchema,
  type EditAcademicSystemProps,
} from '@/validations/academic-system-validations';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchCountries } from '@/redux/features/lookups';
import type { UpdateAcademicSystemRequest } from '@/services/api/types/academic-system.types';
import {
  editAcademicSystem,
  getAcademicSystemById,
} from '@/redux/features/academic-system/academicSystemSlice';
import { getAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import AddSystemTypePopup from '../popups/AddSystemTypePopup';

export default function EditAcademicSystem() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [showAddSystemTypePopup, setShowAddSystemTypePopup] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const [isLoadingData, setIsLoadingData] = useState(true);

  const academicSystem = useAppSelector((state) => {
    return state.academicSystems.academicSystemDetails;
  });
  const academicErrors = useAppSelector((state) => {
    return state.academicSystems.validationErrors;
  });
  const countries = useAppSelector((state) => {
    return state.lookups.countries;
  });
  const isLoadingCountries = useAppSelector((state) => {
    return state.lookups.isLoadingCountries;
  });
  const academicSubSystems = useAppSelector((state) => {
    return state.academicSubSystems.academicSubSystems;
  });
  const isLoadingSubSystems = useAppSelector((state) => {
    return state.academicSubSystems.isLoading;
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditAcademicSystemProps>({
    resolver: yupResolver(EditAcademicSystemSchema) as Resolver<EditAcademicSystemProps>,
    defaultValues: {
      nameAr: '',
      nameEn: '',
      subSystemIds: [],
      countryIds: [],
    },
  });

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAcademicSubSystems({ pageIndex: 1, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      dispatch(getAcademicSystemById(id))
        .unwrap()
        .then(() => {
          setIsLoadingData(false);
        })
        .catch(() => {
          setIsLoadingData(false);
        });
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (academicSystem && !isLoadingData) {
      reset({
        nameAr: (academicSystem as any).nameAr ?? academicSystem.nameAr ?? '',
        nameEn: (academicSystem as any).nameEn ?? academicSystem.nameEn ?? '',
        subSystemIds: academicSystem.academicSubSystemDto?.map((sub) => sub.id) || [],
        countryIds: academicSystem.lkCountriesDto?.map((country) => country.id) || [],
      });
    }
  }, [academicSystem, isLoadingData, reset]);

  const onSubmit: SubmitHandler<EditAcademicSystemProps> = (data) => {
    if (!id) return;
    const payload: UpdateAcademicSystemRequest = {
      id,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      subSystemIds: (data.subSystemIds || []).filter(Boolean) as string[],
      countryIds: (data.countryIds || []).filter(Boolean) as string[],
    };

    dispatch(editAcademicSystem(payload))
      .unwrap()
      .then((res) => {
        if (res.isSuccess) {
          setShowPopupMessage({
            show: true,
            type: 'success',
            message: t('academicSystem.systemEditedSuccessfully'),
          });
        } else {
          const firstError = academicErrors?.[0];
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
          <div className="text-xl font-bold text-gray-700">{t('academicSystem.title')}</div>
        </div>

        {isLoadingData ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate={true} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-6 rounded-md border p-4">
              <div className="flex">
                <div className="flex flex-grow flex-col gap-5 md:flex-row">
                  <div className="flex-grow">
                    <FormField
                      label={t('academicSystem.academicSystemAr')}
                      htmlFor="nameAr"
                      required
                      error={errors.nameAr?.message && t(errors.nameAr.message)}
                    >
                      <Controller
                        name={`nameAr`}
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
                      htmlFor="nameEn"
                      error={errors.nameEn?.message && t(errors.nameEn.message)}
                    >
                      <Controller
                        name={`nameEn`}
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
                  <div className="h-8 w-8"></div>
                </div>
              </div>

              <div className="flex">
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.systemType')}
                    required
                    htmlFor="subSystemIds"
                    error={errors.subSystemIds?.message && t(errors.subSystemIds.message)}
                  >
                    <Controller
                      name={`subSystemIds`}
                      control={control}
                      render={({ field }) => (
                        <MultiSelectTagInput
                          value={
                            Array.isArray(field.value) ? field.value.join(',') : field.value || ''
                          }
                          onChange={(value) => {
                            const parsedValue = value.split(',').filter((v) => v.trim());
                            field.onChange(parsedValue);
                          }}
                          options={academicSubSystems?.map((subSystem) => ({
                            value: subSystem.id,
                            label: currentLang === 'ar' ? subSystem.nameAr : subSystem.nameEn,
                          }))}
                          disabled={isLoadingSubSystems}
                          placeholder={
                            isLoadingSubSystems
                              ? t('common.loading')
                              : t('academicSystem.selectItem')
                          }
                          error={!!errors.subSystemIds}
                        />
                      )}
                    />
                  </FormField>
                </div>
                <div>
                  <button
                    onClick={() => setShowAddSystemTypePopup(true)}
                    type="button"
                    className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
                  >
                    <img src={GreenPlusCircleIcon} alt="Plus" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex">
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.countryName')}
                    required
                    htmlFor="countryIds"
                    error={errors.countryIds?.message && t(errors.countryIds.message)}
                  >
                    <Controller
                      name={`countryIds`}
                      control={control}
                      render={({ field }) => (
                        <MultiSelectTagInput
                          value={
                            Array.isArray(field.value) ? field.value.join(',') : field.value || ''
                          }
                          onChange={(value) => {
                            const parsedValue = value.split(',').filter((v) => v.trim());
                            field.onChange(parsedValue);
                          }}
                          options={countries?.map((country) => ({
                            value: country.id,
                            label: currentLang === 'ar' ? country.arabicName : country.englishName,
                          }))}
                          error={!!errors.countryIds}
                          disabled={isLoadingCountries}
                          placeholder={
                            isLoadingCountries
                              ? t('common.loading')
                              : t('academicSystem.selectSystemCountry')
                          }
                        />
                      )}
                    />
                  </FormField>
                </div>
                <div aria-hidden="true">
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
                className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
              >
                {isSubmitting ? t('common.loading') : t('common.edit')}
              </button>
            </div>
          </form>
        )}

        {/* Popups */}
        {showAddSystemTypePopup && (
          <AddSystemTypePopup onCancel={() => setShowAddSystemTypePopup(false)} />
        )}
        <PopupMessage
          open={showPopupMessage.show}
          type={showPopupMessage.type}
          message={showPopupMessage.message}
          iconSrc={BigSuccessIcon}
          autoClose={true}
          onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
          navigateAfterClose={-1}
        />
      </div>
    </Card>
  );
}
