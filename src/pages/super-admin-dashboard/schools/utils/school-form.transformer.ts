import { parseBooleanField, parseDate } from '@/shared/common/common';
import type { SchoolFormData } from '../types/school.types';

// ============================================================================
// Type Definitions
// ============================================================================

interface FileAttachments {
  license: File[];
  image: File[];
  certificate: File[];
  logo?: File[];
  existingLogo?: string; // existing logo URL (edit mode)
  existingLicensePaths?: string[];
  existingCertificatePaths?: string[];
}

export type { ExistingImageAttachment };

interface ExistingImageAttachment {
  id?: string;
  attachmentFile: string;
  name: string;
}

interface BranchData {
  country: string;
  region: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
  logo?: string;
  logoFile?: File;
  latitude?: number;
  longitude?: number;
  schoolSpace?: number;
  buildingCount?: number;
  classCount?: number;
  schoolImageFiles?: File[];
  existingSchoolImages?: ExistingImageAttachment[];
}

interface BackendSchoolData {
  Name?: string;
  AcademicSystemIds?: string[];
  SubSystemIds?: string[];
  FoundingDate?: string;
  Description?: string;
  IsCurrentSystem?: boolean | string;
  Services?: string;
  CountryId?: string;
  FinancialData?: {
    BankName?: string;
    AccountNumber?: string;
    IBAN?: string;
  };
  LandlineNumber?: string;
  PhoneNumber?: string;
  Email?: string;
  WebSite?: string;
  CommunicationOfficer?: string;
  OtherBranches?: boolean | string;
  SchoolBranches?: Array<{
    lkCountryId?: string;
    region?: string;
    city?: string;
    street?: string;
    neighborhood?: string;
    buildingNumber?: string;
    zipCode?: string;
    logo?: string;
  }>;
}

// ============================================================================
// Main Transform Function
// ============================================================================

export function transformSchoolFormBackend(
  formData: SchoolFormData,
  files: FileAttachments,
  branches?: BranchData[],
  existingSchoolImageFiles?: ExistingImageAttachment[],
  lookupFacilities?: Array<{ id: string; arabicName: string; englishName: string }>
): FormData {
  const backendFormData = new FormData();

  appendBasicInformation(backendFormData, formData);
  appendLicenseAttachments(backendFormData, files);
  appendFinancialData(backendFormData, formData);
  appendContactInformation(backendFormData, formData);
  appendAddressAndBranches(backendFormData, formData, branches, files, existingSchoolImageFiles);
  appendApplicationFeatures(backendFormData, formData);
  appendFacilities(backendFormData, formData, files, lookupFacilities);

  return backendFormData;
}

// ============================================================================
// Helper Functions - Append Data to FormData
// ============================================================================

function appendBasicInformation(formData: FormData, schoolData: SchoolFormData): void {
  formData.append('NameAr', schoolData.schoolNameAr || schoolData.schoolName);
  formData.append('NameEn', schoolData.schoolNameEn || schoolData.schoolName);

  const academicSystemIds = (schoolData.academicSystemIds || []).filter(Boolean);
  academicSystemIds.forEach((id, index) => {
    formData.append(`AcademicSystemIds[${index}]`, id);
  });

  if (schoolData.subSystemIds && schoolData.subSystemIds.length > 0) {
    schoolData.subSystemIds.forEach((subSystemId, index) => {
      formData.append(`SubSystemIds[${index}]`, subSystemId);
    });
  }

  const foundingDate = formatFoundingDate(schoolData.foundationDate);
  formData.append('FoundingDate', foundingDate);

  formData.append('Description', schoolData.aboutSchool || '');
  formData.append('IsCurrentSystem', schoolData.hasCurrentSystem ? 'true' : 'false');

  if (schoolData.hasCurrentSystem && schoolData.currentSystem) {
    formData.append('Services', schoolData.currentSystem);
  }
}

