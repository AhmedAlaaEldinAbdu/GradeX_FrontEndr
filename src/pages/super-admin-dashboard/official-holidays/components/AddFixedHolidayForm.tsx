import { useTranslation } from 'react-i18next';
import { Controller, useFieldArray } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useAppSelector } from '@/hooks/useRedux';
import type { Country } from '@/services/api/types/lookup.types';
import type { AddFixedHolidayProps } from '@/validations/official-holidays-validations';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import FileUpload from '@/shared/components/FileUpload';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import TrashIcon from '@/assets/icons/Trash.svg';
import GreenPlusIcon from '@/assets/icons/GreenPlus.svg';

interface AddFixedHolidayFormProps {
  control: UseFormReturn<AddFixedHolidayProps, any, AddFixedHolidayProps>;
  onSubmit: (data: AddFixedHolidayProps) => Promise<void>;
  onCancel: () => void;
  handleFileUpload: (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDelete: (index: number, fileName?: string) => () => void;
  getFileNames: (index: number) => string[];
  isSubmitting: boolean;
}

const AddFixedHolidayForm = ({
  control,
  onSubmit,
  onCancel,
  handleFileUpload,
  handleFileDelete,
  getFileNames,
  isSubmitting,
}: AddFixedHolidayFormProps) => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { countries, isLoadingCountries } = useAppSelector((state) => state.lookups);
  const { isCreating } = useAppSelector((state) => state.officialHolidays);

  const {
    handleSubmit,
    formState: { errors },
  } = control;

  const {
    fields: fixedFields,
    append: appendFixed,
    remove: removeFixed,
  } = useFieldArray({
    control: control.control,
    name: 'holidays',
  });

  const countryOptions = countries.map((country: Country) => ({
    value: country.id.toString(),
    label: i18n.language === 'ar' ? country.arabicName : country.englishName,
  }));

  const handleAddFixedHoliday = () => {
    appendFixed({
      day: '',
      country: '',
      reason: '',
    });
  };

  const handleDeleteFixedHoliday = (index: number) => {
    if (fixedFields.length > 1) {
      removeFixed(index);
      // Clear files for this index
      handleFileDelete(index)();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <div className="flex flex-wrap items-center justify-between">
          <div className="text-xl font-bold text-gray-700">
            {t('officialHolidays.fixedHolidays')}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleAddFixedHoliday}>
              <img src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {fixedFields.map((field, index) => (
          <Card key={field.id}>
            <div className="space-y-6">
              <div className="flex gap-1">
                <div className="w-full">
                  {/* Day */}
                  <FormField
                    label={t('officialHolidays.day')}
                    required
                    error={errors.holidays?.[index]?.day?.message}
                    htmlFor={`holidays.${index}.day`}
                  >
                    <Controller
                      name={`holidays.${index}.day`}
                      control={control.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('officialHolidays.selectDay')}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                          id={`holidays.${index}.day`}
                        />
                      )}
                    />
                  </FormField>
                </div>
                <div className="w-8">
                  {/* Delete Button (only show if more than 1 item) */}
                  {fixedFields.length > 1 && (
                    <div className="mb-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteFixedHoliday(index)}
                        className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                      >
                        <img src={TrashIcon} alt="Trash" className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-1">
                <div className="flex w-full flex-wrap gap-3">
                  <div className="flex-1">
                    {/* Country */}
                    <FormField
                      label={t('officialHolidays.country')}
                      required
                      error={errors.holidays?.[index]?.country?.message}
                      htmlFor={`holidays.${index}.country`}
                    >
                      <Controller
                        name={`holidays.${index}.country`}
                        control={control.control}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            options={countryOptions}
                            placeholder={t('officialHolidays.selectCountry')}
                            disabled={isLoadingCountries}
                            error={!!errors.holidays?.[index]?.country?.message}
                            id={`holidays.${index}.country`}
                          />
                        )}
                      />
                    </FormField>
                  </div>
                  <div className="flex-1">
                    {/* Reason */}
                    <FormField
                      label={t('officialHolidays.reason')}
                      required
                      error={errors.holidays?.[index]?.reason?.message}
                      htmlFor={`holidays.${index}.reason`}
                    >
                      <Controller
                        name={`holidays.${index}.reason`}
                        control={control.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="text"
                            placeholder={t('officialHolidays.enterReason')}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            id={`holidays.${index}.reason`}
                          />
                        )}
                      />
                    </FormField>
                  </div>
                </div>
                <div aria-hidden="true">
                  <div className="h-8 w-8"></div>
                </div>
              </div>

              <div className="flex gap-1">
                <div className="w-full">
                  {/* Official Document Upload */}
                  <FormField
                    label={t('officialHolidays.officialDocument')}
                    optional
                    htmlFor={`holidays.${index}.officialDocument`}
                  >
                    <FileUpload
                      label=""
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg"
                      onChange={handleFileUpload(index)}
                      onDelete={(fileIndex) =>
                        handleFileDelete(index, getFileNames(index)?.[fileIndex || 0])()
                      }
                      fileNames={getFileNames(index)}
                      uploadText={t('officialHolidays.uploadAttachments')}
                      formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
                      multiple
                      id={`holidays.${index}.officialDocument`}
                    />
                  </FormField>
                </div>
                <div aria-hidden="true">
                  <div className="h-8 w-8"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || isCreating}>
            {isCreating ? t('common.saving') : t('common.add')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddFixedHolidayForm;
