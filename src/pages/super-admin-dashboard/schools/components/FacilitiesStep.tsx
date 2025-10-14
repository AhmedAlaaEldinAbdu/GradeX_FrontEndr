import React from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '@gradex/shared/components/FormField';
import FileUpload from '@gradex/shared/components/FileUpload';
import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';

interface FacilitiesStepProps {
  formData: {
    facilities: {
      playground: boolean;
      library: boolean;
      laboratory: boolean;
      sportField: boolean;
      canteen: boolean;
      busService: boolean;
    };
  };
  onCheckboxChange: (name: string, checked: boolean) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCertificateUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete?: () => void;
  onCertificateDelete?: () => void;
  imageFileName?: string;
  certificateFileName?: string;
  readOnly?: boolean;
}

const FacilitiesStep: React.FC<FacilitiesStepProps> = ({
  formData,
  onCheckboxChange,
  onImageUpload,
  onCertificateUpload,
  onImageDelete,
  onCertificateDelete,
  imageFileName,
  certificateFileName,
  readOnly = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 p-4">
      {/* Facilities Section */}
      <div className="space-y-4">
        <h3 className="text-right text-lg font-semibold text-gray-900">المرافق</h3>

        <FormField label="المرافق" required>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomCheckbox
              name="playground"
              checked={formData.facilities.playground}
              onChange={(checked) => onCheckboxChange('playground', checked)}
              label="ملعب"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="library"
              checked={formData.facilities.library}
              onChange={(checked) => onCheckboxChange('library', checked)}
              label="مكتبة"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="laboratory"
              checked={formData.facilities.laboratory}
              onChange={(checked) => onCheckboxChange('laboratory', checked)}
              label="معمل"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="sportField"
              checked={formData.facilities.sportField}
              onChange={(checked) => onCheckboxChange('sportField', checked)}
              label="ملاعب رياضية"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="canteen"
              checked={formData.facilities.canteen}
              onChange={(checked) => onCheckboxChange('canteen', checked)}
              label="كافتيريا"
              disabled={readOnly}
            />

            <CustomCheckbox
              name="busService"
              checked={formData.facilities.busService}
              onChange={(checked) => onCheckboxChange('busService', checked)}
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
