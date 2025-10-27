import * as yup from 'yup';

/**
 * Validation schema for Basic Info step
 * Includes school name, academic system, foundation date, and financial data
 */
export const basicInfoSchema = yup.object().shape({
  // School Basic Information
  schoolName: yup
    .string()
    .required('schools.validation.schoolNameRequired')
    .min(3, 'schools.validation.schoolNameMin')
    .max(100, 'schools.validation.schoolNameMax')
    .trim(),

  academicSystem: yup
    .string()
    .required('schools.validation.academicSystemRequired')
    .test('valid-academic-systems', 'schools.validation.academicSystemInvalid', function (value) {
      if (!value) return false;
      // Split comma-separated values and check if all are valid
      const validOptions = ['government', 'private', 'national'];
      const selectedSystems = value.split(',').map((s) => s.trim());
      return selectedSystems.every((system) => validOptions.includes(system));
    }),

  country: yup.string().required('schools.validation.countryRequired'),

  foundationDate: yup
    .string()
    .required('schools.validation.foundationDateRequired')
    .test('is-valid-date', 'schools.validation.foundationDateInvalid', (value) => {
      if (!value) return false;
      const date = new Date(value);
      const today = new Date();
      return date <= today && date > new Date('1900-01-01');
    }),

  aboutSchool: yup.string().max(500, 'schools.validation.aboutSchoolMax').trim().optional(),

  hasCurrentSystem: yup.boolean().default(false),

  currentSystem: yup.string().when('hasCurrentSystem', {
    is: true,
    then: (schema) =>
      schema
        .required('schools.validation.currentSystemRequired')
        .min(10, 'schools.validation.currentSystemMin')
        .max(500, 'schools.validation.currentSystemMax'),
    otherwise: (schema) => schema.optional(),
  }),

  // Application Features - At least one must be selected
  applicationFeatures: yup
    .object()
    .shape({
      attendanceAndDeparture: yup.boolean().default(false),
      remoteBookTracking: yup.boolean().default(false),
      expensesTrackingOnly: yup.boolean().default(false),
      fullExpensesPayment: yup.boolean().default(false),
    })
    .test('at-least-one-feature', 'schools.validation.applicationFeaturesRequired', (value) => {
      return (
        value.attendanceAndDeparture ||
        value.remoteBookTracking ||
        value.expensesTrackingOnly ||
        value.fullExpensesPayment
      );
    }),

  // Financial Data
  bankName: yup
    .string()
    .required('schools.validation.bankNameRequired')
    .min(3, 'schools.validation.bankNameMin')
    .max(100, 'schools.validation.bankNameMax')
    .trim(),

  accountNumber: yup
    .string()
    .required('schools.validation.accountNumberRequired')
    .matches(/^[0-9]+$/, 'schools.validation.accountNumberNumeric')
    .min(8, 'schools.validation.accountNumberMin')
    .max(20, 'schools.validation.accountNumberMax'),

  ibanNumber: yup
    .string()
    .required('schools.validation.ibanNumberRequired')
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, 'schools.validation.ibanNumberInvalid')
    .min(15, 'schools.validation.ibanNumberMin')
    .max(34, 'schools.validation.ibanNumberMax')
    .uppercase(),
});

/**
 * Validation schema for Contact Info step
 * Includes phone, email, website, and contact person
 */
export const contactInfoSchema = yup.object().shape({
  email: yup
    .string()
    .required('schools.validation.emailRequired')
    .email('schools.validation.emailInvalid')
    .lowercase()
    .trim(),

  website: yup.string().url('schools.validation.websiteInvalid').trim().optional().nullable(),

  landline: yup
    .string()
    .required('schools.validation.landlineRequired')
    .matches(/^\+?[1-9]\d{1,14}$/, 'schools.validation.landlineInvalid')
    .min(10, 'schools.validation.phoneNumberMin')
    .max(15, 'schools.validation.phoneNumberMax'),

  phoneNumber: yup
    .string()
    .required('schools.validation.phoneNumberRequired')
    .matches(/^\+?[1-9]\d{1,14}$/, 'schools.validation.phoneNumberInvalid')
    .min(10, 'schools.validation.phoneNumberMin')
    .max(15, 'schools.validation.phoneNumberMax'),

  contactPerson: yup
    .string()
    .required('schools.validation.contactPersonRequired')
    .min(3, 'schools.validation.contactPersonMin')
    .max(100, 'schools.validation.contactPersonMax')
    .trim(),
});

