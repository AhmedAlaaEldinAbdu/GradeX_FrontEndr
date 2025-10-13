import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import StepIndicator from '@gradex/shared/components/StepIndicator';
import Button from '@gradex/shared/components/Button';
import BasicInfoStep from './BasicInfoStep';
import AddressStep from './AddressStep';
import ContactInfoStep from './ContactInfoStep';
import FacilitiesStep from './FacilitiesStep';
import { useSchoolForm } from '../hooks/useSchoolForm';
import type { SchoolFormData } from '../types/school.types';
import LocationIcon from '@gradex/assets/icons/location-fill.svg';
import PhoneIcon from '@gradex/assets/icons/phone-fill.svg';
import DiamondIcon from '@gradex/assets/icons/Diamond.svg';
import FileIcon from '@gradex/assets/icons/File.svg';

interface SchoolFormProps {
  mode: 'add' | 'edit';
  initialData?: SchoolFormData;
  schoolId?: string;
}

const SchoolForm = ({ mode, initialData, schoolId }: SchoolFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    formData,
    files,
    handleInputChange,
    handlePhoneChange,
    handleCheckboxChange,
    handleRadioChange,
    handleApplicationFeatureChange,
    handleFacilityChange,
    handleFileUpload,
    handleFileDelete,
  } = useSchoolForm(initialData);

  const steps = [
    {
      id: 1,
      step: 1,
      icon: <img src={FileIcon} className="h-5 w-5" alt="Basic Info" />,
      label: t('schools.basicInfo'),
      completed: currentStep > 1,
    },
    {
      id: 2,
      step: 2,
      icon: <img src={PhoneIcon} className="h-5 w-5" alt="Contact" />,
      label: t('schools.contactInfo'),
      completed: currentStep > 2,
    },
    {
      id: 3,
      step: 3,
      icon: <img src={LocationIcon} className="h-5 w-5" alt="Address" />,
      label: t('schools.address'),
      completed: currentStep > 3,
    },
    {
      id: 4,
      step: 4,
      icon: <img src={DiamondIcon} className="h-5 w-5" alt="Facilities" />,
      label: t('schools.facilities'),
      completed: currentStep > 4,
    },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  //   const handlePrevious = () => {
  //     if (currentStep > 1) {
  //       setCurrentStep((prev) => prev - 1);
  //     }
  //   };

  const handleSubmit = async () => {
    try {
      // TODO: Implement API call for create/update
      console.log('Form Data:', formData);
      console.log('Files:', files);
      console.log('Mode:', mode);
      console.log('School ID:', schoolId);

      // For now, just navigate back
      navigate('/dashboard/schools');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Form Content */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {currentStep === 1 && (
          <BasicInfoStep
            formData={formData}
            onInputChange={handleInputChange}
            onRadioChange={handleRadioChange}
            onCheckboxChange={handleApplicationFeatureChange}
            onLogoUpload={handleFileUpload('logo')}
            logoFileName={files.logo?.name}
          />
        )}

        {currentStep === 2 && (
          <ContactInfoStep
            formData={formData}
            onInputChange={handleInputChange}
            onPhoneChange={handlePhoneChange}
            onCheckboxChange={handleCheckboxChange}
          />
        )}

        {currentStep === 3 && (
          <AddressStep
            formData={formData}
            onInputChange={handleInputChange}
            onRadioChange={handleRadioChange}
          />
        )}

        {currentStep === 4 && (
          <FacilitiesStep
            formData={formData}
            onCheckboxChange={handleFacilityChange}
            onImageUpload={handleFileUpload('image')}
            onCertificateUpload={handleFileUpload('certificate')}
            onImageDelete={handleFileDelete('image')}
            onCertificateDelete={handleFileDelete('certificate')}
            imageFileName={files.image?.name}
            certificateFileName={files.certificate?.name}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-end p-6">
          {/* <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            {t('common.previous')}
          </Button> */}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/schools')}>
              {t('common.cancel')}
            </Button>

            {currentStep < 4 ? (
              <Button variant="primary" onClick={handleNext}>
                {t('common.next')}
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit}>
                {mode === 'add' ? t('schools.addSchool') : t('schools.updateSchool')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolForm;
