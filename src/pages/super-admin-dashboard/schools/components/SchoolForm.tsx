import { useState, useEffect, useRef } from 'react';
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
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import type { SchoolFormData } from '../types/school.types';
import {
  transformSchoolFormBackend,
  type ExistingImageAttachment,
  type ExistingLicenseAttachment,
} from '../utils/school-form.transformer';
import { fetchExistingFileAsUpload } from '../utils/existing-file-upload';
import { logFormData } from '@/shared/common/common';
import {
  createSchoolWithFormData,
  updateSchoolWithFormData,
  selectIsCreating,
  selectIsUpdating,
  selectValidationErrors,
} from '@gradex/redux/features/schools';
import { selectFacilities } from '@gradex/redux/features/lookups';
import { useToast } from '@/shared/context/ToastContext';
import type { ValidationErrorResponse } from '@/services/api/config';
import LocationFillGreenIcon from '@gradex/assets/icons/LocationFillGreen.svg';
import PhoneFillGreenIcon from '@gradex/assets/icons/PhoneFillGreen.svg';
import DiamondFillGreenIcon from '@gradex/assets/icons/DiamondFillGreen.svg';
import FilesFillGreenIcon from '@gradex/assets/icons/FilesFillGreen.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import CustomImage from '@/shared/components/CustomImage';

const TEMP_DISABLE_EDIT_SCHOOL_VALIDATION = true;

