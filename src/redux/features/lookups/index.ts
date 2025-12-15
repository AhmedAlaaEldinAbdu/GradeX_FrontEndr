/**
 * Lookups Redux Feature
 * Exports for lookups state management
 */

// Reducer
export { default as lookupsReducer } from './lookupsSlice';

// Actions from Slice (Sync)
export {
  clearLookupsData,
  clearLookupsErrors,
  clearRegions,
  clearCities,
  resetLookupsState,
} from './lookupsSlice';

// Actions (Async Thunks)
export {
  fetchApplicationFeatures,
  fetchFacilities,
  fetchCountries,
  fetchAllRegions,
  fetchRegionsByCountry,
  fetchAllCities,
  fetchCitiesByRegion,
  fetchAllLookups,
  fetchSchoolStages,
} from './lookupsSlice';

// Selectors
export * from './lookupsSelectors';

// Types
export * from './lookupsTypes';
