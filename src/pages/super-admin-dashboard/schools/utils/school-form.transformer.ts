import { parseBooleanField, parseDate } from '@/shared/common/common';
import type { SchoolFormData } from '../types/school.types';

// ============================================================================
// Type Definitions
// ============================================================================

interface FileAttachments {
  license: File[];
  image: File[];
  certificate: File[];
}

interface BranchData {
  country: string;
  region: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  schoolSpace?: number;
  buildingCount?: number;
  classCount?: number;
}

interface BackendSchoolData {
  Name?: string;
  AcademicSystemId?: string;
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
  }>;
}

// ============================================================================
// Main Transform Function
// ============================================================================

export function transformSchoolFormBackend(
  formData: SchoolFormData,
  files: FileAttachments,
  branches?: BranchData[]
): FormData {
  const backendFormData = new FormData();

  appendBasicInformation(backendFormData, formData);
  appendLicenseAttachments(backendFormData, files);
  appendFinancialData(backendFormData, formData);
  appendContactInformation(backendFormData, formData);
  appendAddressAndBranches(backendFormData, formData, branches);
  appendApplicationFeatures(backendFormData, formData);
  appendFacilities(backendFormData, formData, files);

  return backendFormData;
}

// ============================================================================
// Helper Functions - Append Data to FormData
// ============================================================================

function appendBasicInformation(formData: FormData, schoolData: SchoolFormData): void {
  formData.append('Name', schoolData.schoolName);

  const academicSystemId = extractAcademicSystemId(schoolData.academicSystem);
  formData.append('AcademicSystemId', academicSystemId);

  const foundingDate = formatFoundingDate(schoolData.foundationDate);
  formData.append('FoundingDate', foundingDate);

  formData.append('Description', schoolData.aboutSchool || '');
  formData.append('IsCurrentSystem', schoolData.hasCurrentSystem ? 'true' : 'false');

  if (schoolData.hasCurrentSystem && schoolData.currentSystem) {
    formData.append('Services', schoolData.currentSystem);
  }
}

