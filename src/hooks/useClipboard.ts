import { copyToClipboard } from '@/shared/common/clipboard';
import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  successDuration?: number;
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
}

interface UseClipboardReturn {
  isCopied: boolean;
  isError: boolean;
  copyToClipboard: (text: string) => Promise<boolean>;
  reset: () => void;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { successDuration = 2000, onSuccess, onError } = options;
  const [isCopied, setIsCopied] = useState(false);
  const [isError, setIsError] = useState(false);

  const reset = useCallback(() => {
    setIsCopied(false);
    setIsError(false);
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      reset();

      const success = await copyToClipboard(text, {
        onSuccess: (copiedText) => {
          setIsCopied(true);
          onSuccess?.(copiedText);

          // Auto-reset after duration
          setTimeout(() => {
            setIsCopied(false);
          }, successDuration);
        },
        onError: (error: Error) => {
          setIsError(true);
          onError?.(error);

          // Auto-reset error after duration
          setTimeout(() => {
            setIsError(false);
          }, successDuration);
        },
      });

      return success;
    },
    [successDuration, onSuccess, onError, reset]
  );

  return {
    isCopied,
    isError,
    copyToClipboard: copy,
    reset,
  };
}
