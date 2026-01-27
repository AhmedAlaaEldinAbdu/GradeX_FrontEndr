import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import StepIndicator from '@gradex/shared/components/StepIndicator';
import Button from '@gradex/shared/components/Button';
import PopupMessage from '@/shared/popups/PopupMessage';
import BasicInfoStep from './BasicInfoStep';
import AddressStep from './AddressStep';
import ContactInfoStep from './ContactInfoStep';
import FacilitiesStep from './FacilitiesStep';
import { useSchoolForm } from '../hooks/useSchoolForm';
import type { SchoolFormData } from '../types/school.types';
import { transformSchoolFormBackend } from '../utils/school-form.transformer';
import { logFormData } from '@/shared/common/common';
import {
  createSchoolWithFormData,
  selectIsCreating,
  selectValidationErrors,
} from '@gradex/redux/features/schools';
import { useToast } from '@/shared/context/ToastContext';
import type { ValidationErrorResponse } from '@/services/api/config';
import LocationIcon from '@gradex/assets/icons/location-fill.svg';
import PhoneIcon from '@gradex/assets/icons/phone-fill.svg';
import DiamondIcon from '@gradex/assets/icons/Diamond.svg';
import FileIcon from '@gradex/assets/icons/File.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import CustomImage from '@/shared/components/CustomImage';

interface SchoolFormProps {
  mode: 'add' | 'edit' | 'view';
  initialData?: SchoolFormData & {
    licenseFiles?: string[];
    imageFiles?: string[];
    certificateFiles?: string[];
    branches?: Array<{
      country: string;
      region: string;
      city: string;
      district: string;
      street: string;
      buildingNumber: string;
      postalCode: string;
      latitude?: number;
      longitude?: number;
    }>;
  };
  schoolId?: string;
  showRejectedLabel?: boolean;
  showPendingLabel?: boolean;
}

