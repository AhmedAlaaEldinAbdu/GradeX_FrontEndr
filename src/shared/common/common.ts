export const parseDate = (date?: string): string => {
  return date ? new Date(date).toISOString().split('T')[0] : '';
};

export const parseBooleanField = (value?: boolean | string): boolean => {
  return value === 'true' || value === true;
};

export const logFormData = (formData: FormData): void => {
  console.log('=== FormData Contents ===');

  formData.forEach((value, key) => {
    if (value instanceof File) {
      console.log(`${key}:`, `[File: ${value.name}, Size: ${value.size} bytes]`);
    } else {
      console.log(`${key}:`, value);
    }
  });

  console.log('========================');
};
