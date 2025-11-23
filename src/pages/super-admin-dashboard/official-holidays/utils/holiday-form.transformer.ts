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
  backendFormData.append('ReasonAr', formData.reasonAr);
  backendFormData.append('ReasonEn', formData.reasonEn);
  backendFormData.append('LKCountryId', formData.country);

  // Append files if available
  if (files && files.length > 0) {
    files.forEach((file) => {
      backendFormData.append('File', file);
      backendFormData.append('FileName', file.name);
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
 */
export function transformFixedHolidayToFormData(
  formData: AddFixedHolidayProps,
  files?: File[]
): FormData {
  const backendFormData = new FormData();

  // For fixed holidays, the day field should be converted to a date
  backendFormData.append('day', formData.day.toString());
  backendFormData.append('LeaveCategory', '1'); // 1 = fixed holiday
  backendFormData.append('ReasonAr', formData.reasonAr);
  backendFormData.append('ReasonEn', formData.reasonEn);
  backendFormData.append('LKCountryId', formData.country);
  if (files && files.length > 0) {
    files.forEach((file) => {
      backendFormData.append('File', file);
      backendFormData.append('FileName', file.name);
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
 * Transform update holiday data to FormData for API request
 */
export function transformUpdateHolidayToFormData(
  data: {
    startDate?: string;
    endDate?: string;
    day?: number;
    leaveCategory: number;
    reason: string;
    countryId: string;
    file?: File;
  }
): FormData {
  const backendFormData = new FormData();
  if (data.startDate !== undefined) {
    backendFormData.append('StartDate', new Date(data.startDate).toISOString());
  }
  if (data.endDate !== undefined) {
    backendFormData.append('EndDate', new Date(data.endDate).toISOString());
  }
  if (data.day !== undefined) {
    backendFormData.append('day', data.day.toString());
  }
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
  leaveCategory: number = 2
): CreateOfficialHolidayRequest {
  return {
    StartDate: formatDateToISO(formData.startDate),
    EndDate: formatDateToISO(formData.endDate),
    LeaveCategory: leaveCategory,
    ReasonAr: formData.reasonAr,
    ReasonEN: formData.reasonEn,
    LKCountryId: formData.country,
    File: extractFirstFile(formData.officialDocuments),
    FileName: extractFirstFile(formData.officialDocuments)?.name,
  };
}

/**
 * Create official holiday request object (alias for clarity)
 */
export function createOfficialHolidayRequest(
  formData: AddHolidaysProps
): CreateOfficialHolidayRequest {
  return createHolidayRequest(formData, 2); // LeaveCategory = 2 for official
}

/**
 * Create fixed holiday request object
 */
export function createFixedHolidayRequest(
  holiday: AddFixedHolidayProps
): CreateOfficialHolidayRequest {
  // Convert day enum to integer
  const dayValue = typeof holiday.day === 'string' ? parseInt(holiday.day) : holiday.day;

  return {
    Day: dayValue, // Send day as integer (1-7) for fixed holidays
    LeaveCategory: 1, // fixed holiday
    ReasonAr: holiday.reasonAr,
    ReasonEN: holiday.reasonEn,
    LKCountryId: holiday.country,
    File: extractFirstFile(holiday.officialDocuments),
    FileName: extractFirstFile(holiday.officialDocuments)?.name,
  };
}

// ============================================================================
// Backend to Form Transformation
// ============================================================================

interface BackendHolidayResponse {
  id: string;
  startDate: string;
  endDate: string;
  day: number;
  leaveCategory: string | number;
  reasonAr: string;
  reasonEn: string;
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
    holidayType: leaveCategory,
    startDate: formatDateForInput(backendData.startDate),
    endDate: formatDateForInput(backendData.endDate),
    reasonAr: backendData.reasonAr,
    reasonEn: backendData.reasonEn,
    country: backendData.lkCountryId || '',
    officialDocuments: [], // Files can't be pre-populated in forms
  };
}

/**
 * Transform backend holiday to fixed form format
 */
export function transformBackendToFixedHolidayForm(
  backendData: BackendHolidayResponse
): AddFixedHolidayProps {
  const leaveCategory = typeof backendData.leaveCategory === 'string'
    ? parseInt(backendData.leaveCategory)
    : backendData.leaveCategory;

  return {
    holidayType: leaveCategory,
    day: backendData.day || 0, // Use day field directly from backend
    reasonAr: backendData.reasonAr,
    reasonEn: backendData.reasonEn,
    country: backendData.lkCountryId || '',
    officialDocuments: [],
  };
}
