/**
 * Lookups Redux Types
 * Type definitions for lookups state management
 */

import type { ApplicationFeature, Country } from '@/services/api/types/lookup.types';

// ============================================================================
// State Types
// ============================================================================

export interface LookupsState {
  // Data
  applicationFeatures: ApplicationFeature[];
  countries: Country[];

  // Loading States
  isLoadingFeatures: boolean;
  isLoadingCountries: boolean;

  // Error States
  featuresError: string | null;
  countriesError: string | null;

  // Initialization States
  isFeaturesInitialized: boolean;
  isCountriesInitialized: boolean;

  // Timestamp for cache management
  lastFetchedFeatures: number | null;
  lastFetchedCountries: number | null;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Cache duration in milliseconds (24 hours)
 */
export const LOOKUP_CACHE_DURATION = 24 * 60 * 60 * 1000;
