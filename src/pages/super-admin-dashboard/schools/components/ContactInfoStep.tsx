import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@gradex/shared/components/Input';
import FormField from '@gradex/shared/components/FormField';
import PhoneInput from '@gradex/shared/components/PhoneInput';

interface ContactInfoStepProps {
  formData: {
    phoneNumber: string;
    email: string;
    website: string;
    contactPerson: string;
    attendanceFeature: boolean;
    buyBooksFeature: boolean;
    payCashFeature: boolean;
    payInstallmentFeature: boolean;
  };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onPhoneChange: (value: string) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
  formData,
  onInputChange,
  onPhoneChange,
  readOnly = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.email')} required>
          <Input
            name="email"
            value={formData.email}
            onChange={onInputChange}
            placeholder={t('schools.enterEmail')}
            type="email"
            disabled={readOnly}
          />
        </FormField>
        <FormField label={t('schools.website')} optional>
          <Input
            name="website"
            value={formData.website}
            onChange={onInputChange}
            placeholder={t('schools.enterWebsite')}
            type="url"
            disabled={readOnly}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PhoneInput
          label={t('schools.landline')}
          value={formData.phoneNumber}
          onChange={onPhoneChange}
          required
          disabled={readOnly}
        />
        <PhoneInput
          label={t('schools.mobile')}
          value={formData.phoneNumber}
          onChange={onPhoneChange}
          required
          disabled={readOnly}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.contactPerson')} required>
          <Input
            name="contactPerson"
            value={formData.contactPerson}
            onChange={onInputChange}
            placeholder={t('schools.enterContactPerson')}
            disabled={readOnly}
          />
        </FormField>
      </div>
    </div>
  );
};

export default ContactInfoStep;
