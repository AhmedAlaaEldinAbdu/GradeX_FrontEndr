/**
 * Schools Data Transformers
 * Transform data between different formats
 */

import type {
  SchoolFormData,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  SchoolDetailResponse,
} from '../types/school.types';

/**
 * Transform form data to API request format
 */
export function transformSchoolFormToRequest(
  formData: SchoolFormData
): CreateSchoolRequest | UpdateSchoolRequest {
  return {
    // Basic Info
    name: formData.schoolName,
    academicSystem: formData.academicSystem,
    foundationDate: formData.foundationDate,
    description: formData.aboutSchool,
    currentSystem: formData.hasCurrentSystem ? formData.currentSystem : null,
    country: formData.country,

    // Application Features
    features: {
      attendance: formData.applicationFeatures.attendanceAndDeparture,
      bookTracking: formData.applicationFeatures.remoteBookTracking,
      expensesTracking: formData.applicationFeatures.expensesTrackingOnly,
      fullPayment: formData.applicationFeatures.fullExpensesPayment,
    },

    // Financial Data
    banking: {
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      iban: formData.ibanNumber,
    },

    // Contact Info
    contact: {
      landline: formData.landline,
      phone: formData.phoneNumber,
      email: formData.email,
      website: formData.website,
      contactPerson: formData.contactPerson,
    },

    // Address
    address: {
      region: formData.region,
      state: formData.state,
      city: formData.city,
      street: formData.street,
      district: formData.district,
      buildingNumber: formData.buildingNumber,
      postalCode: formData.postalCode,
    },

    // Facilities
    facilities: {
      playground: formData.facilities.playground,
      library: formData.facilities.library,
      laboratory: formData.facilities.laboratory,
      sportField: formData.facilities.sportField,
      canteen: formData.facilities.canteen,
      busService: formData.facilities.busService,
      hasBranches: formData.hasBranches,
    },
  };
}

/**
 * Transform API response to form data
 */
export function transformSchoolResponseToForm(response: SchoolDetailResponse): SchoolFormData {
  const school = response.data || response;

  return {
    schoolName: school.name || '',
    academicSystem: school.academicSystem || '',
    foundationDate: school.foundationDate || '',
    aboutSchool: school.description || '',
    hasCurrentSystem: !!school.currentSystem,
    currentSystem: school.currentSystem || '',
    country: school.country || '',

    applicationFeatures: {
      attendanceAndDeparture: school.features?.attendance || false,
      remoteBookTracking: school.features?.bookTracking || false,
      expensesTrackingOnly: school.features?.expensesTracking || false,
      fullExpensesPayment: school.features?.fullPayment || false,
    },

    bankName: school.banking?.bankName || '',
    accountNumber: school.banking?.accountNumber || '',
    ibanNumber: school.banking?.iban || '',

    landline: school.contact?.landline || '',
    phoneNumber: school.contact?.phone || '',
    email: school.contact?.email || '',
    website: school.contact?.website || '',
    contactPerson: school.contact?.contactPerson || '',

    region: school.address?.region || '',
    state: school.address?.state || '',
    city: school.address?.city || '',
    street: school.address?.street || '',
    district: school.address?.district || '',
    buildingNumber: school.address?.buildingNumber || '',
    postalCode: school.address?.postalCode || '',
    hasBranches: school.facilities?.hasBranches || false,

    hasOtherBranches: school.facilities?.hasBranches || false,
    attendanceFeature: school.features?.attendance || false,
    buyBooksFeature: school.features?.bookTracking || false,
    payCashFeature: school.features?.expensesTracking || false,
    payInstallmentFeature: school.features?.fullPayment || false,

    facilities: {
      playground: school.facilities?.playground || false,
      library: school.facilities?.library || false,
      laboratory: school.facilities?.laboratory || false,
      sportField: school.facilities?.sportField || false,
      canteen: school.facilities?.canteen || false,
      busService: school.facilities?.busService || false,
    },
  };
}
