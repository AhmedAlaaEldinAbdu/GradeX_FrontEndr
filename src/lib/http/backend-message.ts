/**
 * Backend error-message helpers.
 *
 * Thunks reject (via `rejectWithValue(getErrorMessage(error))`) with the backend
 * `message` string, so `.unwrap()` throws that string. These helpers extract that
 * message from whatever a `catch` block receives so UI can surface the real
 * backend reason instead of a generic fallback.
 */

/**
 * Extract the backend-supplied message from a caught error.
 * Returns an empty string when no usable message is present.
 */
export function getBackendMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return '';
}

/**
 * Build the `{ message, isRaw }` pair used by PopupMessage / toast UIs.
 *
 * When the backend provides a message it is shown verbatim (`isRaw: true`);
 * otherwise the provided i18n fallback key is used (`isRaw: false`).
 */
export function resolveErrorMessage(
  error: unknown,
  fallbackKey = 'common.errorOccurred'
): { message: string; isRaw: boolean } {
  const backendMessage = getBackendMessage(error);
  return {
    message: backendMessage || fallbackKey,
    isRaw: Boolean(backendMessage),
  };
}
