/**
 * Lookup API Endpoints
 * Endpoint definitions for lookup tables
 */

export const LookupsEndpoints = {
  applicationFeatures: '/LKApplicationFeatures',
  facilities: '/LKFacalities',
  countries: '/LKCountries/GetAllCountries',
  regions: '/Region',
  cities: '/City',
  schoolStages: '/LKSchoolStage',
  jobBenefits: '/LKJobBenefit',
  languages: '/LKLanguage',
  languageLevels: '/LKLevels',
  teacherLevels: '/LKTeacherLevel',
  qualifications: '/LKQualification',
  administrativePositions: '/LKAdministrativePosition',
} as const;
