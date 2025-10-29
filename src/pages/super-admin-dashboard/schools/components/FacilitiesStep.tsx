import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import FormField from '@gradex/shared/components/FormField';
import FileUpload from '@gradex/shared/components/FileUpload';
import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';
import type { SchoolFormData } from '../types/school.types';
import {
  fetchFacilities,
  selectFacilities,
  selectIsLoadingFacilities,
} from '@gradex/redux/features/lookups';
import i18n from '@/i18n';

interface FacilitiesStepProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCertificateUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete?: () => void;
  onCertificateDelete?: () => void;
  imageFileName?: string;
  certificateFileName?: string;
  certificateError?: string;
  readOnly?: boolean;
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
  certificateFileName,
  certificateError,
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { watch, setValue, trigger } = useFormContext<SchoolFormData>();

  const currentLang = i18n.language as 'ar' | 'en';

  const facilities = useSelector(selectFacilities);
  const isLoadingFacilities = useSelector(selectIsLoadingFacilities);

  const selectedFacilities = watch('facilities');

  useEffect(() => {
    dispatch(fetchFacilities());
  }, [dispatch]);

  return (
    <div className="space-y-8 p-4">
      {/* Facilities Section */}
      <div className="space-y-4">
        <h3 className="text-right text-lg font-semibold text-gray-900">
          {t('schools.facilitiesSection')}
        </h3>

        <FormField label={t('schools.facilitiesSection')} required>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {isLoadingFacilities ? (
              <p className="text-gray-500">{t('common.loading')}</p>
            ) : (
              facilities.map((facility) => (
                <CustomCheckbox
                  key={facility.id}
                  name={facility.id}
                  checked={selectedFacilities?.includes(facility.id) || false}
                  onChange={(checked) => {
                    const currentFacilities = selectedFacilities || [];
                    if (checked) {
                      setValue('facilities', [...currentFacilities, facility.id]);
                    } else {
                      setValue(
                        'facilities',
                        currentFacilities.filter((id) => id !== facility.id)
                      );
                    }
                    trigger('facilities');
                  }}
                  label={currentLang === 'ar' ? facility.arabicName : facility.englishName}
                  disabled={readOnly}
                />
              ))
            )}
          </div>
        </FormField>
      </div>

      {/* Images Upload Section */}
      {!readOnly && (
        <FileUpload
          label={t('schools.images')}
          accept="image/*,.svg,.jpg,.jpeg,.png"
          onChange={onImageUpload}
          onDelete={onImageDelete}
          fileName={imageFileName}
          uploadText={t('schools.uploadMedia')}
        />
      )}

      {/* Certificates Upload Section */}
      {!readOnly && (
        <div>
          <FileUpload
            label={t('schools.certificates')}
            accept="image/*,.svg,.jpg,.jpeg,.png,.pdf"
            onChange={onCertificateUpload}
            onDelete={onCertificateDelete}
            fileName={certificateFileName}
            uploadText={t('schools.uploadMedia')}
            required={true}
          />
          {certificateError && (
            <p className="mt-1 text-right text-xs text-red-600">{t(certificateError)}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FacilitiesStep;
