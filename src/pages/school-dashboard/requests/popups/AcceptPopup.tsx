import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import FileUpload from '@/shared/components/FileUpload';
import { FaTimes } from 'react-icons/fa';

interface AcceptPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (contractFile?: File) => void;
  isProcessing?: boolean;
}

const AcceptPopup: React.FC<AcceptPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContractFile(file);
      setFileName(file.name);
    }
  };

  const handleFileDelete = () => {
    setContractFile(null);
    setFileName('');
  };

  const handleConfirm = () => {
    onConfirm(contractFile || undefined);
    setContractFile(null);
    setFileName('');
  };

  const handleClose = () => {
    setContractFile(null);
    setFileName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showHeader={false} size="sm">
      <div className="flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute start-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Title */}
        <h2 className="mb-8 mt-4 text-center text-2xl font-bold text-gray-900">
          {t('studentApplications.modals.acceptConfirm')}
        </h2>

        {/* File Upload */}
        <div className="mb-6 w-full">
          <FileUpload
            label=""
            accept="image/*,.svg,.pdf"
            onChange={handleFileChange}
            onDelete={handleFileDelete}
            fileName={fileName}
            files={contractFile ? [contractFile] : []}
            formatHints={['SVG', 'JPG', 'PNG', 'GIF']}
          />
        </div>

        {/* Action buttons */}
        <div className="flex w-full gap-3">
          <Button variant="outline" fullWidth onClick={handleClose} disabled={isProcessing}>
            {t('common.cancel')}
          </Button>
          <Button variant="success" fullWidth onClick={handleConfirm} loading={isProcessing}>
            {t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AcceptPopup;
