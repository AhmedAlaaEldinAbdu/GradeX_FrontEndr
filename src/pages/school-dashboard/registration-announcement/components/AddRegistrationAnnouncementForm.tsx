import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@gradex/shared/components/Card';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import MultiSelectTagInput from '@/shared/components/MultiSelectTagInput';

const AddRegistrationAnnouncementForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [educationalStages, setEducationalStages] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mock options for educational stages
  const stageOptions = [
    { value: 'primary', label: 'المرحلة الابتدائية' },
    { value: 'middle', label: 'المرحلة الإعدادية' },
    { value: 'high', label: 'المرحلة الثانوية' },
    { value: 'kg', label: 'رياض الأطفال' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement submission logic
    console.log({ educationalStages, startDate, endDate });
    navigate('/registration-announcement');
  };

  const handleCancel = () => {
    navigate('/registration-announcement');
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Educational Stages (Multi-Select) */}
        <div>
          <label className="mb-2 block text-start text-sm font-medium text-gray-700">
            {t('registrationAnnouncement.educationalStagesLabel')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <MultiSelectTagInput
            value={educationalStages}
            onChange={setEducationalStages}
            options={stageOptions}
            placeholder={t('registrationAnnouncement.selectEducationalStages')}
            // To match the design's cleaner look if needed, but the component has specific styling.
          />
        </div>

        {/* Start and End Dates */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label={t('registrationAnnouncement.startDateLabel') + ' *'}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder={t('registrationAnnouncement.chooseStartDate')}
            required
            // To mimic the design, we assume the input component handles the calendar icon or native picker
          />
          <Input
            label={t('registrationAnnouncement.endDateLabel') + ' *'}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder={t('registrationAnnouncement.chooseEndDate')}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
            className="min-w-[120px] border-green-800 text-green-800 hover:bg-green-50"
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="min-w-[120px] bg-green-800 hover:bg-green-900"
          >
            {t('common.add')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddRegistrationAnnouncementForm;
