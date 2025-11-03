import { useToast } from '@/shared/context/ToastContext';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FileUpload from '@gradex/shared/components/FileUpload';
import type { FacilityDetails } from '../types/school.types';
import FormField from '@/shared/components/FormField';

interface AddFacilityDetailsPopupProps {
  facilityId: string;
  facilityName: string;
  existingDetails?: FacilityDetails;
  onConfirm: (details: FacilityDetails) => void;
  onCancel: () => void;
}

export default function AddFacilityDetailsPopup({
  facilityId,
  existingDetails,
  onConfirm,
  onCancel,
}: AddFacilityDetailsPopupProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [description, setDescription] = useState(existingDetails?.description || '');
  const [imageFile, setImageFile] = useState<File | null>(existingDetails?.imageFile || null);
  const [imageFileName, setImageFileName] = useState<string | undefined>(
    existingDetails?.imageFile?.name
  );

  const popupRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  }, [onCancel]);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) handleClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClose]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageFileName(file.name);
    }
  };

  const handleImageDelete = () => {
    setImageFile(null);
    setImageFileName(undefined);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      showToast({
        message: t('common.validation.required'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    const facilityDetails: FacilityDetails = {
      id: facilityId,
      description,
      imageFile: imageFile,
      imageUrl: existingDetails?.imageUrl || null,
      oldFacilitiesFilePath: existingDetails?.oldFacilitiesFilePath || [],
    };

    onConfirm(facilityDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative max-h-[90vh] w-[500px] transform overflow-y-auto rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute left-3 top-2 text-xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 border-b pb-4">
            <h2 className="text-2xl font-medium text-gray-800">{t('schools.addFacilityData')}</h2>
          </div>

          {/* Description Field */}
          <div className="w-full text-right">
            <FormField label={t('schools.facilityDescription')} optional>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('schools.enterFacilityDescription')}
                rows={4}
                className="w-full resize-none rounded-lg border px-4 py-2 text-right text-gray-700 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </FormField>
          </div>

          {/* Image Upload */}
          <FileUpload
            label={t('schools.facilityImages')}
            accept="image/*,.svg,.jpg,.jpeg,.png"
            onChange={handleImageUpload}
            onDelete={handleImageDelete}
            fileName={imageFileName}
            uploadText={t('schools.uploadMedia')}
            optional={true}
          />

          {/* Action Buttons */}
          <div className="flex w-full justify-center gap-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-grow rounded-xl border border-green-700 px-5 py-2 text-green-700 transition-colors duration-200 hover:bg-green-50"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-grow rounded-xl bg-green-700 px-5 py-2 text-white transition-colors duration-200 hover:bg-green-800"
            >
              {t('common.add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
