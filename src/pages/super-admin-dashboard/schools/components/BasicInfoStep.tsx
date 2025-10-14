import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@gradex/shared/components/Input';
import Select from '@gradex/shared/components/Select';
import TextArea from '@gradex/shared/components/TextArea';
import calendarIcon from '@gradex/assets/icons/calendar.svg';
import FormField from '@gradex/shared/components/FormField';
import FileUpload from '@gradex/shared/components/FileUpload';
import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';

interface BasicInfoStepProps {
  formData: {
    schoolName: string;
    academicSystem: string;
    foundationDate: string;
    aboutSchool: string;
    hasCurrentSystem: boolean;
    currentSystem: string;
    country: string;
    applicationFeatures: {
      attendanceAndDeparture: boolean;
      remoteBookTracking: boolean;
      expensesTrackingOnly: boolean;
      fullExpensesPayment: boolean;
    };
    bankName: string;
    accountNumber: string;
    ibanNumber: string;
  };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onRadioChange: (name: string, value: boolean) => void;
  onCheckboxChange: (name: string, checked: boolean) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  logoFileName?: string;
  readOnly?: boolean;
  showRejectedLabel?: boolean;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onInputChange,
  onRadioChange,
  onCheckboxChange,
  onLogoUpload,
  logoFileName,
  readOnly = false,
  showRejectedLabel = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-4">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.schoolName')} required>
          <Input
            name="schoolName"
            value={formData.schoolName}
            onChange={onInputChange}
            placeholder={t('schools.enterSchoolName')}
            required
            disabled={readOnly}
          />
        </FormField>

        <FormField label={t('schools.academicSystem')} required>
          <Select
            name="academicSystem"
            value={formData.academicSystem}
            onChange={onInputChange}
            options={[
              { value: '', label: t('schools.chooseAcademicSystem') },
              { value: 'government', label: 'حكومي' },
              { value: 'private', label: 'خاص' },
              { value: 'national', label: 'أهلي' },
            ]}
            required
            disabled={readOnly}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.countryWithAl')} required>
          <Select
            name="country"
            value={formData.country}
            onChange={onInputChange}
            options={[
              { value: '', label: t('schools.selectCountry') },
              { value: 'egypt', label: 'مصر' },
              { value: 'saudi', label: 'السعودية' },
            ]}
            required
            disabled={readOnly}
          />
        </FormField>

        <FormField label={t('schools.foundationDate')} required>
          <div className="relative">
            <Input
              name="foundationDate"
              type="date"
              value={formData.foundationDate}
              onChange={onInputChange}
              placeholder="اختر التاريخ"
              icon={<img src={calendarIcon} alt="calendar" className="h-5 w-5" />}
              disabled={readOnly}
            />
          </div>
        </FormField>
      </div>

      <FormField label={t('schools.aboutSchool')} optional>
        <TextArea
          name="aboutSchool"
          value={formData.aboutSchool}
          onChange={onInputChange}
          placeholder={t('schools.writeAboutSchool')}
          rows={4}
          disabled={readOnly}
        />
      </FormField>

      {/* External Current System Question */}
      <FormField label="هل لديهم نظام حالي؟" required>
        <div className="flex gap-6 text-right">
          <div className="flex items-center justify-end">
            <label
              htmlFor="hasCurrentSystemSwitch"
              className="relative inline-flex h-6 w-11 cursor-pointer items-center"
            >
              <input
                id="hasCurrentSystemSwitch"
                type="checkbox"
                checked={formData.hasCurrentSystem}
                onChange={(e) => onRadioChange('hasCurrentSystem', e.target.checked)}
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
      </FormField>

      {formData.hasCurrentSystem ? (
        <FormField label={t('schools.currentSystem')} required>
          <TextArea
            name="currentSystem"
            value={formData.currentSystem}
            onChange={onInputChange}
            placeholder={t('schools.writeCurrentSystem')}
            rows={4}
            disabled={readOnly}
          />
        </FormField>
      ) : null}

      {!readOnly && (
        <FileUpload
          label={t('schools.licenses')}
          onChange={onLogoUpload}
          fileName={logoFileName}
          uploadText={t('schools.uploadMedia')}
        />
      )}

      {/* Application Features Section */}
      <div className="space-y-4">
        <h3 className="text-right text-lg font-semibold text-gray-900">مميزات التطبيق</h3>
        <p className="text-right text-sm text-gray-600">
          اختر المميزات التي تناسبك لتستفيد منها مع نظامك
        </p>

        <FormField label="مميزات النظام" required>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <CustomCheckbox
              name="attendanceAndDeparture"
              checked={formData.applicationFeatures.attendanceAndDeparture}
              onChange={(checked) => onCheckboxChange('attendanceAndDeparture', checked)}
              label="الحضور و الإنصراف"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="expensesTrackingOnly"
              checked={formData.applicationFeatures.expensesTrackingOnly}
              onChange={(checked) => onCheckboxChange('expensesTrackingOnly', checked)}
              label="دفع المصاريف قسط"
              disabled={readOnly}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <CustomCheckbox
              name="remoteBookTracking"
              checked={formData.applicationFeatures.remoteBookTracking}
              onChange={(checked) => onCheckboxChange('remoteBookTracking', checked)}
              label="شراء الكتب عن طريقنا"
              disabled={readOnly}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <CustomCheckbox
              name="fullExpensesPayment"
              checked={formData.applicationFeatures.fullExpensesPayment}
              onChange={(checked) => onCheckboxChange('fullExpensesPayment', checked)}
              label="دفع المصاريف كاش"
              disabled={readOnly}
            />
          </div>
        </FormField>
      </div>

      {/* Financial Data Section */}
      <div className="space-y-4">
        <h3 className="text-right text-lg font-semibold text-gray-900">بيانات مالية</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="اسم البنك" required>
            <Input
              name="bankName"
              value={formData.bankName}
              onChange={onInputChange}
              placeholder="اكتب اسم البنك"
              required
              disabled={readOnly}
            />
          </FormField>

          <FormField label="رقم الحساب" required>
            <Input
              name="accountNumber"
              value={formData.accountNumber}
              onChange={onInputChange}
              placeholder="اكتب رقم الحساب"
              required
              disabled={readOnly}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="رقم (IBAN)" required>
            <Input
              name="ibanNumber"
              value={formData.ibanNumber}
              onChange={onInputChange}
              placeholder="اكتب رقم (IBAN)"
              required
              disabled={readOnly}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
