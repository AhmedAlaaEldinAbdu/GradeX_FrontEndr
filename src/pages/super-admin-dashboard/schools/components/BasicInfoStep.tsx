import React, { useEffect, useMemo, useRef } from 'react';
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
import ViewModeFileDisplay from './ViewModeFileDisplay';
import type { SchoolFormData } from '../types/school.types';
import {
  fetchCountries,
  selectCountries,
  selectIsLoadingCountries,
  fetchApplicationFeatures,
  selectApplicationFeatures,
  selectIsLoadingFeatures,
} from '@gradex/redux/features/lookups';
import {
  getAcademicSystems,
  selectAcademicSystems,
  selectIsLoadingAcademicSystems,
} from '@gradex/redux/features/academic-system';
import CustomSelect from '@/shared/components/CustomSelect';
import i18n from '@/i18n';
import CustomImage from '@/shared/components/CustomImage';

interface BasicInfoStepProps {
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoDelete?: (index?: number) => void;
  licenseFileName?: string;
  licenseFileNames?: string[];
  licenseFiles?: File[];
  licenseError?: string;
  readOnly?: boolean;
  showRejectedLabel?: boolean;
  showPendingLabel?: boolean;
}

/**
 * BasicInfoStep - First step in school form with react-hook-form integration
 * Includes school data, application features, and financial information
 */
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  onLogoUpload,
  onLogoDelete,
  licenseFileName: licenseFileName,
  licenseFileNames: licenseFileNames,
  licenseFiles = [],
  licenseError: licenseError,
  readOnly = false,
  showRejectedLabel = false,
  showPendingLabel = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const {
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
    clearErrors,
  } = useFormContext<SchoolFormData>();

  const currentLang = i18n.language as 'ar' | 'en';

  const hasCurrentSystem = watch('hasCurrentSystem');
  const selectedFeatures = watch('applicationFeatures');
  const academicSystemIdsValue = watch('academicSystemIds') as unknown as string[] | string;

  const countries = useSelector(selectCountries);
  const isLoadingCountries = useSelector(selectIsLoadingCountries);
  const academicSystems = useSelector(selectAcademicSystems);
  const isLoadingAcademicSystems = useSelector(selectIsLoadingAcademicSystems);
  const applicationFeatures = useSelector(selectApplicationFeatures);
  const isLoadingFeatures = useSelector(selectIsLoadingFeatures);

  const selectedAcademicSystemIds = useMemo(() => {
    if (Array.isArray(academicSystemIdsValue)) {
      return academicSystemIdsValue.filter(Boolean);
    }
    if (typeof academicSystemIdsValue === 'string' && academicSystemIdsValue.trim().length > 0) {
      return [academicSystemIdsValue];
    }
    return [] as string[];
  }, [academicSystemIdsValue]);

  const academicSubSystemOptions = useMemo(() => {
    if (!selectedAcademicSystemIds.length) return [];

    const optionsMap = new Map<string, { value: string; label: string }>();

    academicSystems
      .filter((system) => selectedAcademicSystemIds.includes(system.id))
      .forEach((system) => {
        const subsystems = system?.academicSubSystemDto ?? [];
        subsystems.forEach((sub) => {
          if (!sub?.id) return;
          if (optionsMap.has(sub.id)) return;
          optionsMap.set(sub.id, {
            value: sub.id,
            label: currentLang === 'ar' ? sub.nameAr : sub.nameEn || sub.nameAr,
          });
        });
      });

    return Array.from(optionsMap.values());
  }, [academicSystems, currentLang, selectedAcademicSystemIds]);

  const previousAcademicSystemIdsKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = selectedAcademicSystemIds.slice().sort().join(',');

    // Only prune when the academic systems change after the initial mount.
    if (previousAcademicSystemIdsKeyRef.current === null) {
      previousAcademicSystemIdsKeyRef.current = key;
      return;
    }

    if (previousAcademicSystemIdsKeyRef.current !== key) {
      previousAcademicSystemIdsKeyRef.current = key;

      const allowedSubSystemIds = new Set(academicSubSystemOptions.map((opt) => opt.value));
      const currentSelected = watch('subSystemIds') || [];
      const nextSelected = (currentSelected || []).filter((id) => allowedSubSystemIds.has(id));

      if (nextSelected.length !== currentSelected.length) {
        setValue('subSystemIds', nextSelected);
      }
      clearErrors('subSystemIds');
    }
  }, [academicSubSystemOptions, clearErrors, selectedAcademicSystemIds, setValue, watch]);

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAcademicSystems({ pageIndex: 1, pageSize: 1000 }));
    dispatch(fetchApplicationFeatures());
  }, [dispatch]);

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <div className={`${showRejectedLabel || showPendingLabel ? 'flex justify-between' : ''}`}>
          <h3 className="mb-6 text-right text-lg font-semibold text-gray-900">
            {t('schools.schoolData')}
          </h3>
          {/* Rejected Label */}
          {(showRejectedLabel || showPendingLabel) && (
            <div className="mb-4 flex justify-end">
              <div className="inline-flex w-max items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
                {showRejectedLabel && (
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
                )}
                <span
                  className={`text-sm font-medium ${showPendingLabel ? 'text-yellow-800' : 'text-red-800'}`}
                >
                  {showPendingLabel ? t('status.pending') : t('status.rejected')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* School Name (Arabic and English) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label={t('schools.schoolNameAr')}
            required
            htmlFor="schoolNameAr"
            error={errors.schoolNameAr?.message && t(errors.schoolNameAr.message)}
          >
            <Controller
              name="schoolNameAr"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t('schools.enterSchoolNameAr')}
                  required
                  disabled={readOnly}
                  id="schoolNameAr"
                />
              )}
            />
          </FormField>

          <FormField
            label={t('schools.schoolNameEn')}
            required
            htmlFor="schoolNameEn"
            error={errors.schoolNameEn?.message && t(errors.schoolNameEn.message)}
          >
            <Controller
              name="schoolNameEn"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t('schools.enterSchoolNameEn')}
                  required
                  disabled={readOnly}
                  id="schoolNameEn"
                />
              )}
            />
          </FormField>
        </div>

        {/* Academic System and Country */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label={t('schools.academicSystem')}
            required
            htmlFor="academicSystemIds"
            error={errors.academicSystemIds?.message && t(errors.academicSystemIds.message)}
          >
            <Controller
              name="academicSystemIds"
              control={control}
              render={({ field }) => {
                const fieldValue = Array.isArray(field.value) ? field.value : [];

                return (
                  <CustomSelect
                    value={fieldValue || []}
                    onChange={(value) => {
                      field.onChange(Array.isArray(value) ? value : [value]);
                      trigger('academicSystemIds');
                    }}
                    options={academicSystems.map((system) => ({
                      value: system.id,
                      label: currentLang === 'ar' ? system.nameAr : system.nameEn || system.nameAr,
                    }))}
                    placeholder={
                      isLoadingAcademicSystems
                        ? t('common.loading')
                        : t('schools.chooseAcademicSystem')
                    }
                    disabled={isLoadingAcademicSystems || readOnly}
                    maxHeight="200px"
                    isMulti
                  />
                );
              }}
            />
          </FormField>

          <FormField
            label={t('schools.academicSubSystems')}
            required
            htmlFor="subSystemIds"
            error={errors.subSystemIds?.message && t(errors.subSystemIds.message as string)}
          >
            <Controller
              name="subSystemIds"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value || []}
                  onChange={(value) => {
                    field.onChange(Array.isArray(value) ? value : [value]);
                    trigger('subSystemIds');
                  }}
                  options={academicSubSystemOptions}
                  placeholder={
                    isLoadingAcademicSystems
                      ? t('common.loading')
                      : t('schools.chooseAcademicSubSystems')
                  }
                  disabled={isLoadingAcademicSystems || readOnly}
                  maxHeight="200px"
                  isMulti
                />
              )}
            />
          </FormField>
        </div>

        <FormField
          label={t('schools.countryWithAl')}
          required
          htmlFor="country"
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

        {/* Foundation Date */}
        <FormField
          label={t('schools.foundationDate')}
          required
          htmlFor="foundationDate"
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
                  placeholder={t('common.chooseDate')}
                  icon={<CustomImage src={calendarIcon} alt="calendar" className="h-5 w-5" />}
                  disabled={readOnly}
                  className={'text-end'}
                  id="foundationDate"
                />
              </div>
            )}
          />
        </FormField>

        {/* About School */}
        <FormField
          label={t('schools.aboutSchool')}
          optional
          htmlFor="aboutSchool"
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
                id="aboutSchool"
              />
            )}
          />
        </FormField>

        {/* Has Current System Toggle */}
        <FormField label={t('schools.hasCurrentSystem')}>
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
                      aria-label={t('schools.hasCurrentSystem')}
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
            htmlFor="currentSystem"
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
                  id="currentSystem"
                />
              )}
            />
          </FormField>
        )}

        {/* File Upload - Multiple Files */}
        {!readOnly ? (
          <div>
            <FileUpload
              label={t('schools.licenses')}
              accept="image/*,.svg,.jpg,.jpeg,.png,.pdf"
              onChange={onLogoUpload}
              onDelete={onLogoDelete}
              fileNames={licenseFileNames || (licenseFileName ? [licenseFileName] : [])}
              files={licenseFiles}
              uploadText={t('schools.uploadMedia')}
              required={true}
              multiple={true}
              error={!!licenseError}
            />
            {licenseError && (
              <p className="mt-1 text-right text-xs text-red-600">{t(licenseError)}</p>
            )}
          </div>
        ) : (
          <>
            {licenseFileNames && licenseFileNames.length > 0 && (
              <ViewModeFileDisplay files={licenseFileNames} label={t('schools.licenses')} />
            )}
          </>
        )}
      </div>

      {/* Application Features Section */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <h3 className="text-right text-lg font-semibold text-gray-900">
            {t('schools.appFeatures')}
          </h3>
          <p className="text-right text-sm text-gray-600">{t('schools.chooseFeatures')}</p>

          <FormField
            label={t('schools.appFeatures')}
            required
            error={errors.applicationFeatures?.message && t(errors.applicationFeatures.message)}
          >
            {isLoadingFeatures ? (
              <div className="text-center text-sm text-gray-500">{t('common.loading')}</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {applicationFeatures.map((feature) => (
                  <CustomCheckbox
                    key={feature.id}
                    name={feature.id}
                    checked={selectedFeatures?.includes(feature.id) || false}
                    onChange={(checked) => {
                      const currentFeatures = selectedFeatures || [];
                      const updatedFeatures = checked
                        ? [...currentFeatures, feature.id]
                        : currentFeatures.filter((id) => id !== feature.id);
                      setValue('applicationFeatures', updatedFeatures);
                      trigger('applicationFeatures');
                    }}
                    label={currentLang === 'ar' ? feature.nameAr : feature.nameEn}
                    disabled={readOnly}
                  />
                ))}
              </div>
            )}
          </FormField>
        </div>
      </div>

      {/* Financial Data Section */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <h3 className="text-right text-lg font-semibold text-gray-900">
            {t('schools.financialData')}
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label={t('schools.bankName')}
              required
              htmlFor="bankName"
              error={errors.bankName?.message && t(errors.bankName.message)}
            >
              <Controller
                name="bankName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={t('schools.enterBankName')}
                    required
                    disabled={readOnly}
                    id="bankName"
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('schools.accountNumber')}
              required
              htmlFor="accountNumber"
              error={errors.accountNumber?.message && t(errors.accountNumber.message)}
            >
              <Controller
                name="accountNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={t('schools.enterAccountNumber')}
                    required
                    disabled={readOnly}
                    id="accountNumber"
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label={t('schools.ibanNumber')}
              required
              htmlFor="ibanNumber"
              error={errors.ibanNumber?.message && t(errors.ibanNumber.message)}
            >
              <Controller
                name="ibanNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={t('schools.enterIbanNumber')}
                    required
                    disabled={readOnly}
                    id="ibanNumber"
                  />
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