interface SchoolFormProps {
  mode: 'add' | 'edit' | 'view';
  initialData?: SchoolFormData & {
    licenseFiles?: ExistingLicenseAttachment[];
    imageFiles?: ExistingImageAttachment[];
    certificateFiles?: string[];
    logoFile?: string;
    branches?: Array<{
      country: string;
      region: string;
      city: string;
      district: string;
      street: string;
      buildingNumber: string;
      postalCode: string;
      logo?: string;
      logoFile?: File;
      schoolImageFiles?: File[];
      existingSchoolImages?: ExistingImageAttachment[];
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
      logo?: string;
      logoFile?: File;
      schoolImageFiles?: File[];
      existingSchoolImages?: ExistingImageAttachment[];
      latitude?: number;
      longitude?: number;
    }>
  >([]);

  const [schoolImageFiles, setSchoolImageFiles] = useState<ExistingImageAttachment[]>([]);
  const [existingLogo, setExistingLogo] = useState<string>('');

  const [existingLicenseFiles, setExistingLicenseFiles] = useState<ExistingLicenseAttachment[]>([]);
  const [existingCertificateFiles, setExistingCertificateFiles] = useState<string[]>([]);

  // Ref to prevent accidental submission immediately after navigation
  const justNavigatedToStep4Ref = useRef(false);

  const isCreating = useSelector(selectIsCreating);
  const isUpdating = useSelector(selectIsUpdating);
  const isSubmitting = isCreating || isUpdating;
  const validationErrors = useSelector(selectValidationErrors);
  const lookupFacilities = useSelector(selectFacilities);
  const isEditValidationDisabled = mode === 'edit' && TEMP_DISABLE_EDIT_SCHOOL_VALIDATION;

  // Initialize branches from initialData when in edit/view mode
  useEffect(() => {
    if (initialData?.branches && initialData.branches.length > 0) {
      console.log('📋 SchoolForm: Initializing branches from initialData:', initialData.branches);
      setBranches(initialData.branches);
    }
  }, [initialData]);

  // Initialize school image attachments from initialData (for edit/view mode)
  useEffect(() => {
    if (initialData?.imageFiles && initialData.imageFiles.length > 0) {
      setSchoolImageFiles(initialData.imageFiles);
    } else {
      setSchoolImageFiles([]);
    }
    setExistingLogo(initialData?.logoFile || '');
    setExistingLicenseFiles(initialData?.licenseFiles || []);
    setExistingCertificateFiles(initialData?.certificateFiles || []);
  }, [initialData]);

  const handleExistingLicenseDelete = (index: number) => {
    setExistingLicenseFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExistingCertificateDelete = (index: number) => {
    setExistingCertificateFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
  } = useSchoolForm(initialData, { disableValidation: isEditValidationDisabled });

  const scrollToFirstError = useScrollToFirstError<SchoolFormData>();

  const steps = [
    {
      id: 1,
      step: 1,
      icon: <CustomImage src={FilesFillGreenIcon} className="h-5 w-5" alt="Basic Info" />,
      label: t('schools.basicInfo'),
      completed: currentStep > 1,
    },
    {
      id: 2,
      step: 2,
      icon: <CustomImage src={PhoneFillGreenIcon} className="h-5 w-5" alt="Contact" />,
      label: t('schools.contactInfo'),
      completed: currentStep > 2,
    },
    {
      id: 3,
      step: 3,
      icon: <CustomImage src={LocationFillGreenIcon} className="h-5 w-5" alt="Address" />,
      label: t('schools.address'),
      completed: currentStep > 3,
    },
    {
      id: 4,
      step: 4,
      icon: <CustomImage src={DiamondFillGreenIcon} className="h-5 w-5" alt="Facilities" />,
      label: t('schools.facilities'),
      completed: currentStep > 4,
    },
  ];

  /**
   * Handle moving to next step with validation
   */
  const handleNext = async () => {
    console.log('▶️ handleNext called, currentStep:', currentStep);
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
      if (currentStep === 1 && mode !== 'edit') {
        filesValid = validateFiles(1); // Only validate files for step 1
      }

      if (isValid && filesValid) {
        // Clear all errors before moving to next step
        form.clearErrors();
        console.log('✅ Moving to step:', currentStep + 1);

        // If moving to step 4, set guard to prevent accidental submission
        if (currentStep === 3) {
          justNavigatedToStep4Ref.current = true;
          setTimeout(() => {
            justNavigatedToStep4Ref.current = false;
          }, 500); // Reset after 500ms
        }

        setCurrentStep((prev) => prev + 1);
      } else {
        scrollToFirstError(form.formState.errors);
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
      // Defaults (add mode): send new uploads + keep existing files as stored paths.
      let submitData = data;
      let submitFiles: Parameters<typeof transformSchoolFormBackend>[1] = {
        ...files,
        existingLogo: existingLogo || undefined,
        existingLicenses: existingLicenseFiles,
        existingCertificatePaths: existingCertificateFiles,
      };
      let submitBranches = branches;
      let submitSchoolImages = schoolImageFiles;

      if (mode === 'edit') {
        const schoolImageUploads: File[] = [];
        const keptSchoolImages: ExistingImageAttachment[] = [];
        await Promise.all(
          schoolImageFiles.map(async (a) => {
            const file = await fetchExistingFileAsUpload(a.attachmentFile);
            if (file) schoolImageUploads.push(file);
            else keptSchoolImages.push(a);
          })
        );

        submitFiles = {
          ...files,
          image: [...files.image, ...schoolImageUploads],
          license: files.license,

          // Existing licenses are kept by id only; new licenses are sent through files.license.
          existingLogo: existingLogo || undefined,
          existingLicenses: existingLicenseFiles,
          existingCertificatePaths: existingCertificateFiles,
        };
        submitSchoolImages = keptSchoolImages;

        // Additional branches: same treatment for their images.
        submitBranches = await Promise.all(
          branches.map(async (b) => {
            const branchUploads: File[] = [];
            const keptBranchImages: ExistingImageAttachment[] = [];
            await Promise.all(
              (b.existingSchoolImages || []).map(async (a) => {
                const file = await fetchExistingFileAsUpload(a.attachmentFile);
                if (file) branchUploads.push(file);
                else keptBranchImages.push(a);
              })
            );
            return {
              ...b,
              schoolImageFiles: [...(b.schoolImageFiles || []), ...branchUploads],
              existingSchoolImages: keptBranchImages,
            };
          })
        );

        // Facility images: re-fetch into imageFile when no new image was picked.
        if (data.facilityDetails) {
          const entries = await Promise.all(
            Object.entries(data.facilityDetails).map(async ([key, detail]) => {
              if (!detail.imageFile && detail.imageUrl) {
                const file = await fetchExistingFileAsUpload(detail.imageUrl);
                if (file) return [key, { ...detail, imageFile: file }] as const;
              }
              return [key, detail] as const;
            })
          );
          submitData = { ...data, facilityDetails: Object.fromEntries(entries) };
        }
      }

      const backendFormData = transformSchoolFormBackend(
        submitData,
        submitFiles,
        submitBranches,
        submitSchoolImages,
        lookupFacilities
      );

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
        const resultAction = await dispatch(
          updateSchoolWithFormData({ id: schoolId, formData: backendFormData })
        );

        if (updateSchoolWithFormData.fulfilled.match(resultAction)) {
          // Success - show popup
          setShowPopupMessage({
            show: true,
            type: 'success',
            message: t('schools.schoolUpdated'),
          });
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleExistingSchoolImageDelete = (index: number) => {
    setSchoolImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 handleSubmit called, currentStep:', currentStep);

    // Only allow submission when on the final step (step 4)
    if (currentStep !== 4) {
      console.log('❌ Not on step 4, blocking submission');
      return;
    }

    // Block accidental submission immediately after navigating to step 4
    if (justNavigatedToStep4Ref.current) {
      console.log('❌ Just navigated to step 4, blocking accidental submission');
      return;
    }

    console.log('✅ On step 4, proceeding with submission');
    if (!isEditValidationDisabled) {
      setShowValidationErrors(true);
      await form.trigger([
        'facilities',
        'hasOtherFacility',
        'otherFacilityName',
        'otherFacilityNameAr',
        'otherFacilityNameEn',
      ]);
      const isValid = await validateCurrentStep(4);
      // In edit mode the license/certificate files already exist on the server,
      // so re-uploading them is optional and should not block submission.
      const filesValid = mode === 'edit' ? true : validateFiles();
      if (!isValid || !filesValid) {
        console.error('Form validation failed');
        scrollToFirstError(form.formState.errors);
        return;
      }
    }
    form.handleSubmit(onFormSubmit, scrollToFirstError)(e);
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
              onLogoDelete={(index?: number) => handleFileDelete('license', index)()}
              licenseFileNames={
                mode === 'view'
                  ? initialData?.licenseFiles?.map((attachment) => attachment.attachmentFile) || []
                  : getFileNames('license')
              }
              licenseFiles={files.license}
              licenseError={fileErrors.license}
              existingLicenseFiles={
                mode === 'edit'
                  ? existingLicenseFiles.map((attachment) => attachment.attachmentFile)
                  : []
              }
              onExistingLicenseDelete={handleExistingLicenseDelete}
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
              onLogoUpload={handleFileUpload('logo')}
              onLogoDelete={() => handleFileDelete('logo')()}
              logoFileName={files.logo?.[0]?.name}
              existingLogo={existingLogo}
              onExistingLogoDelete={() => setExistingLogo('')}
            />
          )}

          {currentStep === 4 && (
            <FacilitiesStep
              onCertificateUpload={handleFileUpload('certificate')}
              onCertificateDelete={(index?: number) => handleFileDelete('certificate', index)()}
              certificateFileNames={
                mode === 'view' ? initialData?.certificateFiles || [] : getFileNames('certificate')
              }
              certificateFiles={files.certificate}
              certificateError={fileErrors.certificate}
              existingCertificateFiles={mode === 'edit' ? existingCertificateFiles : []}
              onExistingCertificateDelete={handleExistingCertificateDelete}
              readOnly={mode === 'view'}
              showValidationErrors={showValidationErrors}
              onSchoolImageUpload={handleFileUpload('image')}
              onSchoolImageDelete={(index?: number) => handleFileDelete('image', index)()}
              schoolImageFileNames={
                mode === 'view'
                  ? schoolImageFiles.map((a) => a.attachmentFile)
                  : getFileNames('image')
              }
              schoolImageFiles={files.image}
              existingSchoolImages={
                mode === 'edit' ? schoolImageFiles.map((a) => a.attachmentFile) : []
              }
              onExistingSchoolImageDelete={handleExistingSchoolImageDelete}
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
                    <Button key="next-button" type="button" variant="primary" onClick={handleNext}>
                      {t('common.next')}
                    </Button>
                  ) : (
                    <Button
                      key="save-button"
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t('common.saving') : t('common.save')}
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
