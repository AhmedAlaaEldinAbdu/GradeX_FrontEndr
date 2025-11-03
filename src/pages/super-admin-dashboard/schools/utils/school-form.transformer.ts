import { parseBooleanField, parseDate } from '@/shared/common/common';
import type { SchoolFormData } from '../types/school.types';

// ============================================================================
// Type Definitions
// ============================================================================

interface FileAttachments {
  logo: File | null;
  image: File | null;
  certificate: File | null;
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
  if (schoolData.hasOtherFacility && schoolData.otherFacilityName?.trim()) {
    const otherFacilityName = schoolData.otherFacilityName.trim();
    // Send same name for both Arabic and English
    formData.append(`Facilities[${facilityIndex}].arabicName`, otherFacilityName);
    // formData.append(`Facilities[${facilityIndex}].englishName`, otherFacilityName);

    // Append "Other" facility details if available
    const otherFacilityDetail = schoolData.facilityDetails?.['other'];
    if (otherFacilityDetail) {
      formData.append(`Facilities[${facilityIndex}].description`, otherFacilityDetail.description);

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
          formData.append(`Facilities[${facilityIndex}].oldFacilitiesFilePath[${pathIndex}]`, path);
        });
      }
    }
  }

  // Legacy certificate handling (for backward compatibility)
  if (files.certificate) {
    appendFacilityCertificate(formData, files.certificate);
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

  if (files.logo) {
    attachments.push({
      file: files.logo,
      name: files.logo.name || 'School Logo',
    });
  }

  if (files.image) {
    attachments.push({
      file: files.image,
      name: files.image.name || 'School Image',
    });
  }

  return attachments;
}

function appendFacilityCertificate(formData: FormData, certificate: File): void {
  const prefix = 'facilities[0].licensesAttachmentFacilitiesDto[0]';
  formData.append(`${prefix}.attachmentFile`, certificate);
  formData.append(`${prefix}.attachmentName`, certificate.name || 'Facility Certificate');
}

// ============================================================================
// Backend to Form Transformation
// ============================================================================

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
