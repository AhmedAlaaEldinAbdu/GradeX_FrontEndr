import { useTranslation } from 'react-i18next';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import ConfirmPopup from './ConfirmPopup';

interface DeletePopupProps {
  open: boolean;
  message: string;
  isMessageRaw?: boolean;
  itemName: string;
  extraMessage?: string;
  isExtraMessageRaw?: boolean;
  extraItemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Ignored: every delete confirmation uses the same icon. Kept so existing callers still compile. */
  iconSrc?: string;
  isProcessing?: boolean;
}

export default function DeletePopup({
  open,
  message,
  isMessageRaw = false,
  itemName,
  extraMessage,
  isExtraMessageRaw = false,
  extraItemName,
  onConfirm,
  onCancel,
  isProcessing,
}: DeletePopupProps) {
  const { t } = useTranslation();
  const { guardMutation } = useRoleAccess();

  const resolvedMessage = isMessageRaw ? message : t(message);
  const resolvedExtraMessage = extraMessage
    ? isExtraMessageRaw
      ? extraMessage
      : t(extraMessage)
    : '';

  return (
    <ConfirmPopup
      open={open}
      tone="danger"
      confirmLabel={t('common.delete')}
      processingLabel={t('common.deleting')}
      onConfirm={() => guardMutation(onConfirm)}
      onCancel={onCancel}
      isProcessing={isProcessing}
    >
      <p className="text-base leading-6 text-[black]">
        {resolvedMessage} {itemName ? `"${itemName}"` : ''}
      </p>
      {resolvedExtraMessage ? (
        <p className="text-sm leading-5 text-[#3A3A3A]">
          {resolvedExtraMessage}
          {extraItemName ? ` "${extraItemName}"` : ''}
        </p>
      ) : null}
    </ConfirmPopup>
  );
}
