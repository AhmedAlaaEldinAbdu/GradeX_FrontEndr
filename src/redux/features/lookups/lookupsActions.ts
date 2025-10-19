/**
 * Lookups Redux Actions (Async Thunks)
 * Async actions for lookups state management
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { lookupsApiService } from '@/services/api/lookups/lookups.service';
import { getErrorMessage } from '@/lib/http';
import type { ApplicationFeature, Country } from '@/services/api/types/lookup.types';
import type { RootState, AppDispatch } from '@/redux/store/store';
import { LOOKUP_CACHE_DURATION } from './lookupsTypes';

// ============================================================================
// Application Features
// ============================================================================

/**
 * Fetch application features
 * Includes cache check to avoid unnecessary API calls
 */
export const fetchApplicationFeatures = createAsyncThunk<
  ApplicationFeature[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchApplicationFeatures', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { lastFetchedFeatures, isFeaturesInitialized, applicationFeatures } = state.lookups;

    // Check cache if not forced
    if (!options?.force && isFeaturesInitialized) {
      const now = Date.now();
      const isCacheValid = lastFetchedFeatures && now - lastFetchedFeatures < LOOKUP_CACHE_DURATION;

      if (isCacheValid && applicationFeatures.length > 0) {
        // Return cached data
        return applicationFeatures;
      }
    }

    // Fetch from API
    const features = await lookupsApiService.getApplicationFeatures();
    return features;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ============================================================================
// Countries
// ============================================================================

/**
 * Fetch countries
 * Includes cache check to avoid unnecessary API calls
 */
export const fetchCountries = createAsyncThunk<
  Country[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchCountries', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { lastFetchedCountries, isCountriesInitialized, countries } = state.lookups;

    // Check cache if not forced
    if (!options?.force && isCountriesInitialized) {
      const now = Date.now();
      const isCacheValid =
        lastFetchedCountries && now - lastFetchedCountries < LOOKUP_CACHE_DURATION;

      if (isCacheValid && countries.length > 0) {
        // Return cached data
        return countries;
      }
    }

    // Fetch from API
    const countriesData = await lookupsApiService.getCountries();
    return countriesData;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Fetch all lookups at once
 * Useful for app initialization
 */
export const fetchAllLookups = createAsyncThunk<
  { features: ApplicationFeature[]; countries: Country[] },
  { force?: boolean } | void,
  { state: RootState; dispatch: AppDispatch }
>('lookups/fetchAllLookups', async (options, { dispatch, rejectWithValue }) => {
  try {
    // Fetch both in parallel
    const [features, countries] = await Promise.all([
      dispatch(fetchApplicationFeatures(options)).unwrap(),
      dispatch(fetchCountries(options)).unwrap(),
    ]);

    return { features, countries };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