function appendLicenseAttachments(formData: FormData, files: FileAttachments): void {
  let index = 0;

  (files.existingLicensePaths || []).forEach((path) => {
    if (!path) return;
    formData.append(`LicensesAttachments[${index}].attachmentFile`, path);
    formData.append(
      `LicensesAttachments[${index}].attachmentName`,
      path.split('/').pop() || 'License'
    );
    index++;
  });

  // Append newly uploaded license files
  (files.license || []).forEach((file) => {
    formData.append(`LicensesAttachments[${index}].attachmentFile`, file);
    formData.append(`LicensesAttachments[${index}].attachmentName`, file.name || 'School Logo');
    index++;
  });
}

function appendFinancialData(formData: FormData, schoolData: SchoolFormData): void {
  formData.append('FinancialData.BankName', schoolData.bankName);
  formData.append('FinancialData.IBAN', schoolData.ibanNumber);
  formData.append('FinancialData.AccountNumber', schoolData.accountNumber);
}

function appendContactInformation(formData: FormData, schoolData: SchoolFormData): void {
  formData.append('Email', schoolData.email);
  formData.append('WebSite', schoolData.website || '');
  formData.append('PhoneNumber', schoolData.phoneNumber);
  formData.append('LandlineNumber', schoolData.landline);
  formData.append('CommunicationOfficer', schoolData.contactPerson);
}

function appendAddressAndBranches(
  formData: FormData,
  schoolData: SchoolFormData,
  branches?: BranchData[],
  files?: FileAttachments,
  existingSchoolImageFiles?: ExistingImageAttachment[]
): void {
  formData.append('OtherBranches', schoolData.hasBranches ? 'true' : 'false');

  appendMainBranch(formData, schoolData, files, existingSchoolImageFiles);

  if (branches && branches.length > 0) {
    appendAdditionalBranches(formData, branches);
  }
}

function appendApplicationFeatures(formData: FormData, schoolData: SchoolFormData): void {
  if (!schoolData.applicationFeatures?.length) return;

  schoolData.applicationFeatures.forEach((featureId, index) => {
    formData.append(`ApplicationFeaturesId[${index}]`, featureId);
  });
}

function appendFacilities(
  formData: FormData,
  schoolData: SchoolFormData,
  files: FileAttachments,
  lookupFacilities?: Array<{ id: string; arabicName: string; englishName: string }>
): void {
  let facilityIndex = 0;

  // Append regular facilities
  if (schoolData.facilities?.length) {
    schoolData.facilities.forEach((facilityId) => {
      const facilityDetail = schoolData.facilityDetails?.[facilityId];
      const lookup = lookupFacilities?.find((f) => f.id === facilityId);

      const isExisting = !!facilityDetail?.oldFacilityId;

      if (isExisting) {
        formData.append(`Facilities[${facilityIndex}].id`, facilityDetail!.oldFacilityId!);
      }

      const arabicName = facilityDetail?.arabicName || lookup?.arabicName;
      const englishName = facilityDetail?.englishName || lookup?.englishName;

      if (arabicName) {
        formData.append(`Facilities[${facilityIndex}].arabicName`, arabicName);
      }
      if (englishName) {
        formData.append(`Facilities[${facilityIndex}].englishName`, englishName);
      }

      if (facilityDetail) {
        formData.append(`Facilities[${facilityIndex}].description`, facilityDetail.description);

        if (facilityDetail.imageFile) {
          formData.append(`Facilities[${facilityIndex}].imageUrl`, facilityDetail.imageFile);
        } else if (facilityDetail.imageUrl) {
          formData.append(`Facilities[${facilityIndex}].imageUrl`, facilityDetail.imageUrl);
        }
      }

      facilityIndex++;
    });
  }

  // Append "Other" custom facility (without ID)
  if (schoolData.hasOtherFacility) {
    const arabicName =
      schoolData.otherFacilityNameAr?.trim() || schoolData.otherFacilityName?.trim() || '';
    const englishName = schoolData.otherFacilityNameEn?.trim() || '';

    if (arabicName && englishName) {
      const otherFacilityDetail = schoolData.facilityDetails?.['other'];

      if (otherFacilityDetail?.oldFacilityId) {
        formData.append(`Facilities[${facilityIndex}].id`, otherFacilityDetail.oldFacilityId);
      }

      formData.append(`Facilities[${facilityIndex}].arabicName`, arabicName);
      formData.append(`Facilities[${facilityIndex}].englishName`, englishName);

      // Append "Other" facility details if available
      if (otherFacilityDetail) {
        formData.append(
          `Facilities[${facilityIndex}].description`,
          otherFacilityDetail.description
        );

        if (otherFacilityDetail.imageFile) {
          formData.append(`Facilities[${facilityIndex}].imageUrl`, otherFacilityDetail.imageFile);
        } else if (otherFacilityDetail.imageUrl) {
          formData.append(`Facilities[${facilityIndex}].imageUrl`, otherFacilityDetail.imageUrl);
        }
      }
    }
  }

  // Append certificate files (surviving existing certificates + newly uploaded)
  const hasNewCertificates = files.certificate && files.certificate.length > 0;
  const hasExistingCertificates =
    files.existingCertificatePaths && files.existingCertificatePaths.length > 0;
  if (hasNewCertificates || hasExistingCertificates) {
    appendFacilityCertificates(
      formData,
      files.certificate || [],
      files.existingCertificatePaths || []
    );
  }
}

