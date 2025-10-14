import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import StepIndicator from '@gradex/shared/components/StepIndicator';
import Button from '@gradex/shared/components/Button';
import PopupMessage from '@gradex/shared/components/PopupMessage';
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
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';

interface SchoolFormProps {
  mode: 'add' | 'edit' | 'view';
  initialData?: SchoolFormData;
  schoolId?: string;
  showRejectedLabel?: boolean;
}

const SchoolForm = ({
  mode,
  initialData,
  schoolId,
  showRejectedLabel = false,
}: SchoolFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const {
    form,
    files,
    fileErrors,
    handleFileUpload,
    handleFileDelete,
    validateCurrentStep,
    validateFiles,
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

  /**
   * Handle moving to next step with validation
   */
  const handleNext = async () => {
    if (currentStep < 4) {
      // Validate current step before proceeding
      const isValid = await validateCurrentStep(currentStep);

      // For step 1, also validate logo file (only logo, not certificate)
      let filesValid = true;
      if (currentStep === 1) {
        filesValid = validateFiles(1); // Only validate files for step 1
      }

      if (isValid && filesValid) {
        // Clear all errors before moving to next step
        form.clearErrors();
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  /**
   * Handle moving to previous step
   */
  const handlePrevious = () => {
    if (currentStep > 1) {
      // Clear all errors when going back
      form.clearErrors();
      setCurrentStep((prev) => prev - 1);
    }
  };

  /**
   * Handle form submission with validation
   */
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Validate all steps before submission
      const isValid = await validateCurrentStep(4);
      // Validate all required files (logo and certificate)
      const filesValid = validateFiles(); // No parameter = validate all files

      if (!isValid || !filesValid) {
        console.error('Form validation failed');
        return;
      }

      // TODO: Implement API call for create/update
      console.log('Form Data:', data);
      console.log('Files:', files);
      console.log('Mode:', mode);
      console.log('School ID:', schoolId);

      // Show success popup
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  });

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    navigate('/dashboard/schools');
  };

  return (
    <FormProvider {...form}>
      {/* Success Popup */}
      {showSuccessPopup && (
        <PopupMessage
          type="success"
          message={mode === 'add' ? 'schools.schoolAdded' : 'schools.schoolUpdated'}
          iconSrc={BigSuccessIcon}
          autoClose={false}
          onClose={handleCloseSuccessPopup}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Form Content */}
        <div className="rounded-lg border border-gray-200 bg-white">
          {currentStep === 1 && (
            <BasicInfoStep
              onLogoUpload={handleFileUpload('logo')}
              logoFileName={files.logo?.name}
              logoError={fileErrors.logo}
              readOnly={mode === 'view'}
              showRejectedLabel={showRejectedLabel}
            />
          )}

          {currentStep === 2 && <ContactInfoStep readOnly={mode === 'view'} />}

          {currentStep === 3 && <AddressStep readOnly={mode === 'view'} />}

          {currentStep === 4 && (
            <FacilitiesStep
              onImageUpload={handleFileUpload('image')}
              onCertificateUpload={handleFileUpload('certificate')}
              onImageDelete={handleFileDelete('image')}
              onCertificateDelete={handleFileDelete('certificate')}
              imageFileName={files.image?.name}
              certificateFileName={files.certificate?.name}
              certificateError={fileErrors.certificate}
              readOnly={mode === 'view'}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6">
            {/* Previous Button */}
            <div>
              {currentStep > 1 && mode !== 'view' && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  {t('common.previous')}
                </Button>
              )}
            </div>

            {/* Next/Save/Cancel Buttons */}
            <div className="flex gap-3">
              {mode === 'view' ? (
                // View mode - only show Next button
                <>
                  {currentStep < 4 && (
                    <Button type="button" variant="primary" onClick={handleNext}>
                      {t('common.next')}
                    </Button>
                  )}
                </>
              ) : (
                // Add/Edit mode - show Cancel and Next/Save buttons
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/schools')}
                  >
                    {t('common.cancel')}
                  </Button>

                  {currentStep < 4 ? (
                    <Button type="button" variant="primary" onClick={handleNext}>
                      {t('common.next')}
                    </Button>
                  ) : (
                    <Button type="submit" variant="primary">
                      {t('common.save')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default SchoolForm;
