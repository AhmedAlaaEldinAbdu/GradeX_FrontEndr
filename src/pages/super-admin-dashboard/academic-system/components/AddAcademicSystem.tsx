import { useTranslation } from 'react-i18next';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
import Card from '@/shared/components/Card';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import { useState } from 'react';
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

export default function AddAcademicSystem() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [numOfAcademic, setNumOfAcademic] = useState<number[]>([1]);
  const [showPopupMessage, setShowPopupMessage] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AcademicSystemProps>({
    resolver: yupResolver(AcademicSystemSchema),
    defaultValues: {
      academicSystems: [{ academicSystemName: '', systemType: [], countryName: [] }],
    },
  });

  const onSubmit = async (data: any) => {
    console.log(data);
    setShowPopupMessage(true);
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
                      <button className="h-8 w-8"></button>
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
                          { value: 'government', label: 'حكومي' },
                          { value: 'private', label: 'خاص' },
                          { value: 'national', label: 'أهلي' },
                          { value: 'usa', label: 'أمريكي' },
                          { value: 'global', label: 'دولي' },
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
                      errors.academicSystems?.[index]?.countryName?.message &&
                      t(errors.academicSystems[index].countryName.message)
                    }
                  >
                    <Controller
                      // name="countryName"
                      name={`academicSystems.${index}.countryName`}
                      control={control}
                      render={({ field }) => {
                        const countryNameOptions: MultiSelectOption[] = [
                          { value: 'egypt', label: 'مصر' },
                          { value: 'ksa', label: 'السعودية' },
                          { value: 'uae', label: 'الإمارات' },
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
                            options={countryNameOptions}
                            placeholder={t('academicSystem.selectSystemCountry')}
                            error={!!errors.academicSystems?.[index]?.countryName}
                          />
                        );
                      }}
                    />
                  </FormField>
                </div>
                <div>
                  <button className="h-8 w-8"></button>
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