// ============================================================================
// Helper Functions - Branch Handling
// ============================================================================

function appendMainBranch(
  formData: FormData,
  schoolData: SchoolFormData,
  files?: FileAttachments,
  existingSchoolImageFiles?: ExistingImageAttachment[]
): void {
  const branchFields = {
    street: schoolData.street,
    city: schoolData.city,
    zipCode: schoolData.postalCode,
    neighborhood: schoolData.district,
    lkCountryId: schoolData.addressCountry,
    region: schoolData.region,
    buildingNumber: schoolData.buildingNumber,
    latitude: '0',
    longitude: '0',
  };

  Object.entries(branchFields).forEach(([key, value]) => {
    formData.append(`SchoolBranches[0].${key}`, value);
  });

  // Logo for main branch
  const logoFile = files?.logo?.[0];
  if (logoFile) {
    formData.append('SchoolBranches[0].logo', logoFile);
  } else if (files?.existingLogo) {
    // Re-send the existing logo URL so the backend keeps it
    formData.append('SchoolBranches[0].logo', files.existingLogo);
  } else {
    formData.append('SchoolBranches[0].logo', '');
  }

  // schoolImageAttachmentsDto for main branch
  const existing = (existingSchoolImageFiles || []).filter(
    (a) => typeof a.attachmentFile === 'string' && a.attachmentFile.trim().length > 0
  );
  const newImageFiles = files?.image || [];
  let imgIndex = 0;

  // Re-send existing attachments with their id so the backend keeps them
  existing.forEach((attachment) => {
    const prefix = `SchoolBranches[0].schoolImageAttachmentsDto[${imgIndex}]`;
    if (attachment.id) {
      formData.append(`${prefix}.id`, attachment.id);
    }
    formData.append(`${prefix}.attachmentFile`, attachment.attachmentFile);
    formData.append(`${prefix}.name`, attachment.name || 'schoolImage');
    imgIndex++;
  });

  // Append newly uploaded image files (no id — backend generates one)
  newImageFiles.forEach((file) => {
    const prefix = `SchoolBranches[0].schoolImageAttachmentsDto[${imgIndex}]`;
    formData.append(`${prefix}.attachmentFile`, file);
    formData.append(`${prefix}.name`, 'schoolImage');
    imgIndex++;
  });
}

function appendAdditionalBranches(formData: FormData, branches: BranchData[]): void {
  branches.forEach((branch, index) => {
    const branchIndex = index + 1;
    appendBranchData(formData, branch, branchIndex);
  });
}

function appendBranchData(formData: FormData, branch: BranchData, index: number): void {
  const prefix = `SchoolBranches[${index}]`;

  formData.append(`${prefix}.street`, branch.street);
  formData.append(`${prefix}.city`, branch.city);
  formData.append(`${prefix}.zipCode`, branch.postalCode);
  formData.append(`${prefix}.neighborhood`, branch.district);
  formData.append(`${prefix}.lkCountryId`, branch.country);
  formData.append(`${prefix}.region`, branch.region);
  formData.append(`${prefix}.buildingNumber`, branch.buildingNumber);
  // Logo: prefer uploaded file, fall back to existing URL
  if (branch.logoFile) {
    formData.append(`${prefix}.logo`, branch.logoFile);
  } else {
    formData.append(`${prefix}.logo`, branch.logo || '');
  }

  formData.append(`${prefix}.latitude`, branch.latitude?.toString() || '0');
  formData.append(`${prefix}.longitude`, branch.longitude?.toString() || '0');

  if (branch.schoolSpace !== undefined) {
    formData.append(`${prefix}.schoolSpace`, branch.schoolSpace.toString());
  }
  if (branch.buildingCount !== undefined) {
    formData.append(`${prefix}.buildingCount`, branch.buildingCount.toString());
  }
  if (branch.classCount !== undefined) {
    formData.append(`${prefix}.classCount`, branch.classCount.toString());
  }

  // schoolImageAttachmentsDto per additional branch
  const existingImgs = (branch.existingSchoolImages || []).filter(
    (a) => typeof a.attachmentFile === 'string' && a.attachmentFile.trim().length > 0
  );
  const newImgFiles = branch.schoolImageFiles || [];
  let imgIdx = 0;

  // Re-send existing attachments with their id so the backend keeps them
  existingImgs.forEach((attachment) => {
    const imgPrefix = `${prefix}.schoolImageAttachmentsDto[${imgIdx}]`;
    if (attachment.id) {
      formData.append(`${imgPrefix}.id`, attachment.id);
    }
    formData.append(`${imgPrefix}.attachmentFile`, attachment.attachmentFile);
    formData.append(`${imgPrefix}.name`, attachment.name || 'schoolImage');
    imgIdx++;
  });

  // Append newly uploaded image files (no id — backend generates one)
  newImgFiles.forEach((file) => {
    const imgPrefix = `${prefix}.schoolImageAttachmentsDto[${imgIdx}]`;
    formData.append(`${imgPrefix}.attachmentFile`, file);
    formData.append(`${imgPrefix}.name`, 'schoolImage');
    imgIdx++;
  });
}

// The .NET empty/default GUID. The backend may send this when no value is set; it must
// not be treated as a real selection (otherwise it gets re-sent on save).
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

const isMeaningfulId = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim() !== EMPTY_GUID;

function extractAcademicSystemIds(academicSystemIds: unknown): string[] {
  if (Array.isArray(academicSystemIds)) {
    return academicSystemIds.filter(isMeaningfulId);
  }
  if (isMeaningfulId(academicSystemIds)) {
    return [academicSystemIds];
  }
  return [];
}

function formatFoundingDate(date?: string): string {
  return date ? new Date(date).toISOString() : new Date().toISOString();
}

function appendFacilityCertificates(
  formData: FormData,
  certificates: File[],
  existingPaths: string[] = []
): void {
  let oldIndex = 0;
  existingPaths.forEach((path) => {
    if (!path) return;
    formData.append(`Facilities[0].oldFacilitiesFilePath[${oldIndex}]`, path);
    oldIndex++;
  });

  let newIndex = 0;
  (certificates || []).forEach((certificate) => {
    const prefix = `facilities[0].licensesAttachmentFacilitiesDto[${newIndex}]`;
    formData.append(`${prefix}.attachmentFile`, certificate);
    formData.append(
      `${prefix}.attachmentName`,
      certificate.name || `Facility Certificate ${newIndex + 1}`
    );
    newIndex++;
  });
}

// ============================================================================
// Backend to Form Transformation
// ============================================================================

