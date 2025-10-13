// School form data types
export interface SchoolFormData {
  // Basic Info
  schoolName: string;
  academicSystem: string;
  foundationDate: string;
  aboutSchool: string;
  hasCurrentSystem: boolean;
  country: string;

  // Application Features
  applicationFeatures: {
    attendanceAndDeparture: boolean;
    remoteBookTracking: boolean;
    expensesTrackingOnly: boolean;
    fullExpensesPayment: boolean;
  };

  // Financial Data
  bankName: string;
  accountNumber: string;
  ibanNumber: string;

  // Contact Info
  phoneNumber: string;
  email: string;
  website: string;
  contactPerson: string;

  // Address
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

  // Features
  attendanceFeature: boolean;
  buyBooksFeature: boolean;
  payCashFeature: boolean;
  payInstallmentFeature: boolean;
  facilities: {
    playground: boolean;
    library: boolean;
    laboratory: boolean;
    sportField: boolean;
    canteen: boolean;
    busService: boolean;
  };
}

// Initial empty form data
export const initialSchoolFormData: SchoolFormData = {
  schoolName: '',
  academicSystem: '',
  foundationDate: '',
  aboutSchool: '',
  hasCurrentSystem: false,
  country: '',
  applicationFeatures: {
    attendanceAndDeparture: false,
    remoteBookTracking: false,
    expensesTrackingOnly: false,
    fullExpensesPayment: false,
  },
  bankName: '',
  accountNumber: '',
  ibanNumber: '',
  phoneNumber: '',
  email: '',
  website: '',
  contactPerson: '',
  region: '',
  state: '',
  city: '',
  street: '',
  district: '',
  buildingNumber: '',
  postalCode: '',
  hasBranches: false,
  hasOtherBranches: false,
  attendanceFeature: false,
  buyBooksFeature: false,
  payCashFeature: false,
  payInstallmentFeature: false,
  facilities: {
    playground: false,
    library: false,
    laboratory: false,
    sportField: false,
    canteen: false,
    busService: false,
  },
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
