import { useTranslation } from 'react-i18next';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
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
  AcademicSystemSchema,
  type AcademicSystemProps,
} from '@/validations/academic-system-validations';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchCountries } from '@/redux/features/lookups';
import { addAcademicSystem } from '@/redux/features/academic-system/academicSystemSlice';
import type { CreateAcademicSystem } from '@/services/api/types/academic-system.types';
import { getAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import AddSystemTypePopup from '../popups/AddSystemTypePopup';

export default function AddAcademicSystem() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [numOfAcademic, setNumOfAcademic] = useState<number[]>([1]);
  const [showAddSystemTypePopup, setShowAddSystemTypePopup] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

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

  const academicErrors = useAppSelector((state) => {
    return state.academicSystems.validationErrors;
  });

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAcademicSubSystems({ pageIndex: 1, pageSize: 1000 }));
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcademicSystemProps>({
    resolver: yupResolver(AcademicSystemSchema),
    defaultValues: {
      academicSystems: [{ nameAr: '', nameEn: '', subSystemIds: [], countryIds: [] }],
    },
  });

  const onSubmit = (data: AcademicSystemProps) => {
    const payload: CreateAcademicSystem[] = data?.academicSystems?.map((system) => ({
      nameAr: system.nameAr,
      nameEn: system.nameEn,
      subSystemIds: (system.subSystemIds || []).filter(Boolean) as string[],
      countryIds: (system.countryIds || []).filter(Boolean) as string[],
    }));

    dispatch(addAcademicSystem(payload))
      .unwrap()
      .then((res) => {
        if (res.isSuccess) {
          setShowPopupMessage({
            show: true,
            type: 'success',
            message: t('academicSystem.academicSystemAddedSuccessfully'),
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

  const handleAddAcademicSystem = () => {
    setNumOfAcademic((prev) => [...prev, prev.length + 1]);
  };

  const handleDeleteAcademicSystem = (selectedIdx: number) => {
    setNumOfAcademic((prev) => prev.filter((_, i) => i !== selectedIdx));
  };

  console.log('errors.academicSystems', errors.academicSystems);
  return (
    <Card>
      <div className="rounded-md border p-4">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xl font-bold text-gray-700">{t('academicSystem.title')}</div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleAddAcademicSystem()}>
              <img src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate={true} className="flex flex-col gap-8">
          {numOfAcademic.map((_, index) => (
            <div className="grid grid-cols-1 gap-6 rounded-md border p-4">
              <div className="flex">
                <div className="flex flex-grow flex-col gap-5 md:flex-row">
                  <div className="flex-grow">
                    <FormField
                      label={t('academicSystem.academicSystemAr')}
                      required
                      error={
                        errors.academicSystems?.[index]?.nameAr?.message &&
                        t(errors.academicSystems[index].nameAr.message)
                      }
                    >
                      <Controller
                        name={`academicSystems.${index}.nameAr`}
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
                        errors.academicSystems?.[index]?.nameEn?.message &&
                        t(errors.academicSystems[index].nameEn.message)
                      }
                    >
                      <Controller
                        name={`academicSystems.${index}.nameEn`}
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
                  {numOfAcademic?.length !== 1 ? (
                    <>
                      <button
                        onClick={() => handleDeleteAcademicSystem(index)}
                        className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                      >
                        <img src={TrashIcon} alt="Trash" className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div aria-hidden="true" className="h-8 w-8"></div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex">
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.systemType')}
                    required
                    error={
                      errors.academicSystems?.[index]?.subSystemIds?.message &&
                      t(errors.academicSystems[index]?.subSystemIds.message)
                    }
                  >
                    <Controller
                      name={`academicSystems.${index}.subSystemIds`}
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
                            error={!!errors.academicSystems?.[index]?.subSystemIds}
                          />
                        );
                      }}
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
                    error={
                      errors.academicSystems?.[index]?.countryIds?.message &&
                      t(errors.academicSystems[index].countryIds.message)
                    }
                  >
                    <Controller
                      name={`academicSystems.${index}.countryIds`}
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
                          error={!!errors.academicSystems?.[index]?.countryIds}
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