interface BackendSchoolResponse {
  id?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  subSystemIds?: string[];
  foundingDate?: string;
  description?: string;
  services?: string | null;
  numberOfStudents?: number | null;
  numberOfTeachers?: number | null;
  isCurrentSystem?: boolean;
  financialData?: {
    id?: string;
    bankName?: string;
    iban?: string;
    accountNumber?: string;
    schoolId?: string;
  };
  email?: string;
  webSite?: string;
  phoneNumber?: string;
  landlineNumber?: string;
  communicationOfficer?: string;
  schoolStatus?: number;
  schoolGender?: number;
  otherBranches?: boolean;
  schoolStagesDto?: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    lkSchoolStageId: string;
    schoolId: string;
  }>;
  applicationFeaturesDto?: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    lkApplicationFeatureId: string;
    schoolId: string;
  }>;
  licensesAttachments?: Array<{
    id: string;
    fileName: string;
    filePath: string;
    schoolId: string;
  }>;
  schoolImageAttachmentsDto?: Array<{
    id: string;
    attachmentFile: string;
    name: string;
  }>;
  schoolBranches?: Array<{
    id: string;
    lkCountryId: string;
    city: string;
    neighborhood: string;
    region: string;
    street: string;
    buildingNumber: string;
    zipCode: string;
    logo?: string;
    buildingCount: number;
    classCount: number;
    schoolSpace: number;
    latitude: number;
    longitude: number;
    address: string;
    schoolId: string;
    // backend may return either name variant
    schoolImageAttachmentsDto?: Array<{ id: string; attachmentFile: string; name?: string }>;
    schoolImageAttachments?: Array<{ id: string; attachmentFile: string; name?: string }>;
  }>;
  facilities?: Array<{
    id: string;
    arabicName: string;
    englishName: string;
    description: string;
    imageUrl: string;
    schoolId: string;
    licensesAttachmentsFacilities: Array<{
      id: string;
      attachmentFile: string;
      attachmentName: string;
      lkFacilitiesId: string;
    }>;
  }>;
}

export function transformBackendToSchoolForm(backendData: unknown): SchoolFormData {
  const data = backendData as BackendSchoolData;

  const academicSystemIdsRaw =
    (data as any).AcademicSystemIds ??
    (data as any).academicSystemIds ??
    (data as any).AcademicSystemId ??
    (data as any).academicSystemId;
  const academicSystemIds = extractAcademicSystemIds(academicSystemIdsRaw);

  const subSystemIdsRaw = (data as any).SubSystemIds ?? (data as any).subSystemIds;
  const subSystemIds = Array.isArray(subSystemIdsRaw)
    ? subSystemIdsRaw.filter((value) => typeof value === 'string' && value.trim().length > 0)
    : [];

  return {
    // Basic Information
    schoolName: data.Name || '',
    schoolNameAr: data.Name || '',
    schoolNameEn: data.Name || '',
    academicSystemIds,
    subSystemIds,
    foundationDate: parseDate(data.FoundingDate),
    aboutSchool: data.Description || '',
    hasCurrentSystem: parseBooleanField(data.IsCurrentSystem),
    currentSystem: data.Services || '',
    country: data.CountryId || '',
    applicationFeatures: [],

    // Financial Data
    bankName: data.FinancialData?.BankName || '',
    accountNumber: data.FinancialData?.AccountNumber || '',
    ibanNumber: data.FinancialData?.IBAN || '',

    // Contact Information
    landline: data.LandlineNumber || '',
    phoneNumber: data.PhoneNumber || '',
    email: data.Email || '',
    website: data.WebSite || '',
    contactPerson: data.CommunicationOfficer || '',

    // Address (from main branch)
    addressCountry: data.SchoolBranches?.[0]?.lkCountryId || '',
    region: data.SchoolBranches?.[0]?.region || '',
    state: '',
    city: data.SchoolBranches?.[0]?.city || '',
    street: data.SchoolBranches?.[0]?.street || '',
    district: data.SchoolBranches?.[0]?.neighborhood || '',
    buildingNumber: data.SchoolBranches?.[0]?.buildingNumber || '',
    postalCode: data.SchoolBranches?.[0]?.zipCode || '',

    // Branches
    hasBranches: parseBooleanField(data.OtherBranches),
    hasOtherBranches: parseBooleanField(data.OtherBranches),

    // Facilities
    facilities: [],
    facilityDetails: {},
    hasOtherFacility: false,
    otherFacilityName: '',
  };
}

/**
 * Transform backend API response to frontend form data
 * Also extracts file information and branches for display in view mode
 *
 * Note: This function will be called from the component where lookup facilities are available
 * We'll use a helper to match facilities by name
 */
