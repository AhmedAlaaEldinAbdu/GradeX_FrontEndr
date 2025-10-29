interface CopyToClipboardOptions {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
  fallbackMessage?: string;
}

export async function copyToClipboard(
  text: string,
  options: CopyToClipboardOptions = {}
): Promise<boolean> {
  const { onSuccess, onError, fallbackMessage } = options;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      onSuccess?.(text);
      return true;
    }

    const success = copyToClipboardFallback(text);

    if (success) {
      onSuccess?.(text);
      return true;
    }

    throw new Error(fallbackMessage || 'Failed to copy to clipboard');
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    return false;
  }
}

function copyToClipboardFallback(text: string): boolean {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  textArea.style.opacity = '0';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    document.body.removeChild(textArea);
    return false;
  }
}

export async function copyCurrentUrl(options?: CopyToClipboardOptions): Promise<boolean> {
  return copyToClipboard(window.location.href, options);
}

export async function copyWithToast(
  text: string,
  showToast: (message: string, type: 'success' | 'error') => void,
  successMessage: string = 'Copied to clipboard!',
  errorMessage: string = 'Failed to copy'
): Promise<boolean> {
  return copyToClipboard(text, {
    onSuccess: () => showToast(successMessage, 'success'),
    onError: () => showToast(errorMessage, 'error'),
  });
}