const SchoolForm = ({
  mode,
  initialData,
  schoolId,
  showRejectedLabel = false,
  showPendingLabel = false,
}: SchoolFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [branches, setBranches] = useState<
    Array<{
      country: string;
      region: string;
      city: string;
      district: string;
      street: string;
      buildingNumber: string;
      postalCode: string;
      latitude?: number;
      longitude?: number;
    }>
  >([]);

  const isCreating = useSelector(selectIsCreating);
  const validationErrors = useSelector(selectValidationErrors);

  // Initialize branches from initialData when in edit/view mode
  useEffect(() => {
    if (initialData?.branches && initialData.branches.length > 0) {
      console.log('📋 SchoolForm: Initializing branches from initialData:', initialData.branches);
      setBranches(initialData.branches);
    }
  }, [initialData]);

  // Show validation errors in toast when they occur
  useEffect(() => {
    if (validationErrors) {
      // Handle array of validation errors
      if (Array.isArray(validationErrors)) {
        validationErrors.forEach((error: ValidationErrorResponse) => {
          showToast({
            message: error.errorMessage,
            type: 'error',
            duration: 5000,
          });
        });
      }
      // Handle object with error messages
      else if (typeof validationErrors === 'object') {
        const errorMessages = Object.values(validationErrors);
        if (errorMessages.length > 0) {
          errorMessages.forEach((errorMsg) => {
            if (typeof errorMsg === 'string') {
              showToast({
                message: errorMsg,
                type: 'error',
                duration: 5000,
              });
            }
          });
        }
      }
    }
  }, [validationErrors, showToast]);

  const {
    form,
    files,
    fileErrors,
    handleFileUpload,
    handleFileDelete,
    validateCurrentStep,
    validateFiles,
    getFileNames,
  } = useSchoolForm(initialData);

  const steps = [
    {
      id: 1,
      step: 1,
      icon: <CustomImage src={FileIcon} className="h-5 w-5" alt="Basic Info" />,
      label: t('schools.basicInfo'),
      completed: currentStep > 1,
    },
    {
      id: 2,
      step: 2,
      icon: <CustomImage src={PhoneIcon} className="h-5 w-5" alt="Contact" />,
      label: t('schools.contactInfo'),
      completed: currentStep > 2,
    },
    {
      id: 3,
      step: 3,
      icon: <CustomImage src={LocationIcon} className="h-5 w-5" alt="Address" />,
      label: t('schools.address'),
      completed: currentStep > 3,
    },
    {
      id: 4,
      step: 4,
      icon: <CustomImage src={DiamondIcon} className="h-5 w-5" alt="Facilities" />,
      label: t('schools.facilities'),
      completed: currentStep > 4,
    },
  ];

  /**
   * Handle moving to next step with validation
   */
  const handleNext = async () => {
    if (currentStep < 4) {
      // In view mode, skip validation and just move to next step
      if (mode === 'view') {
        setCurrentStep((prev) => prev + 1);
        return;
      }

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
  const onFormSubmit = async (data: SchoolFormData) => {
    try {
      const backendFormData = transformSchoolFormBackend(data, files, branches);

      if (import.meta.env.DEV) {
        logFormData(backendFormData);
      }

      if (mode === 'add') {
        const resultAction = await dispatch(createSchoolWithFormData(backendFormData));

        if (createSchoolWithFormData.fulfilled.match(resultAction)) {
          // Success - show popup
          setShowPopupMessage({
            show: true,
            type: 'success',
            message: t('schools.schoolAdded'),
          });
        }
      } else if (mode === 'edit' && schoolId) {
        console.log('Update school:', schoolId, backendFormData);
        setShowPopupMessage({
          show: true,
          type: 'success',
          message: t('schools.schoolUpdated'),
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);
    await form.trigger([
      'facilities',
      'hasOtherFacility',
      'otherFacilityName',
      'otherFacilityNameAr',
      'otherFacilityNameEn',
    ]);
    const isValid = await validateCurrentStep(4);
    const filesValid = validateFiles();
    if (!isValid || !filesValid) {
      console.error('Form validation failed');
      return;
    }
    form.handleSubmit(onFormSubmit)(e);
  };

  const handleCloseSuccessPopup = () => {
    setShowPopupMessage({ ...showPopupMessage, show: false });
    navigate('/schools');
  };

  return (
    <FormProvider {...form}>
      {/* Success Popup */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={false}
        onClose={handleCloseSuccessPopup}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Form Content */}
        <div className="rounded-lg border border-gray-200 bg-white">
          {currentStep === 1 && (
            <BasicInfoStep
              onLogoUpload={handleFileUpload('license')}
              onLogoDelete={handleFileDelete('license')}
              licenseFileNames={
                mode === 'view'
                  ? initialData?.licenseFiles || []
                  : [...(initialData?.licenseFiles || []), ...getFileNames('license')]
              }
              licenseError={fileErrors.license}
              readOnly={mode === 'view'}
              showRejectedLabel={showRejectedLabel}
              showPendingLabel={showPendingLabel}
            />
          )}

          {currentStep === 2 && <ContactInfoStep readOnly={mode === 'view'} />}

          {currentStep === 3 && (
            <AddressStep
              readOnly={mode === 'view'}
              initialBranches={branches}
              onBranchesChange={setBranches}
            />
          )}

          {currentStep === 4 && (
            <FacilitiesStep
              onImageUpload={handleFileUpload('image')}
              onCertificateUpload={handleFileUpload('certificate')}
              onImageDelete={handleFileDelete('image')}
              onCertificateDelete={handleFileDelete('certificate')}
              imageFileNames={
                mode === 'view'
                  ? initialData?.imageFiles || []
                  : [...(initialData?.imageFiles || []), ...getFileNames('image')]
              }
              certificateFileNames={
                mode === 'view'
                  ? initialData?.certificateFiles || []
                  : [...(initialData?.certificateFiles || []), ...getFileNames('certificate')]
              }
              certificateError={fileErrors.certificate}
              readOnly={mode === 'view'}
              showValidationErrors={showValidationErrors}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6">
            {/* Previous Button */}
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  {t('common.previous')}
                </Button>
              )}
            </div>

            {/* Next/Save/Cancel Buttons */}
            <div className="flex gap-3">
              {mode === 'view' ? (
                // View mode - show Next button and Back to list
                <>
                  <Button type="button" variant="outline" onClick={() => navigate('/schools')}>
                    {t('common.backToList')}
                  </Button>
                  {currentStep < 4 && (
                    <Button type="button" variant="primary" onClick={handleNext}>
                      {t('common.next')}
                    </Button>
                  )}
                </>
              ) : (
                // Add/Edit mode - show Cancel and Next/Save buttons
                <>
                  <Button type="button" variant="outline" onClick={() => navigate('/schools')}>
                    {t('common.cancel')}
                  </Button>

                  {currentStep < 4 ? (
                    <Button type="button" variant="primary" onClick={handleNext}>
                      {t('common.next')}
                    </Button>
                  ) : (
                    <Button type="submit" variant="primary" disabled={isCreating}>
                      {isCreating ? t('common.saving') : t('common.save')}
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
