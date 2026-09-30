import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import FileViewer from '@/shared/components/FileViewer';
import FileIcon from '@gradex/assets/icons/File.svg';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import EyeIcon from '@gradex/assets/icons/EyeStyled.svg';

interface ExistingFileDisplayProps {
  filePath: string;
  fileName: string;
  className?: string;
  showViewButton?: boolean;
  showDownloadButton?: boolean;
}

const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

const isVideoFile = (extension: string): boolean => {
  return ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'wav'].includes(extension);
};

const isViewableFile = (extension: string): boolean => {
  const viewableExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'svg',
    'webp',
    'bmp',
    'pdf',
    'mp4',
    'avi',
    'mov',
    'mkv',
    'webm',
    'flv',
    'wmv',
    'wav',
  ];
  return viewableExtensions.includes(extension);
};

const ExistingFileDisplay = ({
  filePath,
  fileName,
  className = '',
  showViewButton = false,
  showDownloadButton = true,
}: ExistingFileDisplayProps) => {
  const { t } = useTranslation();
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const extension = getFileExtension(fileName);
  const isVideo = isVideoFile(extension);
  const canViewFile = isViewableFile(extension);

  // Auto-enable view button for videos if not explicitly disabled
  const shouldShowViewButton = isVideo ? true : showViewButton;

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const fullUrl = filePath.startsWith('http') ? filePath : `${baseUrl}/${filePath}`;

  return (
    <>
      <div className={`mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CustomImage src={FileIcon} alt="File" className="h-6 w-6" />
            <span className="text-sm text-gray-700">{fileName}</span>
            <span className="shrink-0 text-xs text-gray-500">
              ({t('officialHolidays.currentFile')})
            </span>
          </div>
          <div className="flex items-center gap-3">
            {canViewFile && shouldShowViewButton && (
              <button
                type="button"
                onClick={() => setIsFileViewerOpen(true)}
                className={`text-sm font-medium hover:underline ${
                  isVideo
                    ? 'text-blue-600 hover:text-blue-800'
                    : 'text-indigo-600 hover:text-indigo-800'
                }`}
                title={isVideo ? t('common.viewVideo') : t('common.view')}
              >
                {isVideo ? (
                  <CustomImage src={EyeIcon} alt={t('common.viewVideo')} className="h-5 w-5" />
                ) : (
                  <CustomImage src={EyeIcon} alt={t('common.view')} className="h-5 w-5" />
                )}
              </button>
            )}
            {showDownloadButton && (
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-800 hover:underline"
                title={t('common.download')}
              >
                <CustomImage src={DownloadIcon} alt={t('common.download')} className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {canViewFile && shouldShowViewButton && (
        <FileViewer
          isOpen={isFileViewerOpen}
          onClose={() => setIsFileViewerOpen(false)}
          filePath={filePath}
          fileName={fileName}
        />
      )}
    </>
  );
};

export default ExistingFileDisplay;
