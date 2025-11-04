import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import FormField from '@gradex/shared/components/FormField';
import FileUpload from '@gradex/shared/components/FileUpload';
import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';
import type { SchoolFormData, FacilityDetails } from '../types/school.types';
import {
  fetchFacilities,
  selectFacilities,
  selectIsLoadingFacilities,
} from '@gradex/redux/features/lookups';
import i18n from '@/i18n';
import AddFacilityDetailsPopup from '../popups/AddFacilityDetailsPopup';

interface FacilitiesStepProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCertificateUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete?: (index?: number) => void;
  onCertificateDelete?: (index?: number) => void;
  imageFileName?: string;
  imageFileNames?: string[];
  certificateFileName?: string;
  certificateFileNames?: string[];
  certificateError?: string;
  readOnly?: boolean;
  showValidationErrors?: boolean;
}

/**
 * FacilitiesStep - Fourth and final step in school form with react-hook-form integration
 * Includes facility checkboxes and file uploads for images and certificates
 */
const FacilitiesStep: React.FC<FacilitiesStepProps> = ({
  onImageUpload,
  onCertificateUpload,
  onImageDelete,
  onCertificateDelete,
  imageFileName,
  imageFileNames,
  certificateFileName,
  certificateFileNames,
  certificateError,
  readOnly = false,
  showValidationErrors = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<SchoolFormData>();

  const currentLang = i18n.language as 'ar' | 'en';

  const facilities = useSelector(selectFacilities);
  const isLoadingFacilities = useSelector(selectIsLoadingFacilities);

  const facilityDetails = watch('facilityDetails') || {};

  const [showAddDetailsPopup, setShowAddDetailsPopup] = useState(false);
  const [selectedFacilityForDetails, setSelectedFacilityForDetails] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [certificateTouched, setCertificateTouched] = useState(false);

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  useEffect(() => {
    if (showValidationErrors) {
      setCertificateTouched(true);
    }
  }, [showValidationErrors]);

  const handleAddDetailsClick = (facilityId: string, facilityName: string) => {
    setSelectedFacilityForDetails({ id: facilityId, name: facilityName });
    setShowAddDetailsPopup(true);
  };

  const handleSaveFacilityDetails = (details: FacilityDetails) => {
    const currentDetails = facilityDetails || {};
    setValue('facilityDetails', {
      ...currentDetails,
      [details.id]: details,
    });
    setShowAddDetailsPopup(false);
    setSelectedFacilityForDetails(null);
  };

  const handleCancelAddDetails = () => {
    setShowAddDetailsPopup(false);
    setSelectedFacilityForDetails(null);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Facilities Section */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <h3 className="text-right text-lg font-semibold text-gray-900">
          {t('schools.facilitiesSection')}
        </h3>

        <FormField
          label={t('schools.facilitiesSection')}
          required
          error={errors.facilities?.message ? t(errors.facilities.message) : undefined}
        >
          <Controller
            name="facilities"
            control={control}
            render={({ field }) => (
              <>
                {isLoadingFacilities ? (
                  <div className="text-center text-sm text-gray-500">{t('common.loading')}</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {facilities.map((facility) => {
                      const isChecked = field.value?.includes(facility.id) || false;
                      const hasDetails = !!facilityDetails[facility.id];
                      const facilityName =
                        currentLang === 'ar' ? facility.arabicName : facility.englishName;

                      return (
                        <div key={facility.id} className="flex items-center gap-2">
                          <CustomCheckbox
                            name={facility.id}
                            checked={isChecked}
                            onChange={(checked) => {
                              const currentFacilities = field.value || [];
                              if (checked) {
                                field.onChange([...currentFacilities, facility.id]);
                              } else {
                                field.onChange(
                                  currentFacilities.filter((id: string) => id !== facility.id)
                                );
                                // Remove facility details when unchecked
                                const currentDetails = { ...facilityDetails };
                                delete currentDetails[facility.id];
                                setValue('facilityDetails', currentDetails);
                              }
                              // Mark field as touched and trigger validation
                              field.onBlur();
                              trigger('facilities');
                            }}
                            label={facilityName}
                            disabled={readOnly}
                          />

                          {/* Add Details Button */}
                          {isChecked && !readOnly && (
                            <button
                              type="button"
                              onClick={() => handleAddDetailsClick(facility.id, facilityName)}
                              className="whitespace-nowrap rounded-lg py-1 text-xs font-bold text-green-700 transition-colors"
                            >
                              {hasDetails ? '✓ ' : ''}
                              {t('schools.addData')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          />

          {/* Other Facility Option */}
          <div className="mt-4 space-y-3">
            <Controller
              name="hasOtherFacility"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-2">
                  <CustomCheckbox
                    name="hasOtherFacility"
                    checked={field.value || false}
                    onChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) {
                        setValue('otherFacilityName', '');
                        const currentDetails = { ...facilityDetails };
                        delete currentDetails['other'];
                        setValue('facilityDetails', currentDetails);
                      }
                      // Mark field as touched and trigger validation
                      field.onBlur();
                      trigger('hasOtherFacility');
                      trigger('facilities');
                    }}
                    label={t('schools.otherFacility')}
                    disabled={readOnly}
                  />

                  {/* Add Details Button for Other Facility */}
                  {field.value && !readOnly && (
                    <Controller
                      name="otherFacilityName"
                      control={control}
                      render={({ field: nameField }) => (
                        <button
                          type="button"
                          onClick={() =>
                            handleAddDetailsClick(
                              'other',
                              nameField.value || t('schools.otherFacility')
                            )
                          }
                          className="whitespace-nowrap rounded-lg py-1 text-xs font-bold text-green-700 transition-colors"
                        >
                          {facilityDetails['other'] ? '✓ ' : ''}
                          {t('schools.addData')}
                        </button>
                      )}
                    />
                  )}
                </div>
              )}
            />

            {/* Other Facility Name Input  */}
            <Controller
              name="hasOtherFacility"
              control={control}
              render={({ field: hasOtherField }) => (
                <>
                  {hasOtherField.value && !readOnly && (
                    <Controller
                      name="otherFacilityName"
                      control={control}
                      render={({ field: nameField, fieldState: nameFieldState }) => (
                        <div className="mr-8 mt-2">
                          <input
                            type="text"
                            value={nameField.value || ''}
                            onChange={(e) => {
                              nameField.onChange(e.target.value);
                              // Only trigger validation if field was touched
                              if (nameFieldState.isTouched) {
                                trigger('otherFacilityName');
                              }
                            }}
                            onBlur={nameField.onBlur}
                            placeholder={t('schools.enterOtherFacilityName')}
                            className={`w-full rounded-lg border px-4 py-2 text-right text-gray-700 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              errors.otherFacilityName && nameFieldState.isTouched
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                          />
                          {errors.otherFacilityName?.message && nameFieldState.isTouched && (
                            <p className="mt-1 text-right text-xs text-red-600">
                              {t(errors.otherFacilityName.message)}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  )}
                </>
              )}
            />
          </div>
        </FormField>
      </div>

      {/* Images Upload Section - Multiple Files */}
      {!readOnly && (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <FormField label={t('schools.images')} optional>
            <FileUpload
              label=""
              accept="image/*,.svg,.jpg,.jpeg,.png"
              onChange={onImageUpload}
              onDelete={onImageDelete}
              fileNames={imageFileNames || (imageFileName ? imageFileName.split(', ') : [])}
              uploadText={t('schools.uploadMedia')}
              multiple={true}
            />
          </FormField>
        </div>
      )}

      {/* Certificates Upload Section - Multiple Files */}
      {!readOnly && (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <FormField
            label={t('schools.certificates')}
            required
            error={certificateError && certificateTouched ? t(certificateError) : undefined}
          >
            <FileUpload
              label=""
              accept="image/*,.svg,.jpg,.jpeg,.png,.pdf"
              onChange={(e) => {
                setCertificateTouched(true);
                onCertificateUpload(e);
              }}
              onDelete={(index) => {
                setCertificateTouched(true);
                if (onCertificateDelete) {
                  onCertificateDelete(index);
                }
              }}
              fileNames={
                certificateFileNames || (certificateFileName ? certificateFileName.split(', ') : [])
              }
              uploadText={t('schools.uploadMedia')}
              required={true}
              multiple={true}
              error={!!certificateError && certificateTouched}
            />
          </FormField>
        </div>
      )}

      {/* Add Facility Details Popup */}
      {showAddDetailsPopup && selectedFacilityForDetails && (
        <AddFacilityDetailsPopup
          facilityId={selectedFacilityForDetails.id}
          facilityName={selectedFacilityForDetails.name}
          existingDetails={facilityDetails[selectedFacilityForDetails.id]}
          onConfirm={handleSaveFacilityDetails}
          onCancel={handleCancelAddDetails}
        />
      )}
    </div>
  );
};

export default FacilitiesStep;
