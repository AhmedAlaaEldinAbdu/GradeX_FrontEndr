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
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  AcademicSystemSchema,
  type AcademicSystemProps,
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

export default function EditAcademicSystem() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const academicSystem = useAppSelector((state) => {
    return state.academicSystems.academicSystemDetails;
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
    formState: { errors },
  } = useForm<AcademicSystemProps>({
    resolver: yupResolver(AcademicSystemSchema),
    defaultValues: {
      academicSystems: [{ name: '', subSystemIds: [], countryIds: [] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'academicSystems',
  });

  // Fetch lookups data only once on mount
  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAcademicSubSystems());
  }, [dispatch]);

  // Fetch academic system details only when ID changes
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

  // Populate form only when data is loaded
  useEffect(() => {
    if (academicSystem && !isLoadingData) {
      reset({
        academicSystems: [
          {
            name: academicSystem.name || '',
            subSystemIds: academicSystem.academicSubSystemDto?.map((sub) => sub.id) || [],
            countryIds: academicSystem.lkCountriesDto?.map((country) => country.id) || [],
          },
        ],
      });
    }
  }, [academicSystem, isLoadingData, reset]);

  const onSubmit = (data: AcademicSystemProps) => {
    if (!id) return;

    const system = data.academicSystems[0];
    const payload: UpdateAcademicSystemRequest = {
      id,
      name: system.name,
      subSystemIds: (system.subSystemIds || []).filter(Boolean) as string[],
      countryIds: (system.countryIds || []).filter(Boolean) as string[],
    };

    dispatch(editAcademicSystem(payload))
      .unwrap()
      .then((res) => {
        if (res.isSuccess) {
          setShowPopupMessage(true);
        }
      })
      .catch((err) => {
        console.error('Error updating academic system:', err);
      });
  };

  const handleAddAcademicSystem = () => {
    append({ name: '', subSystemIds: [], countryIds: [] });
  };

  const handleDeleteAcademicSystem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card>
      <div className="rounded-md border p-4">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xl font-bold text-gray-700">{t('academicSystem.title')}</div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleAddAcademicSystem}>
              <img src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
            </button>
          </div>
        </div>

        {isLoadingData ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate={true} className="flex flex-col gap-8">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-6 rounded-md border p-4">
                <div className="flex">
                  <div className="flex-grow">
                    <FormField
                      label={t('academicSystem.title')}
                      required
                      error={
                        errors.academicSystems?.[index]?.name?.message &&
                        t(errors.academicSystems[index].name.message)
                      }
                    >
                      <Controller
                        name={`academicSystems.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={t('academicSystem.enterAcademicSystem')}
                            required
                          />
                        )}
                      />
                    </FormField>
                  </div>
                  <div>
                    {fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteAcademicSystem(index)}
                        className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                      >
                        <img src={TrashIcon} alt="Trash" className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="h-8 w-8"></div>
                    )}
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-grow">
                    <FormField
                      label={t('academicSystem.systemType')}
                      optional
                      error={
                        errors.academicSystems?.[index]?.subSystemIds?.message &&
                        t(errors.academicSystems[index]?.subSystemIds.message)
                      }
                    >
                      <Controller
                        name={`academicSystems.${index}.subSystemIds`}
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
                            error={!!errors.academicSystems?.[index]?.subSystemIds}
                          />
                        )}
                      />
                    </FormField>
                  </div>
                  <div>
                    <button
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
                              label:
                                currentLang === 'ar' ? country.arabicName : country.englishName,
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
                className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
              >
                {t('common.edit')}
              </button>
            </div>
          </form>
        )}

        {/* Popups */}
        {showPopupMessage && (
          <PopupMessage
            type="success"
            message="academicSystem.systemEditedSuccessfully"
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
