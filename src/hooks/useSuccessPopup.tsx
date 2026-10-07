import { useCallback, useState } from 'react';
import SuccessPopup from '@/shared/popups/SuccessPopup';

export function useSuccessPopup() {
  const [content, setContent] = useState<{ message: string; icon?: string } | null>(null);

  const showSuccess = useCallback(
    (message: string, icon?: string) => setContent({ message, icon }),
    []
  );
  const closeSuccess = useCallback(() => setContent(null), []);

  const successPopup = (
    <SuccessPopup
      open={Boolean(content)}
      message={content?.message ?? ''}
      icon={content?.icon}
      isMessageRaw
      onClose={closeSuccess}
    />
  );

  return { showSuccess, successPopup };
}
