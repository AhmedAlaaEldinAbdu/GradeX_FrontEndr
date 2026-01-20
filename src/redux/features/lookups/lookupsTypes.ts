/**
 * Lookups Redux Types
 * Type definitions for lookups state management
 */

import type {
  ApplicationFeature,
  Country,
  Facility,
  Region,
  City,
  SchoolStage,
  JobBenefit,
  Language,
  LanguageLevel,
  TeacherLevel,
  Qualification,
  AdministrativePosition,
  LKPaymentMethodDto,
} from '@/services/api/types/lookup.types';

// ============================================================================
// State Types
// ============================================================================

export interface LookupsState {
  // Data
  applicationFeatures: ApplicationFeature[];
  facilities: Facility[];
  countries: Country[];
  regions: Region[];
  cities: City[];
  schoolStages: SchoolStage[];
  jobBenefits: JobBenefit[];
  languages: Language[];
  languageLevels: LanguageLevel[];
  teacherLevels: TeacherLevel[];
  qualifications: Qualification[];
  administrativePositions: AdministrativePosition[];
  lkPaymentMethods: LKPaymentMethodDto[];

  // Loading States
  isLoadingFeatures: boolean;
  isLoadingFacilities: boolean;
  isLoadingCountries: boolean;
  isLoadingRegions: boolean;
  isLoadingCities: boolean;
  isLoadingSchoolStages: boolean;
  isLoadingJobBenefits: boolean;
  isLoadingLanguages: boolean;
  isLoadingLanguageLevels: boolean;
  isLoadingTeacherLevels: boolean;
  isLoadingQualifications: boolean;
  isLoadingAdministrativePositions: boolean;
  isLoadingLKPaymentMethods: boolean;
  isCreatingLKPaymentMethod: boolean;
  isUpdatingLKPaymentMethod: boolean;
  isDeletingLKPaymentMethod: boolean;

  // Error States
  featuresError: string | null;
  facilitiesError: string | null;
  countriesError: string | null;
  regionsError: string | null;
  citiesError: string | null;
  schoolStagesError: string | null;
  jobBenefitsError: string | null;
  languagesError: string | null;
  languageLevelsError: string | null;
  teacherLevelsError: string | null;
  qualificationsError: string | null;
  administrativePositionsError: string | null;
  lkPaymentMethodsError: string | null;

  // Initialization States
  isFeaturesInitialized: boolean;
  isFacilitiesInitialized: boolean;
  isCountriesInitialized: boolean;
  isSchoolStagesInitialized: boolean;
  isJobBenefitsInitialized: boolean;
  isLanguagesInitialized: boolean;
  isLanguageLevelsInitialized: boolean;
  isTeacherLevelsInitialized: boolean;
  isQualificationsInitialized: boolean;
  isAdministrativePositionsInitialized: boolean;
  isLKPaymentMethodsInitialized: boolean;

  // Timestamp for cache management
  lastFetchedFeatures: number | null;
  lastFetchedFacilities: number | null;
  lastFetchedCountries: number | null;
  lastFetchedSchoolStages: number | null;
  lastFetchedJobBenefits: number | null;
  lastFetchedLanguages: number | null;
  lastFetchedLanguageLevels: number | null;
  lastFetchedTeacherLevels: number | null;
  lastFetchedQualifications: number | null;
  lastFetchedAdministrativePositions: number | null;
  lastFetchedLKPaymentMethods: number | null;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Cache duration in milliseconds (24 hours)
 */
export const LOOKUP_CACHE_DURATION = 24 * 60 * 60 * 1000;
