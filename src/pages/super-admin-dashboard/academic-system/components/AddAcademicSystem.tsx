import { useTranslation } from 'react-i18next';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
import Card from '@/shared/components/Card';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import PopupMessage from '@/shared/components/PopupMessage';
import type { MultiSelectOption } from '@/shared/components/MultiSelectTagInput';
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
import type { ApiResponseModel } from '@/services/api';

export default function AddAcademicSystem() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [numOfAcademic, setNumOfAcademic] = useState<number[]>([1]);
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const countries = useAppSelector((state) => {
    return state.lookups.countries;
  });
  const isLoadingCountries = useAppSelector((state) => {
    return state.lookups.isLoadingCountries;
  });

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AcademicSystemProps>({
    resolver: yupResolver(AcademicSystemSchema),
    defaultValues: {
      academicSystems: [{ academicSystemName: '', systemType: [], countryId: [] }],
    },
  });

  const onSubmit = (data: AcademicSystemProps) => {
    // const payload: CreateAcademicSystem[] = data?.academicSystems?.map((system) => ({
    //   type: 1,
    //   // name: system.academicSystemName,
    //  // subSystemIds: (system.systemType || []).filter(Boolean) as string[],
    //   subSystemIds: (['2a0596c8-eef8-44a5-7313-08de15741f1b'])?.filter(Boolean) as string[],
    //   countryIds: (system.countryId || [])?.filter(Boolean) as string[],
    // }));

    const system = data.academicSystems[0];
    const payload: CreateAcademicSystem = {
      type: 1,
      // name: system.academicSystemName,
      subSystemIds: (['2a0596c8-eef8-44a5-7313-08de15741f1b'])?.filter(Boolean) as string[],
      countryIds: (system.countryId || []).filter(Boolean) as string[],
    };

    dispatch(addAcademicSystem(payload))
      .unwrap()
      .then((res) => {
        if (res.isSuccess) {
          setShowPopupMessage(true);
        }
      })
      .catch((err) => {
        console.error('Error creating academic system:', err);
      });
  };

  const handleAddAcademicSystem = () => {
    setNumOfAcademic((prev) => [...prev, prev.length + 1]);
  };

  const handleDeleteAcademicSystem = (selectedIdx: number) => {
    setNumOfAcademic((prev) => prev.filter((_, i) => i !== selectedIdx));
  };

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
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.title')}
                    required
                    error={
                      errors.academicSystems?.[index]?.academicSystemName?.message &&
                      t(errors.academicSystems[index].academicSystemName.message)
                    }
                  >
                    <Controller
                      name={`academicSystems.${index}.academicSystemName`}
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
                      <div className="h-8 w-8"></div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex">
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.systemType')}
                    optional
                    error={
                      errors.academicSystems?.[index]?.systemType?.message &&
                      t(errors.academicSystems[index].systemType.message)
                    }
                  >
                    <Controller
                      name={`academicSystems.${index}.systemType`}
                      control={control}
                      render={({ field }) => {
                        const systemTypeOptions: MultiSelectOption[] = [
                          { value: '1', label: 'national' },
                          { value: '2', label: 'international' },
                        ];

                        return (
                          <MultiSelectTagInput
                            value={
                              Array.isArray(field.value) ? field.value.join(',') : field.value || ''
                            }
                            onChange={(value) => {
                              const parsedValue = value.split(',').filter((v) => v.trim());
                              field.onChange(parsedValue);
                            }}
                            options={systemTypeOptions}
                            placeholder={t('academicSystem.selectItem')}
                            error={!!errors.academicSystems?.[index]?.systemType}
                          />
                        );
                      }}
                    />
                  </FormField>
                </div>
                <div>
                  <button
                    // onClick={() => setNewSystemType(true)}
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
                      errors.academicSystems?.[index]?.countryId?.message &&
                      t(errors.academicSystems[index].countryId.message)
                    }
                  >
                    <Controller
                      name={`academicSystems.${index}.countryId`}
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
                          error={!!errors.academicSystems?.[index]?.systemType}
                          disabled={isLoadingCountries}
                          placeholder={
                            isLoadingCountries
                              ? t('common.loading')
                              : t('academicSystem.selectItem')
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
              {t('common.add')}
            </button>
          </div>
        </form>

        {/* Popups */}
        {showPopupMessage && (
          <PopupMessage
            type="success"
            message="academicSystem.systemAddedSuccessfully"
            iconSrc={BigSuccessIcon}
            autoClose={true}
            onClose={() => setShowPopupMessage(false)}
          />
        )}
      </div>
    </Card>
  );
}
