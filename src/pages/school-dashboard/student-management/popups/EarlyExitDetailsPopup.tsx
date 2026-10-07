import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';

interface EarlyExitDetails {
  reason: string;
  reasonEn: string;
  delegate: string;
  delegateEn: string;
  exitTime: string;
}

interface EarlyExitDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  details: EarlyExitDetails | null;
}

export default function EarlyExitDetailsPopup({
  isOpen,
  onClose,
  details,
}: EarlyExitDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-black-900">{label}:</span>
      <span className="font-normal text-[#646969]">{value}</span>
    </div>
  );

  return (
    <Modal
      placement="end"
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={t('students.details.earlyExitTitle')}
    >
      <div className="flex flex-col gap-4 py-2">
        {details ? (
          <>
            <Row
              label={t('students.details.exitReason')}
              value={currentLang === 'ar' ? details.reason : details.reasonEn}
            />
            <Row
              label={t('students.details.delegate')}
              value={currentLang === 'ar' ? details.delegate : details.delegateEn}
            />
            <Row label={t('students.details.exitTimeFromSchool')} value={details.exitTime} />
          </>
        ) : null}
      </div>
    </Modal>
  );
}
