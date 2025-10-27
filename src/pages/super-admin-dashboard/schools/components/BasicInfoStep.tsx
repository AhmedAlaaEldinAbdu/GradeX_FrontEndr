import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import Input from '@gradex/shared/components/Input';
import TextArea from '@gradex/shared/components/TextArea';
import calendarIcon from '@gradex/assets/icons/calendar.svg';
import FormField from '@gradex/shared/components/FormField';
import FileUpload from '@gradex/shared/components/FileUpload';
import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';
import MultiSelectTagInput from '@gradex/shared/components/MultiSelectTagInput';
import type { MultiSelectOption } from '@gradex/shared/components/MultiSelectTagInput';
import type { SchoolFormData } from '../types/school.types';
import {
  fetchCountries,
  selectCountries,
  selectIsLoadingCountries,
} from '@gradex/redux/features/lookups';
import CustomSelect from '@/shared/components/CustomSelect';
import i18n from '@/i18n';

interface BasicInfoStepProps {
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  logoFileName?: string;
  logoError?: string;
  readOnly?: boolean;
  showRejectedLabel?: boolean;
}

/**
 * BasicInfoStep - First step in school form with react-hook-form integration
 * Includes school data, application features, and financial information
 */
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  onLogoUpload,
  logoFileName,
  logoError,
  readOnly = false,
  showRejectedLabel = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const {
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useFormContext<SchoolFormData>();

  const currentLang = i18n.language as 'ar' | 'en';

  const hasCurrentSystem = watch('hasCurrentSystem');
  const applicationFeatures = watch('applicationFeatures');

  const countries = useSelector(selectCountries);
  const isLoadingCountries = useSelector(selectIsLoadingCountries);

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        {/* Rejected Label */}
        {showRejectedLabel && (
          <div className="mb-4 flex justify-end">
            <div className="inline-flex w-max items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
              <svg
                className="h-5 w-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-red-800">{t('status.rejected')}</span>
            </div>
          </div>
        )}

        <h3 className="mb-6 text-right text-lg font-semibold text-gray-900">
          {t('schools.schoolData')}
        </h3>

        {/* School Name and Academic System */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label={t('schools.schoolName')}
            required
            error={errors.schoolName?.message && t(errors.schoolName.message)}
          >
            <Controller
              name="schoolName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t('schools.enterSchoolName')}
                  required
                  disabled={readOnly}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('schools.academicSystem')}
            required
            error={errors.academicSystem?.message && t(errors.academicSystem.message)}
          >
            <Controller
              name="academicSystem"
              control={control}
              render={({ field }) => {
                const academicSystemOptions: MultiSelectOption[] = [
                  { value: 'government', label: 'حكومي' },
                  { value: 'private', label: 'خاص' },
                  { value: 'national', label: 'أهلي' },
                ];

                return (
                  <MultiSelectTagInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={academicSystemOptions}
                    placeholder={t('schools.chooseAcademicSystem')}
                    disabled={readOnly}
                    error={!!errors.academicSystem}
                  />
                );
              }}
            />
          </FormField>
        </div>

        {/* Country and Foundation Date */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label={t('schools.countryWithAl')}
            required
            error={errors.country?.message && t(errors.country.message)}
          >
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value || ''}
                  onChange={(value) => {
                    field.onChange(value);
                    trigger('country');
                  }}
                  options={countries.map((country) => ({
                    value: country.id,
                    label: currentLang === 'ar' ? country.arabicName : country.englishName,
                  }))}
                  placeholder={isLoadingCountries ? t('common.loading') : t('schools.country')}
                  disabled={isLoadingCountries || readOnly}
                  maxHeight="200px"
                />
              )}
            />
          </FormField>

          <FormField
            label={t('schools.foundationDate')}
            required
            error={errors.foundationDate?.message && t(errors.foundationDate.message)}
          >
            <Controller
              name="foundationDate"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    type="date"
                    placeholder="اختر التاريخ"
                    icon={<img src={calendarIcon} alt="calendar" className="h-5 w-5" />}
                    disabled={readOnly}
                  />
                </div>
              )}
            />
          </FormField>
        </div>

        {/* About School */}
        <FormField
          label={t('schools.aboutSchool')}
          optional
          error={errors.aboutSchool?.message && t(errors.aboutSchool.message)}
        >
          <Controller
            name="aboutSchool"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                placeholder={t('schools.writeAboutSchool')}
                rows={4}
                disabled={readOnly}
              />
            )}
          />
        </FormField>

        {/* Has Current System Toggle */}
        <FormField label="هل لديهم نظام حالي؟" required>
          <Controller
            name="hasCurrentSystem"
            control={control}
            render={({ field }) => (
              <div className="flex gap-6 text-right">
                <div className="flex items-center justify-end">
                  <label
                    htmlFor="hasCurrentSystemSwitch"
                    className="relative inline-flex h-6 w-11 cursor-pointer items-center"
                  >
                    <input
                      id="hasCurrentSystemSwitch"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="peer sr-only"
                      aria-label="هل لديهم نظام حالي"
                      disabled={readOnly}
                    />
                    <div
                      className={`peer-unchecked:bg-gray-200 h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-green-600 ${readOnly ? 'opacity-50' : ''}`}
                    ></div>
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5`}
                    ></span>
                  </label>
                </div>
              </div>
            )}
          />
        </FormField>

        {/* Current System (Conditional) */}
        {hasCurrentSystem && (
          <FormField
            label={t('schools.currentSystem')}
            required
            error={errors.currentSystem?.message && t(errors.currentSystem.message)}
          >
            <Controller
              name="currentSystem"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  placeholder={t('schools.writeCurrentSystem')}
                  rows={4}
                  disabled={readOnly}
                />
              )}
            />
          </FormField>
        )}

        {/* File Upload */}
        {!readOnly && (
          <div>
            <FileUpload
              label={t('schools.licenses')}
              onChange={onLogoUpload}
              fileName={logoFileName}
              uploadText={t('schools.uploadMedia')}
              required={true}
            />
            {logoError && <p className="mt-1 text-right text-xs text-red-600">{t(logoError)}</p>}
          </div>
        )}
      </div>

      {/* Application Features Section */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <h3 className="text-right text-lg font-semibold text-gray-900">مميزات التطبيق</h3>
          <p className="text-right text-sm text-gray-600">
            اختر المميزات التي تناسبك لتستفيد منها مع نظامك
          </p>

          <FormField
            label="مميزات النظام"
            required
            error={errors.applicationFeatures?.message && t(errors.applicationFeatures.message)}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <CustomCheckbox
                name="attendanceAndDeparture"
                checked={applicationFeatures.attendanceAndDeparture}
                onChange={(checked) => {
                  setValue('applicationFeatures.attendanceAndDeparture', checked);
                  trigger('applicationFeatures');
                }}
                label="الحضور و الإنصراف"
                disabled={readOnly}
              />

              <CustomCheckbox
                name="expensesTrackingOnly"
                checked={applicationFeatures.expensesTrackingOnly}
                onChange={(checked) => {
                  setValue('applicationFeatures.expensesTrackingOnly', checked);
                  trigger('applicationFeatures');
                }}
                label="دفع المصاريف قسط"
                disabled={readOnly}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <CustomCheckbox
                name="remoteBookTracking"
                checked={applicationFeatures.remoteBookTracking}
                onChange={(checked) => {
                  setValue('applicationFeatures.remoteBookTracking', checked);
                  trigger('applicationFeatures');
                }}
                label="شراء الكتب عن طريقنا"
                disabled={readOnly}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <CustomCheckbox
                name="fullExpensesPayment"
                checked={applicationFeatures.fullExpensesPayment}
                onChange={(checked) => {
                  setValue('applicationFeatures.fullExpensesPayment', checked);
                  trigger('applicationFeatures');
                }}
                label="دفع المصاريف كاش"
                disabled={readOnly}
              />
            </div>
          </FormField>
        </div>
      </div>

      {/* Financial Data Section */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <h3 className="text-right text-lg font-semibold text-gray-900">بيانات مالية</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="اسم البنك"
              required
              error={errors.bankName?.message && t(errors.bankName.message)}
            >
              <Controller
                name="bankName"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="اكتب اسم البنك" required disabled={readOnly} />
                )}
              />
            </FormField>

            <FormField
              label="رقم الحساب"
              required
              error={errors.accountNumber?.message && t(errors.accountNumber.message)}
            >
              <Controller
                name="accountNumber"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="اكتب رقم الحساب" required disabled={readOnly} />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="رقم (IBAN)"
              required
              error={errors.ibanNumber?.message && t(errors.ibanNumber.message)}
            >
              <Controller
                name="ibanNumber"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="اكتب رقم (IBAN)" required disabled={readOnly} />
                )}
              />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
