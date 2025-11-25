/**
 * Lookups Redux Selectors
 * Memoized selectors for lookups state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/redux/store/store';
import type { LookupsState } from './lookupsTypes';
import type {
  ApplicationFeature,
  Country,
  Facility,
  Region,
  City,
  LookupOption,
} from '@/services/api/types/lookup.types';
import {
  countryToOption,
  featureToOption,
  facilityToOption,
} from '@/services/api/types/lookup.types';

// ============================================================================
// Base Selectors
// ============================================================================

/**
 * Select the entire lookups state
 */
export const selectLookupsState = (state: RootState): LookupsState => state.lookups;

// ============================================================================
// Application Features Selectors
// ============================================================================

/**
 * Select all application features
 */
export const selectApplicationFeatures = createSelector(
  [selectLookupsState],
  (lookupsState): ApplicationFeature[] => lookupsState.applicationFeatures
);

/**
 * Select application features loading state
 */
export const selectIsLoadingFeatures = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.isLoadingFeatures
);

/**
 * Select application features error
 */
export const selectFeaturesError = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.featuresError
);

/**
 * Select application features initialization state
 */
export const selectIsFeaturesInitialized = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.isFeaturesInitialized
);

/**
 * Select application features as dropdown options
 */
export const selectApplicationFeaturesOptions = (language: 'ar' | 'en' = 'en') =>
  createSelector([selectApplicationFeatures], (features): LookupOption[] =>
    features.map((feature) => featureToOption(feature, language))
  );

/**
 * Get application feature by ID
 */
export const selectApplicationFeatureById = (id: string) =>
  createSelector([selectApplicationFeatures], (features) =>
    features.find((feature) => feature.id === id)
  );

// ============================================================================
// Facilities Selectors
// ============================================================================

/**
 * Select all facilities
 */
export const selectFacilities = createSelector(
  [selectLookupsState],
  (lookupsState): Facility[] => lookupsState.facilities
);

/**
 * Select facilities loading state
 */
export const selectIsLoadingFacilities = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.isLoadingFacilities
);

/**
 * Select facilities error
 */
export const selectFacilitiesError = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.facilitiesError
);

/**
 * Select facilities initialization state
 */
export const selectIsFacilitiesInitialized = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.isFacilitiesInitialized
);

/**
 * Select facilities as dropdown options
 */
export const selectFacilitiesOptions = (language: 'ar' | 'en' = 'en') =>
  createSelector([selectFacilities], (facilities): LookupOption[] =>
    facilities.map((facility) => facilityToOption(facility, language))
  );

/**
 * Get facility by ID
 */
export const selectFacilityById = (id: string) =>
  createSelector([selectFacilities], (facilities) =>
    facilities.find((facility) => facility.id === id)
  );

// ============================================================================
// Countries Selectors
// ============================================================================

/**
 * Select all countries
 */
export const selectCountries = createSelector(
  [selectLookupsState],
  (lookupsState): Country[] => lookupsState.countries
);

/**
 * Select countries loading state
 */
export const selectIsLoadingCountries = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.isLoadingCountries
);

/**
 * Select countries error
 */
export const selectCountriesError = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.countriesError
);

/**
 * Select countries initialization state
 */
export const selectIsCountriesInitialized = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.isCountriesInitialized
);

/**
 * Select countries as dropdown options
 */
export const selectCountriesOptions = (language: 'ar' | 'en' = 'en') =>
  createSelector([selectCountries], (countries): LookupOption[] =>
    countries.map((country) => countryToOption(country, language))
  );

/**
 * Get country by ID
 */
export const selectCountryById = (id: string) =>
  createSelector([selectCountries], (countries) => countries.find((country) => country.id === id));

/**
 * Get country by code
 */
export const selectCountryByCode = (code: string) =>
  createSelector([selectCountries], (countries) =>
    countries.find((country) => country.countryCode.toUpperCase() === code.toUpperCase())
  );

/**
 * Search countries by name
 */
export const selectSearchCountries = (searchTerm: string, language: 'ar' | 'en' = 'en') =>
  createSelector([selectCountries], (countries): Country[] => {
    if (!searchTerm) return countries;

    const term = searchTerm.toLowerCase();
    return countries.filter((country) => {
      const name = language === 'ar' ? country.arabicName : country.englishName;
      return (
        name.toLowerCase().includes(term) ||
        country.countryCode.toLowerCase().includes(term) ||
        country.areaCode.includes(term)
      );
    });
  });

/**
 * Get countries grouped by region (first letter)
 */
export const selectCountriesGrouped = (language: 'ar' | 'en' = 'en') =>
  createSelector([selectCountries], (countries) => {
    const grouped: Record<string, Country[]> = {};

    countries.forEach((country) => {
      const name = language === 'ar' ? country.arabicName : country.englishName;
      const firstLetter = name.charAt(0).toUpperCase();

      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }

      grouped[firstLetter].push(country);
    });

    // Sort countries within each group
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        const nameA = language === 'ar' ? a.arabicName : a.englishName;
        const nameB = language === 'ar' ? b.arabicName : b.englishName;
        return nameA.localeCompare(nameB);
      });
    });

    return grouped;
  });

// ============================================================================
// Regions Selectors
// ============================================================================

/**
 * Select all regions
 */
export const selectRegions = createSelector(
  [selectLookupsState],
  (lookupsState): Region[] => lookupsState.regions
);

/**
 * Select regions loading state
 */
export const selectIsLoadingRegions = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.isLoadingRegions
);

/**
 * Select regions error
 */
export const selectRegionsError = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.regionsError
);

// ============================================================================
// Cities Selectors
// ============================================================================

/**
 * Select all cities
 */
export const selectCities = createSelector(
  [selectLookupsState],
  (lookupsState): City[] => lookupsState.cities
);

/**
 * Select cities loading state
 */
export const selectIsLoadingCities = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.isLoadingCities
);

/**
 * Select cities error
 */
export const selectCitiesError = createSelector(
  [selectLookupsState],
  (lookupsState) => lookupsState.citiesError
);

// ============================================================================
// Combined Selectors
// ============================================================================

/**
 * Select if any lookup is loading
 */
export const selectIsAnyLoading = createSelector(
  [selectIsLoadingFeatures, selectIsLoadingFacilities, selectIsLoadingCountries],
  (isLoadingFeatures, isLoadingFacilities, isLoadingCountries) =>
    isLoadingFeatures || isLoadingFacilities || isLoadingCountries
);

/**
 * Select if all lookups are initialized
 */
export const selectAreAllLookupsInitialized = createSelector(
  [selectIsFeaturesInitialized, selectIsFacilitiesInitialized, selectIsCountriesInitialized],
  (isFeaturesInit, isFacilitiesInit, isCountriesInit) =>
    isFeaturesInit && isFacilitiesInit && isCountriesInit
);

/**
 * Select if there are any errors
 */
export const selectHasAnyError = createSelector(
  [selectFeaturesError, selectFacilitiesError, selectCountriesError],
  (featuresError, facilitiesError, countriesError) =>
    featuresError !== null || facilitiesError !== null || countriesError !== null
);

/**
 * Select all errors
 */
export const selectAllErrors = createSelector(
  [selectFeaturesError, selectFacilitiesError, selectCountriesError],
  (featuresError, facilitiesError, countriesError) => {
    const errors: string[] = [];
    if (featuresError) errors.push(featuresError);
    if (facilitiesError) errors.push(facilitiesError);
    if (countriesError) errors.push(countriesError);
    return errors;
  }
);
