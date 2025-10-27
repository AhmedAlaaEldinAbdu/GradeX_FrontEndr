import { useTranslation } from 'react-i18next';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
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
  EducationalStagesSchema,
  type EducationalStagesProps,
} from '@/validations/academic-system-validations';
import { useNavigate } from 'react-router-dom';

export default function EditEducationalStages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [numOfStages, setNumOfStages] = useState<number[]>([1, 2]);
  const [showPopupMessage, setShowPopupMessage] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EducationalStagesProps>({
    resolver: yupResolver(EducationalStagesSchema),
    defaultValues: {
      educationalStages: [{ educationalStagesSystemName: '', academicSystem: [] }],
    },
  });

  const onSubmit = async (data: any) => {
    console.log(data);
    setShowPopupMessage(true);
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
                <div className="flex-grow">
                  <FormField
                    label={t('academicSystem.title')}
                    required
                    error={
                      errors.educationalStages?.[index]?.educationalStagesSystemName?.message &&
                      t(errors.educationalStages?.[index]?.educationalStagesSystemName.message)
                    }
                  >
                    <Controller
                      name={`educationalStages.${index}.educationalStagesSystemName`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t('academicSystem.enterEducationalStage')}
                          required
                        />
                      )}
                    />
                  </FormField>
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
                        const academicSystemOptions: MultiSelectOption[] = [
                          { value: 'glo', label: 'عالمي' },
                          { value: 'private', label: 'خاص' },
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
                            options={academicSystemOptions}
                            placeholder={t('academicSystem.selectEducationSystem')}
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
              className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
            >
              {t('common.edit')}
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
            onClose={() => setShowPopupMessage(false)}
          />
        )}
      </div>
    </Card>
  );
}
