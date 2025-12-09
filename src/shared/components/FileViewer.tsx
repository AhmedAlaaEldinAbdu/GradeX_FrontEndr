import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string | null;
  fileName?: string;
  title?: string;
}

/**
 * FileViewer component - Opens files (PDFs, images, etc.) in a modal
 * Supports various file types including PDF, images (jpg, png, gif, svg, webp), etc.
 */
const FileViewer: React.FC<FileViewerProps> = ({ isOpen, onClose, filePath, fileName, title }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Construct full URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const fullUrl = useMemo(() => {
    if (!filePath) return '';
    return filePath.startsWith('http') ? filePath : `${baseUrl}/${filePath}`;
  }, [filePath, baseUrl]);

  // Get file extension
  const extension = useMemo(() => {
    if (!filePath) return '';
    return filePath.split('.').pop()?.toLowerCase() || '';
  }, [filePath]);

  // Check if file is an image
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension);

  // Check if file is a PDF
  const isPdf = extension === 'pdf';

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, filePath]);

  // Handle load events
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!filePath) {
    return null;
  }

  const renderContent = () => {
    if (hasError) {
      return (
        <div className="flex h-96 flex-col items-center justify-center text-gray-500">
          <svg
            className="mb-4 h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-lg">{t('common.fileLoadError', 'Unable to load file')}</p>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            {t('common.openInNewTab', 'Open in new tab')}
          </a>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
            </div>
          )}
          <img
            src={fullUrl}
            alt={fileName || 'File preview'}
            className="max-h-[70vh] max-w-full rounded-lg object-contain"
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="relative h-[70vh] w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
            </div>
          )}
          <iframe
            src={fullUrl}
            className="h-full w-full rounded-lg border-0"
            title={fileName || 'PDF Preview'}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      );
    }

    // For other file types, show download option
    return (
      <div className="flex h-96 flex-col items-center justify-center text-gray-500">
        <svg
          className="mb-4 h-16 w-16 text-gray-400"
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
        <p className="mb-4 text-lg">{fileName || t('common.file', 'File')}</p>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          {t('common.openFile', 'Open File')}
        </a>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || fileName || t('common.filePreview', 'File Preview')}
      size="xl"
    >
      <div className="relative">{renderContent()}</div>
    </Modal>
  );
};

export default FileViewer;