function appendLicenseAttachments(formData: FormData, files: FileAttachments): void {
  const attachments = collectLicenseAttachments(files);

  attachments.forEach((attachment, index) => {
    formData.append(`LicensesAttachments[${index}].attachmentFile`, attachment.file);
    formData.append(`LicensesAttachments[${index}].attachmentName`, attachment.name);
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
  branches?: BranchData[]
): void {
  formData.append('OtherBranches', schoolData.hasBranches ? 'true' : 'false');

  appendMainBranch(formData, schoolData);

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
  files: FileAttachments
): void {
  let facilityIndex = 0;

  // Append regular facilities
  if (schoolData.facilities?.length) {
    schoolData.facilities.forEach((facilityId) => {
      formData.append(`Facilities[${facilityIndex}].id`, facilityId);

      const facilityDetail = schoolData.facilityDetails?.[facilityId];
      if (facilityDetail) {
        if (facilityDetail.arabicName) {
          formData.append(`Facilities[${facilityIndex}].arabicName`, facilityDetail.arabicName);
        }
        if (facilityDetail.englishName) {
          formData.append(`Facilities[${facilityIndex}].englishName`, facilityDetail.englishName);
        }
        formData.append(`Facilities[${facilityIndex}].description`, facilityDetail.description);

        if (facilityDetail.imageFile) {
          formData.append(`Facilities[${facilityIndex}].imageUrl`, facilityDetail.imageFile);
        } else if (facilityDetail.imageUrl) {
          formData.append(`Facilities[${facilityIndex}].imageUrl`, facilityDetail.imageUrl);
        }

        if (
          facilityDetail.oldFacilitiesFilePath &&
          facilityDetail.oldFacilitiesFilePath.length > 0
        ) {
          facilityDetail.oldFacilitiesFilePath.forEach((path, pathIndex) => {
            formData.append(
              `Facilities[${facilityIndex}].oldFacilitiesFilePath[${pathIndex}]`,
              path
            );
          });
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
      formData.append(`Facilities[${facilityIndex}].arabicName`, arabicName);
      formData.append(`Facilities[${facilityIndex}].englishName`, englishName);

      // Append "Other" facility details if available
      const otherFacilityDetail = schoolData.facilityDetails?.['other'];
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

        if (
          otherFacilityDetail.oldFacilitiesFilePath &&
          otherFacilityDetail.oldFacilitiesFilePath.length > 0
        ) {
          otherFacilityDetail.oldFacilitiesFilePath.forEach((path, pathIndex) => {
            formData.append(
              `Facilities[${facilityIndex}].oldFacilitiesFilePath[${pathIndex}]`,
              path
            );
          });
        }
      }
    }
  }

  // Append certificate files
  if (files.certificate && files.certificate.length > 0) {
    appendFacilityCertificates(formData, files.certificate);
  }
}

// ============================================================================
// Helper Functions - Branch Handling
// ============================================================================

function appendMainBranch(formData: FormData, schoolData: SchoolFormData): void {
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
}

function extractAcademicSystemId(academicSystem: string | string[]): string {
  return Array.isArray(academicSystem) ? academicSystem[0] || '' : academicSystem;
}

function formatFoundingDate(date?: string): string {
  return date ? new Date(date).toISOString() : new Date().toISOString();
}

function collectLicenseAttachments(files: FileAttachments): Array<{ file: File; name: string }> {
  const attachments: Array<{ file: File; name: string }> = [];

  // Add all logo files
  if (files.license && files.license.length > 0) {
    files.license.forEach((file) => {
      attachments.push({
        file: file,
        name: file.name || 'School Logo',
      });
    });
  }

  // Add all image files
  if (files.image && files.image.length > 0) {
    files.image.forEach((file) => {
      attachments.push({
        file: file,
        name: file.name || 'School Image',
      });
    });
  }

  return attachments;
}

function appendFacilityCertificates(formData: FormData, certificates: File[]): void {
  if (!certificates || certificates.length === 0) return;

  certificates.forEach((certificate, index) => {
    const prefix = `facilities[0].licensesAttachmentFacilitiesDto[${index}]`;
    formData.append(`${prefix}.attachmentFile`, certificate);
    formData.append(
      `${prefix}.attachmentName`,
      certificate.name || `Facility Certificate ${index + 1}`
    );
  });
}

// ============================================================================
// Backend to Form Transformation
// ============================================================================

interface BackendSchoolResponse {
  id?: string;
  name?: string;
  academicSystemId?: string;
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
  schoolBranches?: Array<{
    id: string;
    lkCountryId: string;
    city: string;
    neighborhood: string;
    region: string;
    street: string;
    buildingNumber: string;
    zipCode: string;
    buildingCount: number;
    classCount: number;
    schoolSpace: number;
    latitude: number;
    longitude: number;
    address: string;
    schoolId: string;
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

  return {
    // Basic Information
    schoolName: data.Name || '',
    academicSystem: data.AcademicSystemId ? [data.AcademicSystemId] : [],
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
  imageFiles?: string[];
  certificateFiles?: string[];
  branches?: Array<{
    country: string;
    region: string;
    city: string;
    district: string;
    street: string;
    buildingNumber: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  }>;
} {
  const data = backendData as BackendSchoolResponse;

  // Extract application feature IDs
  const applicationFeatures =
    data.applicationFeaturesDto?.map((feature) => feature.lkApplicationFeatureId) || [];

  // Extract license file paths from attachments (use filePath for full URL access)
  const licenseFiles = data.licensesAttachments?.map((attachment) => attachment.filePath) || [];

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
      // This facility matches a lookup facility by name
      // Use the lookup facility ID for the form
      facilities.push(matchedLookupFacility.id);

      // Store complete facility details for display using the lookup ID
      facilityDetails[matchedLookupFacility.id] = {
        id: matchedLookupFacility.id,
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
    schoolName: data.name || '',
    academicSystem: data.academicSystemId ? [data.academicSystemId] : [],
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
    certificateFiles,

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
            latitude: branch.latitude,
            longitude: branch.longitude,
          }))
        : [],
  };
}
