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
  jobBenefits: '/api/LKJobBenefit',
  languages: '/api/LKLanguage',
  languageLevels: '/api/LKLevels',
} as const;
