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
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext<SchoolFormData>();

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
              onChange={(checked) => setValue('facilities.playground', checked)}
              label="ملعب"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="library"
              checked={facilities.library}
              onChange={(checked) => setValue('facilities.library', checked)}
              label="مكتبة"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="laboratory"
              checked={facilities.laboratory}
              onChange={(checked) => setValue('facilities.laboratory', checked)}
              label="معمل"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="sportField"
              checked={facilities.sportField}
              onChange={(checked) => setValue('facilities.sportField', checked)}
              label="ملاعب رياضية"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="canteen"
              checked={facilities.canteen}
              onChange={(checked) => setValue('facilities.canteen', checked)}
              label="كافتيريا"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="busService"
              checked={facilities.busService}
              onChange={(checked) => setValue('facilities.busService', checked)}
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
        <FileUpload
          label="الشهادات"
          accept="image/*,.svg,.jpg,.jpeg,.png,.pdf"
          onChange={onCertificateUpload}
          onDelete={onCertificateDelete}
          fileName={certificateFileName}
          uploadText={t('schools.uploadMedia')}
        />
      )}
    </div>
  );
};

export default FacilitiesStep;
