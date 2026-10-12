import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import CloseXGreenIcon from '@/assets/icons/CloseXGreen.svg';
import DeleteConfirmRedIcon from '@/assets/icons/DeleteConfirmRed124.svg';
import SuccessCheckGreenIcon from '@/assets/icons/SuccessCheckGreen124.svg';
import Modal from './Modal';

type ConfirmTone = 'danger' | 'success';

const TONES: Record<ConfirmTone, { icon: string; buttonClass: string }> = {
  danger: {
    icon: DeleteConfirmRedIcon,
    buttonClass: 'bg-[#FF270E] hover:bg-[#E0200A]',
  },
  success: {
    icon: SuccessCheckGreenIcon,
    buttonClass: 'bg-[#1E7A52] hover:bg-[#1E7A52]/90',
  },
};

interface ConfirmPopupProps {
  open: boolean;
  /** Text under the icon; already translated. */
  children: React.ReactNode;
  confirmLabel: string;
  processingLabel?: string;
  tone?: ConfirmTone;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function ConfirmPopup({
  open,
  children,
  confirmLabel,
  processingLabel,
  tone = 'danger',
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmPopupProps) {
  const { t } = useTranslation();
  const { icon, buttonClass } = TONES[tone];

  return (
    <Modal
      isOpen={open}
      onClose={onCancel}
      showHeader={false}
      size="sm"
      panelClassName="max-w-[612px]! rounded-2xl! border border-[#E2E8F0]/90 p-px shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]! overflow-hidden"
      contentClassName="flex flex-col overflow-hidden! p-0!"
    >
      <div className="flex justify-end border-b border-[#F1F5F9] px-8 pt-7 pb-[21px]">
        <button
          type="button"
          onClick={onCancel}
          aria-label={t('common.close')}
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#F1F5F9]"
        >
          <CustomImage src={CloseXGreenIcon} alt="" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-5 px-8 py-6">
        <CustomImage src={icon} alt="" lazy={false} />
        <div className="flex flex-col items-center gap-3 text-center" dir="auto">
          {children}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/70 px-8 pt-[21px] pb-5">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className={`h-10 rounded-lg px-6 py-2.5 text-sm leading-[19.6px] font-semibold text-white drop-shadow-[0px_1px_1px_rgba(5,150,105,0.2)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
        >
          {isProcessing && processingLabel ? processingLabel : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="h-[42px] rounded-lg border border-[#1E7A52] bg-white px-[25px] text-sm leading-5 font-medium text-[#1E7A52] transition-colors hover:bg-[#F0FDF4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('common.cancel')}
        </button>
      </div>
    </Modal>
  );
}
