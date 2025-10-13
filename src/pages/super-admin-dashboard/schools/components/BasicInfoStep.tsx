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
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onInputChange,
  onRadioChange,
  onCheckboxChange,
  onLogoUpload,
  logoFileName,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-4">
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
              />
              <div
                className={`peer-unchecked:bg-gray-200 h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-green-600`}
              ></div>
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5`}
              ></span>
            </label>
          </div>
        </div>
      </FormField>

      <FileUpload
        label={t('schools.licenses')}
        onChange={onLogoUpload}
        fileName={logoFileName}
        uploadText={t('schools.uploadMedia')}
      />

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
            />

            <CustomCheckbox
              name="expensesTrackingOnly"
              checked={formData.applicationFeatures.expensesTrackingOnly}
              onChange={(checked) => onCheckboxChange('expensesTrackingOnly', checked)}
              label="دفع المصاريف قسط"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <CustomCheckbox
              name="remoteBookTracking"
              checked={formData.applicationFeatures.remoteBookTracking}
              onChange={(checked) => onCheckboxChange('remoteBookTracking', checked)}
              label="شراء الكتب عن طريقنا"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <CustomCheckbox
              name="fullExpensesPayment"
              checked={formData.applicationFeatures.fullExpensesPayment}
              onChange={(checked) => onCheckboxChange('fullExpensesPayment', checked)}
              label="دفع المصاريف كاش"
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
            />
          </FormField>

          <FormField label="رقم الحساب" required>
            <Input
              name="accountNumber"
              value={formData.accountNumber}
              onChange={onInputChange}
              placeholder="اكتب رقم الحساب"
              required
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
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
