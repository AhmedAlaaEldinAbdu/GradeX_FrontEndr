import React from 'react';
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
}) => {
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
            />

            <CustomCheckbox
              name="library"
              checked={formData.facilities.library}
              onChange={(checked) => onCheckboxChange('library', checked)}
              label="مكتبة"
            />

            <CustomCheckbox
              name="laboratory"
              checked={formData.facilities.laboratory}
              onChange={(checked) => onCheckboxChange('laboratory', checked)}
              label="معمل"
            />

            <CustomCheckbox
              name="sportField"
              checked={formData.facilities.sportField}
              onChange={(checked) => onCheckboxChange('sportField', checked)}
              label="ملاعب رياضية"
            />

            <CustomCheckbox
              name="canteen"
              checked={formData.facilities.canteen}
              onChange={(checked) => onCheckboxChange('canteen', checked)}
              label="كافتيريا"
            />

            <CustomCheckbox
              name="busService"
              checked={formData.facilities.busService}
              onChange={(checked) => onCheckboxChange('busService', checked)}
              label="حافلات"
            />
          </div>
        </FormField>
      </div>

      {/* Images Upload Section */}
      <FileUpload
        label="الصور"
        accept="image/*,.svg,.jpg,.jpeg,.png"
        onChange={onImageUpload}
        onDelete={onImageDelete}
        fileName={imageFileName}
        uploadText="اضغط هنا للإضافة صورة أو فيديو أو ملف GIF أو SVG, JPG, PNG"
      />

      {/* Certificates Upload Section */}
      <FileUpload
        label="الشهادات"
        accept="image/*,.svg,.jpg,.jpeg,.png,.pdf"
        onChange={onCertificateUpload}
        onDelete={onCertificateDelete}
        fileName={certificateFileName}
        uploadText="اضغط هنا للإضافة صورة أو فيديو أو ملف GIF أو SVG, JPG, PNG"
      />
    </div>
  );
};

export default FacilitiesStep;
