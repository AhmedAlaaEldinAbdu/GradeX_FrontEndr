import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import CloseXGreenIcon from '@/assets/icons/CloseXGreen.svg';
import SuccessCheckGreenIcon from '@/assets/icons/SuccessCheckGreen124.svg';
import Modal from './Modal';

interface SuccessPopupProps {
  open: boolean;
  message: string;
  isMessageRaw?: boolean;
  icon?: string;
  autoCloseMs?: number;
  onClose: () => void;
}

export default function SuccessPopup({
  open,
  message,
  isMessageRaw = false,
  icon = SuccessCheckGreenIcon,
  autoCloseMs = 2500,
  onClose,
}: SuccessPopupProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open || autoCloseMs <= 0) return;
    const timer = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(timer);
  }, [open, autoCloseMs, onClose]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      showHeader={false}
      size="sm"
      panelClassName="max-w-[650px]! rounded-2xl! border border-[#E2E8F0]/90 p-px shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]! overflow-hidden"
      contentClassName="flex flex-col overflow-hidden! p-0!"
    >
      <div className="flex justify-end border-b border-[#F1F5F9] px-8 pt-7 pb-[21px]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#F1F5F9]"
        >
          <CustomImage src={CloseXGreenIcon} alt="" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-5 px-8 py-6">
        <CustomImage src={icon} alt="" lazy={false} />
        <p className="text-center text-base leading-4 text-[black]" dir="auto">
          {isMessageRaw ? message : t(message)}
        </p>
      </div>
    </Modal>
  );
}
