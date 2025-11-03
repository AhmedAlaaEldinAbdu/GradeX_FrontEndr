import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => void;
  fileName?: string;
  uploadText?: string;
  formatHints?: string[];
  required?: boolean;
  optional?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = 'image/*,.svg',
  onChange,
  onDelete,
  fileName,
  uploadText = 'ارفع الوسائط من هنا',
  formatHints = ['GIF', 'SVG', 'JPG', 'PNG'],
  required = false,
  optional = false,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
    onChange(e);
  };

  const handleEdit = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFilePreview(null);
    setUploadProgress(0);
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="space-y-3">
      <label className="mb-2 block text-right text-sm font-medium text-gray-700">
        {label}
        {required && <span className="mr-1 text-red-500">*</span>}
        {optional && <span className="text-xs text-gray-400"> ({t('schools.optional')}) </span>}
      </label>

      {/* Upload Area */}
      <div className="relative rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-all hover:border-green-500">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
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
            <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p className="text-sm text-green-600">{uploadText}</p>
          {formatHints.length > 0 && (
            <p className="text-sm text-gray-500">{formatHints.join(', ')}</p>
          )}
        </div>
      </div>

      {/* File Preview Section */}
      {fileName && uploadProgress > 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* File Preview or Icon */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="preview"
                    className="h-full w-full rounded-lg object-cover"
                  />
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
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{uploadProgress}%</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                title="تعديل"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-red-300 bg-white text-red-600 transition-colors hover:bg-red-50"
                title="حذف"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
