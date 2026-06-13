/**
 * Backend error-message helpers.
 *
 * Thunks reject (via `rejectWithValue(...)`) with one of a few shapes:
 *   - the backend `message` string (from `getErrorMessage`)
 *   - an object carrying `{ message }`
 *   - an object carrying `{ validationErrors: [...] }`
 * The `res` object surfaced in `!isSuccess` branches likewise exposes both
 * `message` and `validationErrors`. These helpers extract a human-readable
 * message from any of those shapes so UI can surface the real backend reason
 * instead of a generic fallback.
 */

/** A single backend validation-error entry (shapes vary across endpoints). */
type ValidationErrorLike = {
  errorMessage?: unknown;
  message?: unknown;
  propertyName?: unknown;
};

/** Join the messages from a `validationErrors` array into one string. */
function extractValidationErrors(value: unknown): string {
  if (!Array.isArray(value)) {
    return '';
  }

  const messages = value
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }
      if (entry && typeof entry === 'object') {
        const item = entry as ValidationErrorLike;
        if (typeof item.errorMessage === 'string') {
          return item.errorMessage;
        }
        if (typeof item.message === 'string') {
          return item.message;
        }
      }
      return '';
    })
    .filter((message) => message.trim().length > 0);

  return Array.from(new Set(messages)).join('\n');
}

/**
 * Extract the backend-supplied message from a caught error or response object.
 * Returns an empty string when no usable message is present.
 */
export function getBackendMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (Array.isArray(error)) {
    return extractValidationErrors(error);
  }

  if (error && typeof error === 'object') {
    const obj = error as { message?: unknown; validationErrors?: unknown };

    // Prefer a top-level message when present and non-empty.
    if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
      return obj.message;
    }

    // Fall back to messages collected from validationErrors.
    const validationMessage = extractValidationErrors(obj.validationErrors);
    if (validationMessage) {
      return validationMessage;
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