export function transformBackendSchoolToForm(
  backendData: unknown,
  lookupFacilities?: Array<{ id: string; arabicName: string; englishName: string }>
): SchoolFormData & {
  licenseFiles?: string[];
  imageFiles?: ExistingImageAttachment[];
  certificateFiles?: string[];
  logoFile?: string;
  branches?: Array<{
    country: string;
    region: string;
    city: string;
    district: string;
    street: string;
    buildingNumber: string;
    postalCode: string;
    logo?: string;
    logoFile?: File;
    schoolImageFiles?: File[];
    existingSchoolImages?: Array<{ id: string; attachmentFile: string; name: string }>;
    latitude?: number;
    longitude?: number;
  }>;
} {
  const data = backendData as BackendSchoolResponse;

  // Extract application feature IDs
  const applicationFeatures =
    data.applicationFeaturesDto?.map((feature) => feature.lkApplicationFeatureId) || [];

  const subSystemIdsRaw =
    (data as any).subSystemIds ??
    (data as any).SubSystemIds ??
    (data as any).subSystemId ??
    (data as any).SubSystemId;
  const subSystemIds = Array.isArray(subSystemIdsRaw)
    ? subSystemIdsRaw.filter(isMeaningfulId)
    : isMeaningfulId(subSystemIdsRaw)
      ? [subSystemIdsRaw]
      : [];

  const academicSystemIdsRaw =
    (data as any).academicSystemIds ??
    (data as any).AcademicSystemIds ??
    (data as any).academicSystemId ??
    (data as any).AcademicSystemId;
  const academicSystemIds = extractAcademicSystemIds(academicSystemIdsRaw);

  // Extract license file paths from attachments (use filePath for full URL access)
  const licenseFiles = data.licensesAttachments?.map((attachment) => attachment.filePath) || [];

  // Extract school images - prefer per-branch images from main branch, fall back to top-level
  const rawImageAttachments =
    data.schoolBranches?.[0]?.schoolImageAttachments ??
    data.schoolBranches?.[0]?.schoolImageAttachmentsDto ??
    data.schoolImageAttachmentsDto ??
    [];
  const imageFiles: ExistingImageAttachment[] = rawImageAttachments
    .filter((a) => typeof a.attachmentFile === 'string' && a.attachmentFile.trim().length > 0)
    .map((a) => ({ id: a.id, attachmentFile: a.attachmentFile, name: a.name ?? 'schoolImage' }));

  // Extract logo URL from main branch
  const logoFile = data.schoolBranches?.[0]?.logo || '';

  // Extract certificate files from all facilities
  const certificateFiles: string[] = [];
  data.facilities?.forEach((facility) => {
    facility.licensesAttachmentsFacilities?.forEach((attachment) => {
      if (attachment.attachmentFile) {
        certificateFiles.push(attachment.attachmentFile);
      }
    });
  });

  // Extract facilities IDs and details
  // Use the facility.id directly as it matches the lookup facility IDs
  const facilities: string[] = [];
  const facilityDetails: Record<
    string,
    {
      id: string;
      arabicName?: string;
      englishName?: string;
      description: string;
      imageUrl?: string;
      oldFacilitiesFilePath?: string[];
      oldFacilityId?: string;
    }
  > = {};

  // Variables to track "other" facility
  let hasOtherFacility = false;
  let otherFacilityNameAr = '';
  let otherFacilityNameEn = '';

  data.facilities?.forEach((facility) => {
    if (!facility) return;

    // Try to find matching lookup facility by Arabic and English names
    let matchedLookupFacility = null;
    if (lookupFacilities && facility.arabicName && facility.englishName) {
      matchedLookupFacility = lookupFacilities.find(
        (lookup) =>
          lookup.arabicName?.toLowerCase() === facility.arabicName?.toLowerCase() &&
          lookup.englishName?.toLowerCase() === facility.englishName?.toLowerCase()
      );
    }

    if (matchedLookupFacility) {
      if (facilityDetails[matchedLookupFacility.id]) {
        return;
      }

      // This facility matches a lookup facility by name
      // Use the lookup facility ID for the form
      facilities.push(matchedLookupFacility.id);

      // Store complete facility details for display using the lookup ID
      facilityDetails[matchedLookupFacility.id] = {
        id: matchedLookupFacility.id,

        oldFacilityId: facility.id,
        arabicName: facility.arabicName,
        englishName: facility.englishName,
        description: facility.description || '',
        imageUrl: facility.imageUrl,
        oldFacilitiesFilePath: facility.licensesAttachmentsFacilities?.map(
          (att) => att.attachmentFile
        ),
      };

      console.log(
        `✅ Matched facility by name: ${matchedLookupFacility.id} - ${facility.arabicName} / ${facility.englishName}`
      );
    } else if (facility.arabicName && facility.englishName) {
      // This is a custom "other" facility (no match in lookups)
      hasOtherFacility = true;
      otherFacilityNameAr = facility.arabicName;
      otherFacilityNameEn = facility.englishName;

      // Store details under 'other' key
      facilityDetails['other'] = {
        id: 'other',

        oldFacilityId: facility.id,
        arabicName: facility.arabicName,
        englishName: facility.englishName,
        description: facility.description || '',
        imageUrl: facility.imageUrl,
        oldFacilitiesFilePath: facility.licensesAttachmentsFacilities?.map(
          (att) => att.attachmentFile
        ),
      };

      console.log(
        `✅ Added custom "other" facility: ${facility.arabicName} / ${facility.englishName}`
      );
    }
  });

  console.log('📋 Total facilities found:', facilities.length);
  console.log('📋 Facility IDs:', facilities);
  console.log('📋 Has other facility:', hasOtherFacility);

  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return {
    // Basic Information
    schoolName: data.name || data.nameAr || data.nameEn || '',
    schoolNameAr: data.nameAr || '',
    schoolNameEn: data.nameEn || '',
    academicSystemIds,
    subSystemIds,
    foundationDate: formatDateForInput(data.foundingDate),
    aboutSchool: data.description || '',
    hasCurrentSystem: data.isCurrentSystem || false,
    currentSystem: data.services || '',
    country: data.schoolBranches?.[0]?.lkCountryId || '',

    // Application Features
    applicationFeatures,

    // Financial Data
    bankName: data.financialData?.bankName || '',
    accountNumber: data.financialData?.accountNumber || '',
    ibanNumber: data.financialData?.iban || '',

    // Contact Information
    landline: data.landlineNumber || '',
    phoneNumber: data.phoneNumber || '',
    email: data.email || '',
    website: data.webSite || '',
    contactPerson: data.communicationOfficer || '',

    // Address (from main branch)
    addressCountry: data.schoolBranches?.[0]?.lkCountryId || '',
    region: data.schoolBranches?.[0]?.region || '',
    state: '',
    city: data.schoolBranches?.[0]?.city || '',
    street: data.schoolBranches?.[0]?.street || '',
    district: data.schoolBranches?.[0]?.neighborhood || '',
    buildingNumber: data.schoolBranches?.[0]?.buildingNumber || '',
    postalCode: data.schoolBranches?.[0]?.zipCode || '',

    // Branches (extract additional branches beyond the first one)
    hasBranches: !!(data.schoolBranches && data.schoolBranches.length > 1),
    hasOtherBranches: !!(data.schoolBranches && data.schoolBranches.length > 1),

    // Facilities
    facilities,
    facilityDetails,
    hasOtherFacility,
    otherFacilityName: otherFacilityNameAr, // Backward compatibility
    otherFacilityNameAr,
    otherFacilityNameEn,

    // Files from backend (for view mode)
    licenseFiles,
    imageFiles,
    certificateFiles,
    logoFile,

    // Additional branches (for view/edit mode) - skip the first branch as it's the main address
    branches:
      data.schoolBranches && data.schoolBranches.length > 1
        ? data.schoolBranches.slice(1).map((branch) => ({
            country: branch.lkCountryId || '',
            region: branch.region || '',
            city: branch.city || '',
            district: branch.neighborhood || '',
            street: branch.street || '',
            buildingNumber: branch.buildingNumber || '',
            postalCode: branch.zipCode || '',
            logo: branch.logo || '',
            latitude: branch.latitude,
            longitude: branch.longitude,
            schoolImageFiles: [] as File[],
            existingSchoolImages:
              (branch.schoolImageAttachments ?? branch.schoolImageAttachmentsDto)
                ?.filter((a) => a.attachmentFile)
                .map((a) => ({
                  id: a.id,
                  attachmentFile: a.attachmentFile,
                  name: a.name ?? 'schoolImage',
                })) ?? [],
          }))
        : [],
  };
}
