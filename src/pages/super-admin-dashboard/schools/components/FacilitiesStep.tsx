import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import FormField from '@gradex/shared/components/FormField';
import FileUpload from '@gradex/shared/components/FileUpload';
import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';
import type { SchoolFormData } from '../types/school.types';

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
  const { watch, setValue, trigger } = useFormContext<SchoolFormData>();

  const facilities = watch('facilities');

  return (
    <div className="space-y-8 p-4">
      {/* Facilities Section */}
      <div className="space-y-4">
        <h3 className="text-right text-lg font-semibold text-gray-900">المرافق</h3>

        <FormField label="المرافق" required>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomCheckbox
              name="playground"
              checked={facilities.playground}
              onChange={(checked) => {
                setValue('facilities.playground', checked);
                trigger('facilities');
              }}
              label="ملعب"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="library"
              checked={facilities.library}
              onChange={(checked) => {
                setValue('facilities.library', checked);
                trigger('facilities');
              }}
              label="مكتبة"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="laboratory"
              checked={facilities.laboratory}
              onChange={(checked) => {
                setValue('facilities.laboratory', checked);
                trigger('facilities');
              }}
              label="معمل"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="sportField"
              checked={facilities.sportField}
              onChange={(checked) => {
                setValue('facilities.sportField', checked);
                trigger('facilities');
              }}
              label="ملاعب رياضية"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="canteen"
              checked={facilities.canteen}
              onChange={(checked) => {
                setValue('facilities.canteen', checked);
                trigger('facilities');
              }}
              label="كافتيريا"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="busService"
              checked={facilities.busService}
              onChange={(checked) => {
                setValue('facilities.busService', checked);
                trigger('facilities');
              }}
              label="حافلات"
              disabled={readOnly}
            />
          </div>
        </FormField>
      </div>

      {/* Images Upload Section */}
      {!readOnly && (
        <FileUpload
          label="الصور"
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
            label="الشهادات"
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
