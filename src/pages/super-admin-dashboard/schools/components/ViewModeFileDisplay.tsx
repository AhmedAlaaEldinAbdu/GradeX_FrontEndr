import React, { useState } from 'react';
import CustomImage from '@/shared/components/CustomImage';
import { useTranslation } from 'react-i18next';
import FormField from '@gradex/shared/components/FormField';

interface ViewModeFileDisplayProps {
  files: string[];
  label: string;
  baseUrl?: string;
}

/**
 * ViewModeFileDisplay - Display uploaded files in view mode with image previews
 * Shows image thumbnails that can be clicked to view full size
 * Shows file icons for non-image files
 */
const ViewModeFileDisplay: React.FC<ViewModeFileDisplayProps> = ({
  files,
  label,
  baseUrl = 'http://gradexpro.runasp.net/',
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Check if file is an image based on extension
  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
  };

  // Check if file is a PDF
  const isPdfFile = (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  // Get full URL for file
  const getFileUrl = (fileName: string): string => {
    // If fileName already contains full URL, return it
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
      return fileName;
    }
    // Otherwise, construct URL with baseUrl
    return `${baseUrl}${fileName}`;
  };

  // Handle image click to open modal
  const handleImageClick = (fileName: string) => {
    if (isImageFile(fileName)) {
      setSelectedImage(getFileUrl(fileName));
    }
  };

  // Handle PDF click to open in new tab
  const handlePdfClick = (fileName: string) => {
    if (isPdfFile(fileName)) {
      window.open(getFileUrl(fileName), '_blank');
    }
  };

  // Close modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <FormField label={label}>
        <div className="space-y-2">
          {files.map((fileName, index) => {
            const isImage = isImageFile(fileName);
            const fileUrl = getFileUrl(fileName);

            return (
              <div
                key={index}
                className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-all hover:border-green-400"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* File Preview or Icon */}
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white ${
                        isImage
                          ? 'cursor-pointer overflow-hidden ring-2 ring-green-100'
                          : isPdfFile(fileName)
                            ? 'cursor-pointer ring-2 ring-red-100'
                            : ''
                      }`}
                      onClick={() =>
                        isImage
                          ? handleImageClick(fileName)
                          : isPdfFile(fileName)
                            ? handlePdfClick(fileName)
                            : null
                      }
                    >
                      {isImage ? (
                        <CustomImage
                          src={fileUrl}
                          alt={fileName}
                          className="h-full w-full object-cover transition-transform hover:scale-110"
                          onError={(e) => {
                            // Fallback to file icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display =
                                'block';
                            }
                          }}
                        />
                      ) : isPdfFile(fileName) ? (
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
                      ) : null}
                      <svg
                        className={`h-6 w-6 text-green-600 ${isImage || isPdfFile(fileName) ? 'hidden' : ''}`}
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
                    </div>

                    {/* File Info */}
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {fileName?.split('/').pop()}
                      </p>
                      <div className="flex items-center justify-start gap-2 py-2">
                        <p className="text-xs text-gray-500">{t('common.uploaded')}</p>
                        {isImage && (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            {t('common.image')}
                          </span>
                        )}
                        {isPdfFile(fileName) && (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                            PDF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* View Button for Images */}
                  {isImage && (
                    <button
                      type="button"
                      onClick={() => handleImageClick(fileName)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-green-300 bg-white text-green-600 transition-colors hover:bg-green-50"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  )}

                  {/* View Button for PDFs - Opens in new tab */}
                  {isPdfFile(fileName) && (
                    <button
                      type="button"
                      onClick={() => handlePdfClick(fileName)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-red-300 bg-white text-red-600 transition-colors hover:bg-red-50"
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
                </div>

                {/* Complete Progress Bar (100%) */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-green-600 transition-all duration-300"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </FormField>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 p-4"
          onClick={closeModal}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -right-4 -top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
              title={t('common.close')}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <CustomImage
              src={selectedImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ViewModeFileDisplay;
