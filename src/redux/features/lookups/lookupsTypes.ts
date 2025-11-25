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

  // Loading States
  isLoadingFeatures: boolean;
  isLoadingFacilities: boolean;
  isLoadingCountries: boolean;
  isLoadingRegions: boolean;
  isLoadingCities: boolean;

  // Error States
  featuresError: string | null;
  facilitiesError: string | null;
  countriesError: string | null;
  regionsError: string | null;
  citiesError: string | null;

  // Initialization States
  isFeaturesInitialized: boolean;
  isFacilitiesInitialized: boolean;
  isCountriesInitialized: boolean;

  // Timestamp for cache management
  lastFetchedFeatures: number | null;
  lastFetchedFacilities: number | null;
  lastFetchedCountries: number | null;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Cache duration in milliseconds (24 hours)
 */
export const LOOKUP_CACHE_DURATION = 24 * 60 * 60 * 1000;
