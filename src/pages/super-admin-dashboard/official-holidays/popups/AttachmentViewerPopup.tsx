import { useState, useEffect } from 'react';
import CustomImage from '@/shared/components/CustomImage';
import { useTranslation } from 'react-i18next';

interface AttachmentViewerPopupProps {
  open: boolean;
  filePath: string;
  fileName?: string;
  onClose: () => void;
  baseUrl?: string;
}

export default function AttachmentViewerPopup({
  open,
  filePath,
  fileName,
  onClose,
  baseUrl = 'http://gradexpro.runasp.net/',
}: AttachmentViewerPopupProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [filePath]);

  if (!open) return null;

  const isImageFile = (path: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some((ext) => path.toLowerCase().endsWith(ext));
  };

  const getFileUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${baseUrl}${path}`;
  };

  const fileUrl = getFileUrl(filePath);
  const isImage = isImageFile(filePath) && !imageError;
  const displayFileName = fileName || filePath.split('/').pop() || 'attachment';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = displayFileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] max-w-[90vw] flex-col rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('officialHolidays.attachment')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title={t('common.close')}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isImage ? (
            <div className="flex items-center justify-center">
              <CustomImage
                src={fileUrl}
                alt={displayFileName}
                className="max-h-[60vh] max-w-full rounded-lg object-contain"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-12 w-12 text-green-600"
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
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">{displayFileName}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {t('officialHolidays.previewNotAvailable')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t('common.close')}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t('common.download')}
          </button>
        </div>
      </div>
    </div>
  );
}
