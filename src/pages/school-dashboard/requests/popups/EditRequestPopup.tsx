import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import TextArea from '@/shared/components/TextArea';

interface EditRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
  isProcessing?: boolean;
}

const EditRequestPopup: React.FC<EditRequestPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (!message.trim()) {
      setError(true);
      return;
    }
    onConfirm(message);
    setMessage('');
    setError(false);
  };

  const handleClose = () => {
    setMessage('');
    setError(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('studentApplications.modals.editRequestTitle')}
      size="sm"
    >
      <div className="flex flex-col">
        {/* Edit request field */}
        <div className="mb-6">
          <label className="mb-2 block text-start text-sm font-medium text-gray-700">
            {t('studentApplications.modals.editRequestLabel')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <TextArea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError(false);
            }}
            placeholder={t('studentApplications.modals.editRequestPlaceholder')}
            rows={4}
            error={error ? t('studentApplications.modals.editRequestRequired') : undefined}
            className="text-start"
          />
        </div>

        {/* Action buttons */}
        <div className="flex w-full gap-3">
          <Button variant="outline" fullWidth onClick={handleClose} disabled={isProcessing}>
            {t('common.cancel')}
          </Button>
          <Button variant="success" fullWidth onClick={handleConfirm} loading={isProcessing}>
            {t('common.send')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditRequestPopup;
