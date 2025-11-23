import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useAppSelector } from '@/hooks/useRedux';
import type { Country } from '@/services/api/types/lookup.types';
import type { AddHolidaysProps } from '@/validations/official-holidays-validations';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import FileUpload from '@/shared/components/FileUpload';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';

interface AddOfficialHolidayFormProps {
  control: UseFormReturn<AddHolidaysProps, any, AddHolidaysProps>;
  onSubmit: (data: AddHolidaysProps) => Promise<void>;
  onCancel: () => void;
  handleFileUpload: (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDelete: (index: number, fileName?: string) => () => void;
  getFileNames: (index: number) => string[];
  isSubmitting: boolean;
}

const AddOfficialHolidayForm = ({
  control,
  onSubmit,
  onCancel,
  handleFileUpload,
  handleFileDelete,
  getFileNames,
  isSubmitting,
}: AddOfficialHolidayFormProps) => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { countries, isLoadingCountries } = useAppSelector((state) => state.lookups);
  const { isCreating } = useAppSelector((state) => state.officialHolidays);

  const {
    handleSubmit,
    formState: { errors },
  } = control;

  const countryOptions = countries.map((country: Country) => ({
    value: country.id.toString(),
    label: i18n.language === 'ar' ? country.arabicName : country.englishName,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <div className="space-y-6">
          {/* Single Official Holiday */}
          <div className="space-y-4">
            {/* Date Range and Fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              {/* Start Date */}
              <FormField
                label={t('officialHolidays.startDate')}
                required
                error={errors.startDate?.message}
                htmlFor="startDate"
              >
                <Controller
                  name="startDate"
                  control={control.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      id="startDate"
                    />
                  )}
                />
              </FormField>

              {/* End Date */}
              <FormField
                label={t('officialHolidays.endDate')}
                required
                error={errors.endDate?.message}
                htmlFor="endDate"
              >
                <Controller
                  name="endDate"
                  control={control.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      id="endDate"
                    />
                  )}
                />
              </FormField>

              {/* Country */}
              <FormField
                label={t('officialHolidays.country')}
                required
                error={errors.country?.message}
                htmlFor="country"
              >
                <Controller
                  name="country"
                  control={control.control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      options={countryOptions}
                      placeholder={t('officialHolidays.selectCountry')}
                      disabled={isLoadingCountries}
                      id="country"
                    />
                  )}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Reason Ar */}
              <FormField
                label={t('officialHolidays.reasonInAr')}
                required
                error={errors.reasonAr?.message}
                htmlFor="reasonAr"
              >
                <Controller
                  name="reasonAr"
                  control={control.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('officialHolidays.enterReasonInAr')}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      id="reasonAr"
                    />
                  )}
                />
              </FormField>
              {/* Reason En */}
              <FormField
                label={t('officialHolidays.reasonInEn')}
                required
                error={errors.reasonEn?.message}
                htmlFor="reasonEn"
              >
                <Controller
                  name="reasonEn"
                  control={control.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('officialHolidays.enterReasonInEn')}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      id="reasonEn"
                    />
                  )}
                />
              </FormField>
            </div>

            {/* Official Document Upload */}
            <FormField
              label={t('officialHolidays.officialDocument')}
              optional
              htmlFor="officialDocument"
            >
              <FileUpload
                label=""
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg"
                onChange={handleFileUpload(0)}
                onDelete={(fileIndex) => handleFileDelete(0, getFileNames(0)?.[fileIndex || 0])()}
                fileNames={getFileNames(0)}
                uploadText={t('officialHolidays.uploadAttachments')}
                formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
                multiple
                id="officialDocument"
              />
            </FormField>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || isCreating}>
            {isCreating ? t('common.saving') : t('common.add')}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default AddOfficialHolidayForm;
