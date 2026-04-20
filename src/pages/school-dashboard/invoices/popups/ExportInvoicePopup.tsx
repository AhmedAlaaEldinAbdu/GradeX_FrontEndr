import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import Input from '@/shared/components/Input';
import FormField from '@/shared/components/FormField';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';

import DownloadBlueIcon from '@gradex/assets/icons/DowloadBlue.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';

interface ExportInvoiceFormData {
  invoiceName: string;
}

interface ExportInvoicePopupProps {
  open: boolean;
  onClose: () => void;
  onExport: (fileName: string) => Promise<void>;
  isExporting?: boolean;
}

export default function ExportInvoicePopup({
  open,
  onClose,
  onExport,
  isExporting = false,
}: ExportInvoicePopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [exportedFileName, setExportedFileName] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExportInvoiceFormData>({
    defaultValues: { invoiceName: '' },
  });

  const handleClose = useCallback(() => {
    if (isExporting) return;
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      reset();
      setStep('form');
      setExportedFileName('');
    }, 200);
  }, [onClose, reset, isExporting]);

  useEffect(() => {
    if (open) {
      setStep('form');
      setExportedFileName('');
      reset();
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClose]);

  const handleFormSubmit = (data: ExportInvoiceFormData) => {
    const fileName = data.invoiceName.trim();
    setExportedFileName(fileName);
    setStep('success');
  };

  const handleReDownload = async () => {
    if (exportedFileName) {
      await onExport(exportedFileName);
    }
  };

  if (!open) return null;

  return (
    <div className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[420px] transform rounded-2xl bg-white p-6 py-7 shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isExporting}
          className="absolute end-3 top-3 text-xl text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          ✕
        </button>

        {step === 'form' ? (
          <>
            {/* Title */}
            <h2 className="mb-6 text-center text-lg font-semibold text-gray-800">
              {t('invoices.exportInvoice')}
            </h2>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                label={t('invoices.invoiceName')}
                required
                error={errors.invoiceName?.message}
                htmlFor="invoiceName"
              >
                <Controller
                  name="invoiceName"
                  control={control}
                  rules={{ required: t('common.validation.required') }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="invoiceName"
                      type="text"
                      placeholder={t('invoices.enterInvoiceName')}
                    />
                  )}
                />
              </FormField>

              <div className="flex flex-row-reverse gap-3 pt-4">
                <Button type="submit" disabled={isExporting}>
                  {isExporting ? t('common.processing') : t('invoices.export')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isExporting}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Title */}
            <h2 className="mb-6 text-center text-lg font-semibold text-gray-800">
              {t('invoices.detailsTitle')}
            </h2>

            {/* Success message */}
            <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
              {t('invoices.exportSuccess')}
            </div>

            {/* File row */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 px-5 py-4">
              <div className="flex items-center">
                <div className="flex h-12 w-12 flex-row-reverse items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                  <CustomImage src={PdfIcon} alt="Pdf" className="h-8 w-8 object-contain" />
                </div>
                <span className="flex-1 px-3 text-end text-sm font-medium text-gray-800">
                  {exportedFileName}.pdf
                </span>
              </div>
              <button
                onClick={handleReDownload}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              >
                <CustomImage src={DownloadBlueIcon} alt="Download" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-row-reverse gap-3 pt-6">
              <Button
                type="button"
                onClick={() => {
                  handleReDownload();
                  handleClose();
                }}
              >
                {t('invoices.download')}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
