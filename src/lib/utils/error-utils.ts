interface ValidationError {
  identifier?: string | null;
  errorMessage: string;
  errorCode?: string | null;
  severity?: number;
}

export function extractErrorMessage(
  errors: unknown,
  fallbackMessage: string = 'An error occurred'
): string {
  if (!errors) return '';

  if (typeof errors === 'string') {
    return errors;
  }

  if (Array.isArray(errors) && errors.length > 0) {
    const firstError = errors[0];

    if (typeof firstError === 'object' && firstError !== null && 'errorMessage' in firstError) {
      return (firstError as ValidationError).errorMessage || fallbackMessage;
    }

    if (typeof firstError === 'string') {
      return firstError;
    }
  }

  if (typeof errors === 'object' && errors !== null) {
    const errorValues = Object.values(errors);
    if (errorValues.length > 0) {
      const firstError = errorValues[0];

      if (typeof firstError === 'object' && firstError !== null && 'errorMessage' in firstError) {
        return (firstError as ValidationError).errorMessage || fallbackMessage;
      }

      if (typeof firstError === 'string') {
        return firstError;
      }
    }
  }

  return fallbackMessage;
}

export function hasErrors(validationErrors: unknown, error: unknown): boolean {
  return !!(validationErrors || error);
}
