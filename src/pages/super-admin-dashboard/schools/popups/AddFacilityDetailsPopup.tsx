import { useEffect, useRef, useState, useCallback } from 'react';
import CustomImage from '@/shared/components/CustomImage';
import { useTranslation } from 'react-i18next';
import type { FacilityDetails } from '../types/school.types';
import FormField from '@/shared/components/FormField';
import TextArea from '@/shared/components/TextArea';
import { buildFileUrl } from '../utils/existing-file-upload';

interface AddFacilityDetailsPopupProps {
  open: boolean;
  facilityId: string;
  facilityName: string;
  existingDetails?: FacilityDetails;
  onConfirm: (details: FacilityDetails) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export default function AddFacilityDetailsPopup({
  open,
  facilityId,
  facilityName,
  existingDetails,
  onConfirm,
  onCancel,
  readOnly = false,
}: AddFacilityDetailsPopupProps) {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);
  const [description, setDescription] = useState(existingDetails?.description || '');
  const [imageFile, setImageFile] = useState<File | null>(existingDetails?.imageFile || null);
  const [imageFileName, setImageFileName] = useState<string | undefined>(
    existingDetails?.imageFile?.name ||
      (existingDetails?.imageUrl ? existingDetails.imageUrl.split('/').pop() : undefined)
  );
  const [hasExistingImage, setHasExistingImage] = useState<boolean>(
    !!(existingDetails?.imageFile || existingDetails?.imageUrl)
  );
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  const popupRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  }, [onCancel]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 10);
      setDescription(existingDetails?.description || '');
      setImageFile(existingDetails?.imageFile || null);
      setImageFileName(
        existingDetails?.imageFile?.name ||
          (existingDetails?.imageUrl ? existingDetails.imageUrl.split('/').pop() : undefined)
      );
      setHasExistingImage(!!(existingDetails?.imageFile || existingDetails?.imageUrl));
    } else {
      setIsVisible(false);
    }
  }, [open, existingDetails]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) handleClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClose]);

  useEffect(() => {
    const isPdf = (name?: string) => name?.toLowerCase().endsWith('.pdf') || false;

    if (imageFile && !isPdf(imageFile.name)) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    // Existing image URL (no new file selected)
    if (!imageFile && existingDetails?.imageUrl && !isPdf(existingDetails.imageUrl)) {
      setPreviewUrl(buildFileUrl(existingDetails.imageUrl));
      return;
    }

    setPreviewUrl(undefined);
  }, [imageFile, existingDetails?.imageUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageFileName(file.name);
      setHasExistingImage(true);
    }
  };

  // Check if file is a PDF
  const isPdfFile = (fileName: string | undefined): boolean => {
    return fileName?.toLowerCase().endsWith('.pdf') || false;
  };

  // Handle opening PDF in new tab
  const handleViewPdf = () => {
    if (imageFile && isPdfFile(imageFile.name)) {
      const url = URL.createObjectURL(imageFile);
      window.open(url, '_blank');
    } else if (existingDetails?.imageUrl && isPdfFile(existingDetails.imageUrl)) {
      window.open(buildFileUrl(existingDetails.imageUrl), '_blank');
    }
  };

  const handleImageDelete = () => {
    setImageFile(null);
    setImageFileName(undefined);
    setHasExistingImage(false);
  };

  const handleSubmit = () => {
    const facilityDetails: FacilityDetails = {
      id: facilityId,
      oldFacilityId: existingDetails?.oldFacilityId,
      arabicName: existingDetails?.arabicName,
      englishName: existingDetails?.englishName,
      description,
      imageFile: imageFile,
      imageUrl: existingDetails?.imageUrl || null,
      oldFacilitiesFilePath: existingDetails?.oldFacilitiesFilePath || [],
    };

    onConfirm(facilityDetails);
  };

  if (!open) return null;

  return (
    <div className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
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
            <h2 className="text-2xl font-medium text-gray-800">
              {readOnly ? facilityName : t('schools.addFacilityData')}
            </h2>
          </div>

          {/* Description Field */}
          <div className="w-full text-right">
            <FormField htmlFor="description" label={t('schools.facilityDescription')} optional>
              <TextArea
                id="description"
                value={description}
                onChange={(e) => !readOnly && setDescription(e.target.value)}
                placeholder={readOnly ? '' : t('schools.enterFacilityDescription')}
                rows={4}
                disabled={readOnly}
              />
            </FormField>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="mb-2 block text-right text-sm font-medium text-gray-700">
              {t('schools.facilityImages')}
              <span className="text-xs text-gray-400"> ({t('schools.optional')}) </span>
            </label>

            {/* Upload Area - Show when no image exists and not in read-only mode */}
            {!hasExistingImage && !readOnly && (
              <div className="relative rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-all hover:border-green-500">
                <input
                  type="file"
                  accept="image/*,.svg,.jpg,.jpeg,.png,.pdf"
                  onChange={handleImageUpload}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="flex flex-col items-center gap-2">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M24 16V32M16 24H32"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <rect
                      x="8"
                      y="8"
                      width="32"
                      height="32"
                      rx="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <p className="text-sm text-green-600">{t('schools.uploadMedia')}</p>
                  <p className="text-sm text-gray-500">GIF, SVG, JPG, PNG, PDF</p>
                </div>
              </div>
            )}

            {/* No Image Message in Read-Only Mode */}
            {!hasExistingImage && readOnly && (
              <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-500">{t('schools.noImageAvailable')}</p>
              </div>
            )}

            {/* File Preview Section - Show when image exists */}
            {hasExistingImage && imageFileName && (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                {/* Image Preview - Show the actual image in both view and add/edit modes */}
                {previewUrl && (
                  <div className="mb-3">
                    <CustomImage
                      src={previewUrl}
                      alt={imageFileName}
                      className="h-48 w-full rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* PDF Preview in View Mode - Show button to open */}
                {readOnly && existingDetails?.imageUrl && isPdfFile(existingDetails.imageUrl) && (
                  <div className="mb-3 flex flex-col items-center justify-center rounded-lg bg-gray-100 p-6">
                    <svg
                      className="mb-2 h-12 w-12 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mb-2 text-sm font-medium text-gray-700">{imageFileName}</p>
                    <button
                      type="button"
                      onClick={handleViewPdf}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                    >
                      {t('common.view')} PDF
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* File Preview */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                      {isPdfFile(imageFileName) ? (
                        <svg
                          className="h-6 w-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                          <text x="7" y="17" fontSize="6" fill="currentColor" fontWeight="bold">
                            PDF
                          </text>
                        </svg>
                      ) : (
                        <svg
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {imageFileName || t('schools.facilityImages')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {imageFile ? t('common.uploaded') : t('common.existingFile')}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons - Hide in Read-Only Mode */}
                  {!readOnly && (
                    <div className="flex items-center gap-2">
                      {/* View PDF Button */}
                      {isPdfFile(imageFileName) && (
                        <button
                          type="button"
                          onClick={handleViewPdf}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-300 bg-white text-blue-600 transition-colors hover:bg-blue-50"
                          title={t('common.view')}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </button>
                      )}
                      <label
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                        title={t('common.edit')}
                      >
                        <input
                          type="file"
                          accept="image/*,.svg,.jpg,.jpeg,.png,.pdf"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </label>

                      <button
                        type="button"
                        onClick={handleImageDelete}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-red-300 bg-white text-red-600 transition-colors hover:bg-red-50"
                        title={t('common.delete')}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress Bar (Full) - Hide in View Mode */}
                {!readOnly && (
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-full bg-green-600 transition-all duration-300"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex w-full justify-center gap-3 pt-4">
            {readOnly ? (
              <button
                onClick={handleClose}
                className="flex-grow rounded-xl bg-green-700 px-5 py-2 text-white transition-colors duration-200 hover:bg-green-800"
              >
                {t('common.close')}
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
