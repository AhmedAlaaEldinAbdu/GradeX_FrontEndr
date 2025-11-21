import type {
  CreateOfficialHolidayRequest,
} from '@/services/api/types/official-holidays.types';
import type { AddHolidaysProps, AddStaticHolidayProps } from '@/validations/official-holidays-validations';

// ============================================================================
// Main Transform Functions
// ============================================================================

/**
 * Transform dynamic holiday form data to FormData for API request
 */
export function transformDynamicHolidayToFormData(
  formData: AddHolidaysProps,
  files?: File[]
): FormData {
  const backendFormData = new FormData();

  // Append basic fields
  backendFormData.append('StartDate', new Date(formData.startDate).toISOString());
  backendFormData.append('EndDate', new Date(formData.endDate).toISOString());
  backendFormData.append('LeaveCategory', '1'); // 1 = official/dynamic holiday
  backendFormData.append('Reason', formData.reason);
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
 * Transform static holiday form data to FormData for API request
 * Note: Static holidays are individual holidays, so we need to create separate requests
 */
export function transformStaticHolidayToFormData(
  holiday: AddStaticHolidayProps['holidays'][0],
  files?: File[]
): FormData {
  const backendFormData = new FormData();

  // Append basic fields
  // For static holidays, the day field should be converted to a date
  backendFormData.append('StartDate', new Date(holiday.day).toISOString());
  backendFormData.append('EndDate', new Date(holiday.day).toISOString()); // Same day
  backendFormData.append('LeaveCategory', '0'); // 0 = static holiday
  backendFormData.append('Reason', holiday.reason);
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
    Reason: formData.reason,
    LKCountryId: formData.country,
    File: extractFirstFile(formData.officialDocuments),
    FileName: extractFirstFile(formData.officialDocuments)?.name,
  };
}

/**
 * Create static holiday request object
 */
export function createStaticHolidayRequest(
  holiday: AddStaticHolidayProps['holidays'][0]
): CreateOfficialHolidayRequest {
  return {
    StartDate: formatDateToISO(holiday.day),
    EndDate: formatDateToISO(holiday.day),
    LeaveCategory: 0, // Static holiday
    Reason: holiday.reason,
    LKCountryId: holiday.country,
    File: extractFirstFile(holiday.officialDocuments),
    FileName: extractFirstFile(holiday.officialDocuments)?.name,
  };
}

/**
 * Batch create multiple static holidays
 */
export function createStaticHolidayRequests(
  formData: AddStaticHolidayProps
): CreateOfficialHolidayRequest[] {
  return formData.holidays.map((holiday) => createStaticHolidayRequest(holiday));
}

// ============================================================================
// Backend to Form Transformation
// ============================================================================

interface BackendHolidayResponse {
  id: string;
  startDate: string;
  endDate: string;
  leaveCategory: string | number;
  reason: string;
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
    holidayType: leaveCategory === 0 ? 'static' : 'official',
    startDate: formatDateForInput(backendData.startDate),
    endDate: formatDateForInput(backendData.endDate),
    reason: backendData.reason,
    country: backendData.lkCountryId || '',
    officialDocuments: [], // Files can't be pre-populated in forms
  };
}

/**
 * Transform backend holiday to static form format
 */
export function transformBackendToStaticHolidayForm(
  backendData: BackendHolidayResponse
): AddStaticHolidayProps['holidays'][0] {
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
    reason: backendData.reason,
    country: backendData.lkCountryId || '',
    officialDocuments: [],
  };
}
