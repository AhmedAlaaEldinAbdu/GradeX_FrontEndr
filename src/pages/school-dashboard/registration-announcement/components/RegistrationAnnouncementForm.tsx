import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@gradex/shared/components/Card';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import MultiSelectTagInput from '@/shared/components/MultiSelectTagInput';
import FormField from '@/shared/components/FormField';
import {
  RegistrationAnnouncementSchema,
  type RegistrationAnnouncementProps,
} from '@/validations/registration-announcement-validations';

interface RegistrationAnnouncementFormProps {
  initialValues?: Partial<RegistrationAnnouncementProps>;
  onSubmit: (data: RegistrationAnnouncementProps) => Promise<void>;
  isEditMode?: boolean;
}

const RegistrationAnnouncementForm: React.FC<RegistrationAnnouncementFormProps> = ({
  initialValues,
  onSubmit,
  isEditMode = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock options for educational stages
  const stageOptions = [
    { value: 'primary', label: 'المرحلة الابتدائية' },
    { value: 'middle', label: 'المرحلة الإعدادية' },
    { value: 'high', label: 'المرحلة الثانوية' },
    { value: 'kg', label: 'رياض الأطفال' },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationAnnouncementProps>({
    resolver: yupResolver(RegistrationAnnouncementSchema),
    defaultValues: {
      educationalStages: initialValues?.educationalStages || '',
      startDate: initialValues?.startDate || '',
      endDate: initialValues?.endDate || '',
    },
  });

  const handleFormSubmit = async (data: RegistrationAnnouncementProps) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/registration-announcement');
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Educational Stages (Multi-Select) */}
        <FormField
          label={t('registrationAnnouncement.educationalStagesLabel')}
          required
          error={errors.educationalStages?.message && t(errors.educationalStages.message)}
          htmlFor="educationalStages"
        >
          <Controller
            name="educationalStages"
            control={control}
            render={({ field }) => (
              <MultiSelectTagInput
                value={field.value}
                onChange={field.onChange}
                options={stageOptions}
                placeholder={t('registrationAnnouncement.selectEducationalStages')}
                error={!!errors.educationalStages}
              />
            )}
          />
        </FormField>

        {/* Start and End Dates */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label={t('registrationAnnouncement.startDateLabel')}
            required
            error={errors.startDate?.message && t(errors.startDate.message)}
            htmlFor="startDate"
          >
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  placeholder={t('registrationAnnouncement.chooseStartDate')}
                  error={errors.startDate?.message ? ' ' : undefined} // Pass non-empty string or boolean true to trigger red border only
                  className={errors.startDate?.message ? 'border-red-500' : ''}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('registrationAnnouncement.endDateLabel')}
            required
            error={errors.endDate?.message && t(errors.endDate.message)}
            htmlFor="endDate"
          >
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  placeholder={t('registrationAnnouncement.chooseEndDate')}
                  error={errors.endDate?.message ? ' ' : undefined}
                  className={errors.endDate?.message ? 'border-red-500' : ''}
                />
              )}
            />
          </FormField>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
            className="min-w-[120px] border-green-800 text-green-800 hover:bg-green-50"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="min-w-[120px] bg-green-800 hover:bg-green-900"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.saving') : isEditMode ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RegistrationAnnouncementForm;
