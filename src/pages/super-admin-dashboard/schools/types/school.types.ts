// Facility Details Types
export interface FacilityLicenseAttachment {
  attachmentFile: File;
  attachmentName: string;
}

export interface FacilityDetails {
  id: string;
  arabicName?: string;
  englishName?: string;
  description: string;
  imageUrl?: string | null;
  imageFile?: File | null;
  oldFacilitiesFilePath?: string[];
}

// School form data types
export interface SchoolFormData {
  // Basic Info
  schoolName: string;
  academicSystem: string | string[];
  foundationDate: string;
  aboutSchool: string;
  hasCurrentSystem: boolean;
  currentSystem: string;
  country: string;

  // Application Features
  applicationFeatures: string[];

  // Financial Data
  bankName: string;
  accountNumber: string;
  ibanNumber: string;

  // Contact Info
  landline: string;
  phoneNumber: string;
  email: string;
  website: string;
  contactPerson: string;

  // Address
  addressCountry: string;
  region: string;
  state: string;
  city: string;
  street: string;
  district: string;
  buildingNumber: string;
  postalCode: string;
  hasBranches: boolean;

  // Facilities
  hasOtherBranches: boolean;
  facilities: string[];
  facilityDetails?: Record<string, FacilityDetails>;
  hasOtherFacility: boolean;
  otherFacilityName?: string; // Deprecated - kept for backward compatibility
  otherFacilityNameAr?: string;
  otherFacilityNameEn?: string;
}

// Initial empty form data
export const initialSchoolFormData: SchoolFormData = {
  schoolName: '',
  academicSystem: [],
  foundationDate: '',
  aboutSchool: '',
  hasCurrentSystem: false,
  currentSystem: '',
  country: '',
  applicationFeatures: [],
  bankName: '',
  accountNumber: '',
  ibanNumber: '',
  landline: '',
  phoneNumber: '',
  email: '',
  website: '',
  contactPerson: '',
  addressCountry: '',
  region: '',
  state: '',
  city: '',
  street: '',
  district: '',
  buildingNumber: '',
  postalCode: '',
  hasBranches: false,
  hasOtherBranches: false,
  facilities: [],
  facilityDetails: {},
  hasOtherFacility: false,
  otherFacilityName: '',
  otherFacilityNameAr: '',
  otherFacilityNameEn: '',
};

// School data for display in tables
export interface School {
  id: string;
  name: string;
  academicSystem: string;
  country: string;
  phoneNumber: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
