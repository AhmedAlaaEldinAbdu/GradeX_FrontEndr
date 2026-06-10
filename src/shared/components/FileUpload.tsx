import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import MultiFiles from '@/assets/icons/MultiFiles.svg';
import useLanguage from '@/hooks/useLanguage';

interface FileInfo {
  file: File;
  preview?: string;
  progress: number;
}

export interface FileUploadRef {
  /** Returns the new File objects the user selected in this session */
  getFiles: () => File[];
  /** Clears all files (new and existing) from the component */
  reset: () => void;
}

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: (index?: number) => void;
  /** Callback invoked in self-managed mode whenever files change */
  onFilesChange?: (newFiles: File[], existingNames: string[], existingUrls: string[]) => void;
  fileName?: string;
  fileNames?: string[];
  fileUrl?: string; // Optional URL for a single remote file
  fileUrls?: string[]; // Optional URLs for multiple remote files
  files?: File[]; // Actual File objects for viewing
  /** Existing file names to pre-populate (self-managed mode) */
  initialFileNames?: string[];
  /** Existing file URLs to pre-populate (self-managed mode) */
  initialFileUrls?: string[];
  /** Pass existing attachments directly from API response — works with ref-based mode */
  attachments?: { fileName: string; filePath: string }[];
  /** Pass existing attachment URLs directly — fileName is derived from the URL path */
  attachmentUrls?: string[];
  uploadText?: string;
  formatHints?: string[];
  required?: boolean;
  optional?: boolean;
  multiple?: boolean;
  error?: boolean;
  id?: string;
  /** Max allowed size per file, in megabytes. Shown as a hint and enforced on select. */
  maxSize?: number;
}

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(function FileUpload(
  {
    label,
    accept = 'image/*,.svg',
    onChange,
    onDelete,
    onFilesChange,
    fileName,
    fileNames,
    fileUrl,
    fileUrls,
    initialFileNames,
    initialFileUrls,
    attachments,
    attachmentUrls,
    uploadText,
    formatHints = ['GIF', 'SVG', 'JPG', 'PNG', 'PDF'],
    required = false,
    optional = false,
    multiple = false,
    error = false,
    id = '',
    files = [],
    maxSize,
  },
  ref
) {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const [sizeError, setSizeError] = useState<string | null>(null);

  // Use translation if uploadText is not provided
  const displayUploadText = uploadText || t('fileUpload.uploadText');
  const orSeparator = t('fileUpload.formatSeparator');

  // Format hints with commas and 'or' after the first item
  const formatHintsText = () => {
    if (formatHints.length === 0) return '';
    if (formatHints.length === 1) return formatHints[0];
    const firstItem = formatHints[0];
    const rest = formatHints.slice(1).join(', ');
    return `${firstItem}${orSeparator}${rest}`;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileInfoList, setFileInfoList] = useState<FileInfo[]>([]);

  // Self-managed mode: internal state for existing (server-side) files
  // Seed from `attachments` or `attachmentUrls` prop if provided, otherwise fall back to initialFileNames/Urls
  const resolvedAttachments = attachments
    ? attachments
    : attachmentUrls
      ? attachmentUrls.map((url) => ({ fileName: url.split('/').pop() || url, filePath: url }))
      : null;

  const seedNames = resolvedAttachments
    ? resolvedAttachments.map((a) => a.fileName)
    : (initialFileNames ?? []);
  const seedUrls = resolvedAttachments
    ? resolvedAttachments.map((a) => a.filePath)
    : (initialFileUrls ?? []);

  const [internalExistingNames, setInternalExistingNames] = useState<string[]>(seedNames);
  const [internalExistingUrls, setInternalExistingUrls] = useState<string[]>(seedUrls);

  // Sync when attachments/attachmentUrls prop changes (async data load in edit mode)
  useEffect(() => {
    if (resolvedAttachments) {
      setInternalExistingNames(resolvedAttachments.map((a) => a.fileName));
      setInternalExistingUrls(resolvedAttachments.map((a) => a.filePath));
    }
  }, [attachments?.map((a) => a.fileName).join(','), attachmentUrls?.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync internal existing files when initialFileNames/initialFileUrls change (e.g. async data load)
  useEffect(() => {
    if (!resolvedAttachments) setInternalExistingNames(initialFileNames ?? []);
  }, [initialFileNames?.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!resolvedAttachments) setInternalExistingUrls(initialFileUrls ?? []);
  }, [initialFileUrls?.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Whether we are in self-managed mode: ref-based (attachments/attachmentUrls prop) OR callback-based (onFilesChange)
  const isInternalMode = !!onFilesChange || !!resolvedAttachments;

  // Expose imperative API via ref
  useImperativeHandle(ref, () => ({
    getFiles: () => fileInfoList.map((f) => f.file),
    reset: () => {
      setFileInfoList([]);
      setInternalExistingNames([]);
      setInternalExistingUrls([]);
      setFilePreview(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  }));

  // In internal mode, displayFiles comes from internal existing state.
  // In external mode (backward compat), displayFiles comes from the fileNames prop.
  const effectiveFileNames = isInternalMode ? internalExistingNames : (fileNames ?? []);
  const effectiveFileUrls = isInternalMode ? internalExistingUrls : (fileUrls ?? []);

  // Sync fileInfoList with fileNames prop
  // This ensures consistency when parent validates and rejects some files
  useEffect(() => {
    // If we have fileNames from parent but no matching internal files,
    // the displayFiles section will render them. No action needed.
    // If fileInfoList has files that aren't in fileNames, remove them.
    if (multiple && fileNames && fileNames.length > 0 && fileInfoList.length > 0) {
      const validNames = new Set(fileNames);
      const filtered = fileInfoList.filter((f) => validNames.has(f.file.name));
      if (filtered.length !== fileInfoList.length) {
        setFileInfoList(filtered);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileNames]);

  // Check if file is a PDF
  const isPdfFile = (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  // Check if file is an image
  const isImageFile = (fileName: string): boolean => {
    const ext = fileName.toLowerCase();
    return (
      ext.endsWith('.jpg') ||
      ext.endsWith('.jpeg') ||
      ext.endsWith('.png') ||
      ext.endsWith('.gif') ||
      ext.endsWith('.webp') ||
      ext.endsWith('.svg')
    );
  };

  const resolveUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
    const relativeUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${relativeUrl}`;
  };

  const handleViewPdf = (fileOrUrl: File | string) => {
    const url =
      typeof fileOrUrl === 'string' ? resolveUrl(fileOrUrl) : URL.createObjectURL(fileOrUrl);
    window.open(url, '_blank');
  };

  // Handle opening Image in new tab
  const handleViewImage = (fileOrUrl: File | string) => {
    const url =
      typeof fileOrUrl === 'string' ? resolveUrl(fileOrUrl) : URL.createObjectURL(fileOrUrl);
    window.open(url, '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Enforce the per-file size limit (when provided) before accepting anything.
    if (maxSize != null) {
      const limitBytes = maxSize * 1024 * 1024;
      const hasOversize = Array.from(selectedFiles).some((file) => file.size > limitBytes);
      if (hasOversize) {
        setSizeError(t('fileUpload.maxSizeError', { size: maxSize.toFixed(2) }));
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }
    setSizeError(null);

    let addedFileInfos: FileInfo[] = [];

    if (multiple) {
      const newFileInfos: FileInfo[] = [];
      Array.from(selectedFiles).forEach((file) => {
        const fileInfo: FileInfo = {
          file,
          progress: 0,
        };

        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            fileInfo.preview = reader.result as string;
            setFileInfoList((prev) => [...prev.filter((f) => f.file !== file), fileInfo]);
          };
          reader.readAsDataURL(file);
        }

        newFileInfos.push(fileInfo);
      });

      setFileInfoList((prev) => [...prev, ...newFileInfos]);

      newFileInfos.forEach((fileInfo) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress >= 100) {
            clearInterval(interval);
            progress = 100;
          }
          setFileInfoList((prev) =>
            prev.map((f) => (f.file === fileInfo.file ? { ...f, progress } : f))
          );
        }, 100);
      });

      addedFileInfos = newFileInfos;
    } else {
      const file = selectedFiles[0];
      if (file) {
        const fileInfo: FileInfo = {
          file,
          progress: 0,
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            fileInfo.preview = reader.result as string;
            setFileInfoList([fileInfo]);
          };
          reader.readAsDataURL(file);
        }

        setFileInfoList([fileInfo]);

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress >= 100) {
            clearInterval(interval);
            progress = 100;
          }
          setFileInfoList([{ ...fileInfo, progress }]);
        }, 100);

        // Legacy support - keep these for backward compatibility
        setUploadProgress(100);
        setFilePreview(fileInfo.preview || null);

        addedFileInfos = [fileInfo];
      }
    }

    if (isInternalMode) {
      if (!multiple) {
        setInternalExistingNames([]);
        setInternalExistingUrls([]);
      }

      const allNewFiles = multiple
        ? [...fileInfoList.map((f) => f.file), ...addedFileInfos.map((f) => f.file)]
        : addedFileInfos.map((f) => f.file);

      if (onFilesChange) {
        onFilesChange(
          allNewFiles,
          multiple ? internalExistingNames : [],
          multiple ? internalExistingUrls : []
        );
      }
    }
    if (onChange) onChange(e);
  };

  const handleEdit = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (index?: number) => {
    if (multiple && index !== undefined) {
      if (isInternalMode) {
        // In internal mode, indices are offset:
        // [0 .. internalExistingNames.length - 1] = existing files
        // [internalExistingNames.length .. ] = new files in fileInfoList
        if (index < internalExistingNames.length) {
          const newNames = internalExistingNames.filter((_, i) => i !== index);
          const newUrls = internalExistingUrls.filter((_, i) => i !== index);
          setInternalExistingNames(newNames);
          setInternalExistingUrls(newUrls);
          if (onFilesChange) {
            onFilesChange(
              fileInfoList.map((f) => f.file),
              newNames,
              newUrls
            );
          }
        } else {
          const fileIndex = index - internalExistingNames.length;
          const newInfoList = fileInfoList.filter((_, i) => i !== fileIndex);
          setFileInfoList(newInfoList);
          if (onFilesChange) {
            onFilesChange(
              newInfoList.map((f) => f.file),
              internalExistingNames,
              internalExistingUrls
            );
          }
        }
      } else {
        // External mode (backward compat)
        setFileInfoList((prev) => prev.filter((_, i) => i !== index));
        if (onDelete) onDelete(index);
      }
    } else {
      // Delete all
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFilePreview(null);
      setUploadProgress(0);
      setFileInfoList([]);
      if (isInternalMode) {
        setInternalExistingNames([]);
        setInternalExistingUrls([]);
        if (onFilesChange) {
          onFilesChange([], [], []);
        }
      } else {
        if (onDelete) onDelete();
      }
    }
  };

  const singleFileName =
    fileName ||
    (isInternalMode && effectiveFileNames.length > 0 ? effectiveFileNames[0] : undefined);
  const singleFileUrl =
    fileUrl || (isInternalMode && effectiveFileUrls.length > 0 ? effectiveFileUrls[0] : undefined);

  // Get display files list (existing/server-side files shown below the upload area)
  const displayFiles =
    multiple && effectiveFileNames.length > 0
      ? effectiveFileNames
      : singleFileName
        ? [singleFileName]
        : [];
  const hasFiles = multiple
    ? fileInfoList.length > 0 || displayFiles.length > 0
    : (singleFileName && (uploadProgress > 0 || singleFileUrl)) || fileInfoList.length > 0;

  return (
    <div className="space-y-3">
      <label
        className={`mb-2 block text-start text-sm font-medium text-gray-700 ${required && 'required'}`}
      >
        {label}
        {/* {required && <span className="me-1 text-red-500">*</span>} */}
        {optional && <span className="text-xs text-gray-400"> ({t('schools.optional')}) </span>}
      </label>

      {/* Upload Area */}
      <div
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          error
            ? 'border-red-500 bg-red-50 hover:border-red-600'
            : 'border-green-500 bg-green-100 hover:border-green-600'
        }`}
        style={{ borderStyle: 'dashed', borderSpacing: '8px' }}
      >
        <input
          id={id}
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          multiple={multiple}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center gap-2">
          {/* Icon Container */}
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
            <img src={MultiFiles} alt="Upload Icon" className="h-6 w-6 object-contain" />
          </div>
          <p className="text-base font-normal text-green-500">{displayUploadText}</p>
          {formatHints.length > 0 && (
            <p className="text-base font-normal text-black-600" dir={isArabic ? 'ltr' : 'rtl'}>
              {formatHintsText()}
            </p>
          )}
          {maxSize != null && (
            <p className="text-sm font-normal text-black-600" dir={isArabic ? 'ltr' : 'rtl'}>
              {t('fileUpload.maxSize', { size: maxSize.toFixed(2) })}
            </p>
          )}
        </div>
      </div>

      {sizeError && <p className="text-start text-sm text-red-500">{sizeError}</p>}

      {/* Files Preview Section (works for both single and multiple) */}
      {hasFiles && (multiple || !singleFileName || fileInfoList.length > 0) && (
        <div className="space-y-2">
          {/* Render files from internal fileInfoList (newly uploaded during this session) */}
          {fileInfoList.map((fileInfo, index) => (
            <div
              key={`file-${index}`}
              className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* File Preview or Icon */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                    {fileInfo.preview ? (
                      <CustomImage
                        src={fileInfo.preview}
                        alt="preview"
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : isPdfFile(fileInfo.file.name) ? (
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
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 text-start">
                    <p className="text-sm font-medium text-gray-900">{fileInfo.file.name}</p>
                    <p className="text-xs text-gray-500">{fileInfo.progress}%</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* View PDF Button */}
                  {isPdfFile(fileInfo.file.name) && (
                    <button
                      type="button"
                      onClick={() => handleViewPdf(fileInfo.file)}
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
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        multiple
                          ? isInternalMode
                            ? internalExistingNames.length + index
                            : index
                          : undefined
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-red-300 bg-white text-red-600 transition-colors hover:bg-red-50"
                    title={t('common.delete')}
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
                  style={{ width: `${fileInfo.progress}%` }}
                ></div>
              </div>
            </div>
          ))}

          {/* Render files from fileNames prop that aren't already in fileInfoList */}
          {(() => {
            const fileInfoNames = new Set(fileInfoList.map((f) => f.file.name));
            const filesToShow = displayFiles.filter((name) => !fileInfoNames.has(name));
            return filesToShow.map((name, index) => {
              // Calculate the actual index in the parent's file array
              const actualIndex = displayFiles.indexOf(name);
              return (
                <div
                  key={`display-${index}`}
                  className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* File Icon or Image Preview */}
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                        {(() => {
                          const matchingFile = files.find((f) => f.name === name);
                          const actualIndex = displayFiles.indexOf(name);
                          const matchingUrl = effectiveFileUrls[actualIndex]
                            ? effectiveFileUrls[actualIndex]
                            : null;

                          // Show image preview if it's an image file and we have the File object or remote URL
                          if (isImageFile(name) && (matchingFile || matchingUrl)) {
                            const imgSrc = matchingFile
                              ? URL.createObjectURL(matchingFile)
                              : resolveUrl(matchingUrl!);
                            return (
                              <CustomImage
                                src={imgSrc}
                                alt="preview"
                                className="h-full w-full rounded-lg object-cover"
                              />
                            );
                          }
                          // Show PDF icon for PDFs
                          if (isPdfFile(name)) {
                            return (
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
                                <text
                                  x="7"
                                  y="17"
                                  fontSize="6"
                                  fill="currentColor"
                                  fontWeight="bold"
                                >
                                  PDF
                                </text>
                              </svg>
                            );
                          }
                          // Default document icon for other file types
                          return (
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
                          );
                        })()}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 text-start">
                        <p className="text-sm font-medium text-gray-900">{name}</p>
                        <p className="text-xs text-gray-500">100%</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* View Button - for PDFs and Images */}
                      {(() => {
                        const matchingFile = files.find((f) => f.name === name);
                        const actualIndex = displayFiles.indexOf(name);
                        const matchingUrl = effectiveFileUrls[actualIndex]
                          ? effectiveFileUrls[actualIndex]
                          : null;
                        const viewerSource = matchingFile || matchingUrl;

                        if (viewerSource) {
                          if (isPdfFile(name)) {
                            return (
                              <button
                                type="button"
                                onClick={() => handleViewPdf(viewerSource)}
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
                            );
                          }
                          if (isImageFile(name)) {
                            return (
                              <button
                                type="button"
                                onClick={() => handleViewImage(viewerSource)}
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
                            );
                          }
                        }
                        return null;
                      })()}
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(multiple ? actualIndex : undefined)}
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
                  </div>

                  {/* Progress Bar (already complete) */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-green-600 transition-all duration-300"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Single File Preview Section - Only show if no fileInfoList items */}
      {!multiple &&
        singleFileName &&
        (uploadProgress > 0 || singleFileUrl) &&
        fileInfoList.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* File Preview or Icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                  {filePreview || (singleFileUrl && isImageFile(singleFileName || label)) ? (
                    <CustomImage
                      src={filePreview || resolveUrl(singleFileUrl)}
                      alt="preview"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : singleFileUrl && isPdfFile(singleFileName || '') ? (
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
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 text-start">
                  <p className="text-sm font-medium text-gray-900">{singleFileName || label}</p>
                  <p className="text-xs text-gray-500">
                    {uploadProgress > 0 ? `${uploadProgress}%` : '100%'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                  title={t('common.edit')}
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
                  onClick={() => handleDelete()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-red-300 bg-white text-red-600 transition-colors hover:bg-red-50"
                  title={t('common.delete')}
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
                style={{ width: uploadProgress > 0 ? `${uploadProgress}%` : '100%' }}
              ></div>
            </div>
          </div>
        )}
    </div>
  );
});

export default FileUpload;
