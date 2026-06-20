import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import type { DelegateRequestDto } from '@/services/api/requests/requests.types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-start gap-2">
      <span className="text-sm font-medium text-[#0E1F1F]">{label}:</span>
      <span dir="ltr" className="text-sm font-normal text-[#646969]">
        {value}
      </span>
    </div>
  );
}

type DelegateDetailsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  delegate: DelegateRequestDto | null;
};

export default function DelegateDetailsPopup({
  isOpen,
  onClose,
  delegate,
}: DelegateDetailsPopupProps) {
  const { t } = useTranslation();

  if (!delegate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('requests.delegate.detailsTitle')} size="sm">
      <div className="flex flex-col gap-5">
        <DetailRow label={t('requests.delegate.mobile')} value={delegate.mobile} />
        <DetailRow label={t('requests.delegate.whatsapp')} value={delegate.whatsapp} />
        <DetailRow label={t('requests.delegate.email')} value={delegate.email} />
      </div>
    </Modal>
  );
}
