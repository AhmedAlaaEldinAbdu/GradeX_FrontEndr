import type {
  CreateOfficialHolidayRequest,
} from '@/services/api/types/official-holidays.types';
import type { AddHolidaysProps, AddFixedHolidayProps } from '@/validations/official-holidays-validations';

// ============================================================================
// Main Transform Functions
// ============================================================================

/**
 * Transform official holiday form data to FormData for API request
 */
export function transformOfficialHolidayToFormData(
  formData: AddHolidaysProps,
  files?: File[]
): FormData {
  const backendFormData = new FormData();

  // Append basic fields
  backendFormData.append('StartDate', new Date(formData.startDate).toISOString());
  backendFormData.append('EndDate', new Date(formData.endDate).toISOString());
  backendFormData.append('LeaveCategory', '2'); // 2 = official holiday
  backendFormData.append('ReasonInAr', formData.reasonInAr);
  backendFormData.append('ReasonInEn', formData.reasonInEn);
  backendFormData.append('LKCountryId', formData.country);

  // Append files if available
  if (files && files.length > 0) {
    files.forEach((file) => {
      backendFormData.append('File', file);
      backendFormData.append('FileName', file.name);

      // If multiple files, only the last one will be used by the API
      // Consider uploading them separately or handling differently based on API requirements
    });
  } else if (formData.officialDocuments && formData.officialDocuments.length > 0) {
    const file = formData.officialDocuments[0] as File;
    if (file) {
      backendFormData.append('File', file);
      backendFormData.append('FileName', file.name);
    }
  }

  return backendFormData;
}

/**
 * Transform fixed holiday form data to FormData for API request
 * Note: Fixed holidays are individual holidays, so we need to create separate requests
 */
export function transformFixedHolidayToFormData(
  holiday: AddFixedHolidayProps['holidays'][0],
  files?: File[]
): FormData {
  const backendFormData = new FormData();

  // Append basic fields
  // For fixed holidays, the day field should be converted to a date
  backendFormData.append('StartDate', new Date(holiday.day).toISOString());
  backendFormData.append('EndDate', new Date(holiday.day).toISOString()); // Same day
  backendFormData.append('LeaveCategory', '1'); // 1 = fixed holiday
  backendFormData.append('ReasonInAr', holiday.reasonInAr);
  backendFormData.append('ReasonInEn', holiday.reasonInEn);
  backendFormData.append('LKCountryId', holiday.country);

  // Append files if available
  if (files && files.length > 0) {
    files.forEach((file) => {
      backendFormData.append('File', file);
      backendFormData.append('FileName', file.name);
    });
  } else if (holiday.officialDocuments && holiday.officialDocuments.length > 0) {
    const file = holiday.officialDocuments[0] as File;
    if (file) {
      backendFormData.append('File', file);
      backendFormData.append('FileName', file.name);
    }
  }

  return backendFormData;
}

/**
 * Transform update holiday data to FormData for API request
 */
export function transformUpdateHolidayToFormData(
  data: {
    startDate: string;
    endDate: string;
    leaveCategory: number;
    reason: string;
    countryId: string;
    file?: File;
  }
): FormData {
  const backendFormData = new FormData();

  backendFormData.append('StartDate', new Date(data.startDate).toISOString());
  backendFormData.append('EndDate', new Date(data.endDate).toISOString());
  backendFormData.append('LeaveCategory', data.leaveCategory.toString());
  backendFormData.append('Reason', data.reason);
  backendFormData.append('LKCountryId', data.countryId);

  if (data.file) {
    backendFormData.append('File', data.file);
    backendFormData.append('FileName', data.file.name);
  }

  return backendFormData;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert form date string to ISO string
 */
function formatDateToISO(dateString: string): string {
  try {
    return new Date(dateString).toISOString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString();
  }
}

/**
 * Validate and extract first file from array
 */
function extractFirstFile(files?: File[] | unknown[]): File | undefined {
  if (!files || files.length === 0) return undefined;

  const firstFile = files[0];
  if (firstFile instanceof File) {
    return firstFile;
  }

  return undefined;
}

/**
 * Create holiday request object from form data
 */
export function createHolidayRequest(
  formData: AddHolidaysProps,
  leaveCategory: number = 1
): CreateOfficialHolidayRequest {
  return {
    StartDate: formatDateToISO(formData.startDate),
    EndDate: formatDateToISO(formData.endDate),
    LeaveCategory: leaveCategory,
    ReasonInAr: formData.reasonInAr,
    ReasonInEn: formData.reasonInEn,
    LKCountryId: formData.country,
    File: extractFirstFile(formData.officialDocuments),
    FileName: extractFirstFile(formData.officialDocuments)?.name,
  };
}

/**
 * Create fixed holiday request object
 */
export function createFixedHolidayRequest(
  holiday: AddFixedHolidayProps['holidays'][0]
): CreateOfficialHolidayRequest {
  return {
    StartDate: formatDateToISO(holiday.day),
    EndDate: formatDateToISO(holiday.day),
    LeaveCategory: 1, // fixed holiday
    ReasonInAr: holiday.reasonInAr,
    ReasonInEn: holiday.reasonInEn,
    LKCountryId: holiday.country,
    File: extractFirstFile(holiday.officialDocuments),
    FileName: extractFirstFile(holiday.officialDocuments)?.name,
  };
}

/**
 * Batch create multiple fixed holidays
 */
export function createFixedHolidayRequests(
  formData: AddFixedHolidayProps
): CreateOfficialHolidayRequest[] {
  return formData.holidays.map((holiday) => createFixedHolidayRequest(holiday));
}

// ============================================================================
// Backend to Form Transformation
// ============================================================================

interface BackendHolidayResponse {
  id: string;
  startDate: string;
  endDate: string;
  leaveCategory: string | number;
  reasonInAr: string;
  reasonInEn: string;
  fileName?: string;
  filePath?: string;
  countryNameAR?: string;
  countryNameEN?: string;
  lkCountryId?: string;
}

/**
 * Transform backend holiday data to form data for editing
 */
export function transformBackendToHolidayForm(
  backendData: BackendHolidayResponse
): AddHolidaysProps {
  const formatDateForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const leaveCategory = typeof backendData.leaveCategory === 'string'
    ? parseInt(backendData.leaveCategory)
    : backendData.leaveCategory;

  return {
    holidayType: leaveCategory === 1 ? 'fixed' : 'official',
    startDate: formatDateForInput(backendData.startDate),
    endDate: formatDateForInput(backendData.endDate),
    reasonInAr: backendData.reasonInAr,
    reasonInEn: backendData.reasonInEn,
    country: backendData.lkCountryId || '',
    officialDocuments: [], // Files can't be pre-populated in forms
  };
}

/**
 * Transform backend holiday to fixed form format
 */
export function transformBackendToFixedHolidayForm(
  backendData: BackendHolidayResponse
): AddFixedHolidayProps['holidays'][0] {
  const formatDateForInput = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return {
    day: formatDateForInput(backendData.startDate),
    reasonInAr: backendData.reasonInAr,
    reasonInEn: backendData.reasonInEn,
    country: backendData.lkCountryId || '',
    officialDocuments: [],
  };
}
