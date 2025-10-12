import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@gradex/shared/components/Input';
import FormField from '@gradex/shared/components/FormField';

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
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({ formData, onInputChange }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.mobile')} required>
          <Input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onInputChange}
            placeholder={t('schools.mobile')}
            type="tel"
            required
          />
        </FormField>

        <FormField label={t('schools.email')}>
          <Input
            name="email"
            value={formData.email}
            onChange={onInputChange}
            placeholder={t('schools.enterEmail')}
            type="email"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.website')}>
          <Input
            name="website"
            value={formData.website}
            onChange={onInputChange}
            placeholder={t('schools.enterWebsite')}
            type="url"
          />
        </FormField>

        <FormField label={t('schools.contactPerson')}>
          <Input
            name="contactPerson"
            value={formData.contactPerson}
            onChange={onInputChange}
            placeholder={t('schools.enterContactPerson')}
          />
        </FormField>
      </div>
    </div>
  );
};

export default ContactInfoStep;
