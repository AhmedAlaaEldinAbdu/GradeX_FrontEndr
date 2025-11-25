import { useTranslation } from 'react-i18next';
import FileIcon from '@gradex/assets/icons/File.svg';

interface ExistingFileDisplayProps {
  filePath: string;
  fileName: string;
  className?: string;
}

const ExistingFileDisplay = ({ filePath, fileName, className = '' }: ExistingFileDisplayProps) => {
  const { t } = useTranslation();

  return (
    <div className={`mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={FileIcon} alt="File" className="h-6 w-6" />
          <span className="text-sm text-gray-700">{fileName}</span>
          <span className="text-xs text-gray-500">({t('officialHolidays.currentFile')})</span>
        </div>
        <a
          href={filePath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-600 hover:text-green-800 hover:underline"
        >
          {t('common.download')}
        </a>
      </div>
    </div>
  );
};

export default ExistingFileDisplay;
