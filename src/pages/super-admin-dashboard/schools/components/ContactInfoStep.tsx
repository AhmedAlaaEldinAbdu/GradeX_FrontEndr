import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import Input from '@gradex/shared/components/Input';
import FormField from '@gradex/shared/components/FormField';
import PhoneInput from '@gradex/shared/components/PhoneInput';
import type { SchoolFormData } from '../types/school.types';

interface ContactInfoStepProps {
  readOnly?: boolean;
}

/**
 * ContactInfoStep - Second step in school form with react-hook-form integration
 * Includes email, website, phone numbers, and contact person information
 */
const ContactInfoStep: React.FC<ContactInfoStepProps> = ({ readOnly = false }) => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext<SchoolFormData>();

  return (
    <div className="space-y-6 p-4">
      {/* Email and Website */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('schools.email')}
          required
          error={errors.email?.message && t(errors.email.message)}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('schools.enterEmail')}
                type="email"
                disabled={readOnly}
              />
            )}
          />
        </FormField>

        <FormField
          label={t('schools.website')}
          optional
          error={errors.website?.message && t(errors.website.message)}
        >
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('schools.enterWebsite')}
                type="url"
                disabled={readOnly}
              />
            )}
          />
        </FormField>
      </div>

      {/* Phone Numbers */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <PhoneInput
              label={t('schools.landline')}
              value={field.value}
              onChange={field.onChange}
              required
              disabled={readOnly}
            />
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <PhoneInput
              label={t('schools.mobile')}
              value={field.value}
              onChange={field.onChange}
              required
              disabled={readOnly}
            />
          )}
        />
      </div>

      {/* Contact Person */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('schools.contactPerson')}
          required
          error={errors.contactPerson?.message && t(errors.contactPerson.message)}
        >
          <Controller
            name="contactPerson"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('schools.enterContactPerson')}
                disabled={readOnly}
              />
            )}
          />
        </FormField>
      </div>
    </div>
  );
};

export default ContactInfoStep;
