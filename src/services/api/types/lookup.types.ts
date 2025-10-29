/**
 * Lookup API Types
 * Type definitions for lookup tables (countries, application features, etc.)
 */

// ============================================================================
// Base Response Types
// ============================================================================

export interface LookupApiResponse<T> {
  value: T[];
  status: number;
  isSuccess: boolean;
  successMessage: string;
  correlationId: string;
  location: string;
  errors: string[];
  validationErrors: string[];
}

// ============================================================================
// Application Features
// ============================================================================

export interface ApplicationFeature {
  id: string;
  nameAr: string;
  nameEn: string;
}

export type ApplicationFeaturesResponse = LookupApiResponse<ApplicationFeature>;

// ============================================================================
// Facilities
// ============================================================================

export interface Facility {
  id: string;
  arabicName: string;
  englishName: string;
  description: string;
  imageUrl: string | null;
}

export type FacilitiesResponse = LookupApiResponse<Facility>;

// ============================================================================
// Countries
// ============================================================================

export interface Country {
  id: string;
  arabicName: string;
  englishName: string;
  countryCode: string;
  areaCode: string;
  flag: string;
}

export type CountriesResponse = LookupApiResponse<Country>;

// ============================================================================
// Helper Types
// ============================================================================

export interface LookupOption {
  value: string;
  label: string;
  extra?: Record<string, unknown>;
}

/**
 * Convert country to dropdown option
 */
export function countryToOption(country: Country, language: 'ar' | 'en' = 'en'): LookupOption {
  return {
    value: country.id,
    label: language === 'ar' ? country.arabicName : country.englishName,
    extra: {
      countryCode: country.countryCode,
      areaCode: country.areaCode,
      flag: country.flag,
    },
  };
}

/**
 * Convert application feature to dropdown option
 */
export function featureToOption(
  feature: ApplicationFeature,
  language: 'ar' | 'en' = 'en'
): LookupOption {
  return {
    value: feature.id,
    label: language === 'ar' ? feature.nameAr : feature.nameEn,
  };
}

/**
 * Convert facility to dropdown option
 */
export function facilityToOption(facility: Facility, language: 'ar' | 'en' = 'en'): LookupOption {
  return {
    value: facility.id,
    label: language === 'ar' ? facility.arabicName : facility.englishName,
    extra: {
      description: facility.description,
      imageUrl: facility.imageUrl,
    },
  };
}

// ============================================================================
// Filters and Query Params
// ============================================================================

export interface LookupFilters {
  search?: string;
  code?: string;
}