/**
 * Validation schema for Address step
 * Includes main address and optional branches
 */
export const addressSchema = yup.object().shape({
  region: yup
    .string()
    .required('schools.validation.regionRequired')
    .min(2, 'schools.validation.regionMin')
    .max(100, 'schools.validation.regionMax')
    .trim(),

  state: yup.string().max(100, 'schools.validation.stateMax').trim().optional(),

  city: yup
    .string()
    .required('schools.validation.cityRequired')
    .min(2, 'schools.validation.cityMin')
    .max(100, 'schools.validation.cityMax')
    .trim(),

  district: yup
    .string()
    .required('schools.validation.districtRequired')
    .min(2, 'schools.validation.districtMin')
    .max(100, 'schools.validation.districtMax')
    .trim(),

  street: yup
    .string()
    .required('schools.validation.streetRequired')
    .min(2, 'schools.validation.streetMin')
    .max(100, 'schools.validation.streetMax')
    .trim(),

  buildingNumber: yup
    .string()
    .required('schools.validation.buildingNumberRequired')
    .max(20, 'schools.validation.buildingNumberMax')
    .trim(),

  postalCode: yup
    .string()
    .required('schools.validation.postalCodeRequired')
    .matches(/^[0-9]{4,10}$/, 'schools.validation.postalCodeInvalid'),

  hasBranches: yup.boolean().default(false),
});

/**
 * Validation schema for Facilities step
 * Includes facilities checkboxes
 */
export const facilitiesSchema = yup.object().shape({
  facilities: yup.object().shape({
    playground: yup.boolean().default(false),
    library: yup.boolean().default(false),
    laboratory: yup.boolean().default(false),
    sportField: yup.boolean().default(false),
    canteen: yup.boolean().default(false),
    busService: yup.boolean().default(false),
  }),
});

/**
 * Complete validation schema for all steps
 * Combines all step schemas for final submission
 */
export const schoolFormSchema = basicInfoSchema
  .concat(contactInfoSchema)
  .concat(addressSchema)
  .concat(facilitiesSchema)
  .shape({
    // Additional fields not in step schemas
    hasOtherBranches: yup.boolean().default(false),
    attendanceFeature: yup.boolean().default(false),
    buyBooksFeature: yup.boolean().default(false),
    payCashFeature: yup.boolean().default(false),
    payInstallmentFeature: yup.boolean().default(false),
  });

/**
 * Type inference from the schema
 */
export type SchoolFormValidation = yup.InferType<typeof schoolFormSchema>;

/**
 * Helper function to get validation schema for a specific step
 * @param step - The current step number (1-4)
 * @returns The validation schema for the specified step
 */
export const getStepValidationSchema = (step: number) => {
  switch (step) {
    case 1:
      return basicInfoSchema;
    case 2:
      return contactInfoSchema;
    case 3:
      return addressSchema;
    case 4:
      return facilitiesSchema;
    default:
      return basicInfoSchema;
  }
};

/**
 * Helper function to validate a specific step
 * @param step - The current step number
 * @param data - The form data to validate
 * @returns Promise that resolves to validation result
 */
export const validateStep = async (step: number, data: Partial<SchoolFormValidation>) => {
  const schema = getStepValidationSchema(step);
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.reduce(
        (acc, err) => {
          if (err.path) {
            acc[err.path] = err.message;
          }
          return acc;
        },
        {} as Record<string, string>
      );
      return { isValid: false, errors };
    }
    return { isValid: false, errors: {} };
  }
};
