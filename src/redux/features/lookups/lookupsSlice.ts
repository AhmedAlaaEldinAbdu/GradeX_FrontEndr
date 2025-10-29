/**
 * Lookups Redux Slice
 * State management for lookup tables
 */

import { createSlice, createAsyncThunk, type ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { lookupsApiService } from '@/services/api/lookups/lookups.service';
import { getErrorMessage } from '@/lib/http';
import type { ApplicationFeature, Country, Facility } from '@/services/api/types/lookup.types';
import type { RootState, AppDispatch } from '@/redux/store/store';
import type { LookupsState } from './lookupsTypes';
import { LOOKUP_CACHE_DURATION } from './lookupsTypes';

// ============================================================================
// Initial State
// ============================================================================

const initialState: LookupsState = {
  // Data
  applicationFeatures: [],
  facilities: [],
  countries: [],

  // Loading States
  isLoadingFeatures: false,
  isLoadingFacilities: false,
  isLoadingCountries: false,

  // Error States
  featuresError: null,
  facilitiesError: null,
  countriesError: null,

  // Initialization States
  isFeaturesInitialized: false,
  isFacilitiesInitialized: false,
  isCountriesInitialized: false,

  // Timestamps
  lastFetchedFeatures: null,
  lastFetchedFacilities: null,
  lastFetchedCountries: null,
};

// ============================================================================
// Async Thunks
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

/**
 * Fetch facilities
 * Includes cache check to avoid unnecessary API calls
 */
export const fetchFacilities = createAsyncThunk<
  Facility[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchFacilities', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { lastFetchedFacilities, isFacilitiesInitialized, facilities } = state.lookups;

    // Check cache if not forced
    if (!options?.force && isFacilitiesInitialized) {
      const now = Date.now();
      const isCacheValid =
        lastFetchedFacilities && now - lastFetchedFacilities < LOOKUP_CACHE_DURATION;

      if (isCacheValid && facilities.length > 0) {
        // Return cached data
        return facilities;
      }
    }

    // Fetch from API
    const facilitiesData = await lookupsApiService.getFacilities();
    return facilitiesData;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

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
  { features: ApplicationFeature[]; facilities: Facility[]; countries: Country[] },
  { force?: boolean } | void,
  { state: RootState; dispatch: AppDispatch }
>('lookups/fetchAllLookups', async (options, { dispatch, rejectWithValue }) => {
  try {
    // Fetch all in parallel
    const [features, facilities, countries] = await Promise.all([
      dispatch(fetchApplicationFeatures(options)).unwrap(),
      dispatch(fetchFacilities(options)).unwrap(),
      dispatch(fetchCountries(options)).unwrap(),
    ]);

    return { features, facilities, countries };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ============================================================================
// Slice Definition
// ============================================================================

const lookupsSlice = createSlice({
  name: 'lookups',
  initialState,
  reducers: {
    /**
     * Clear all lookups data
     */
    clearLookupsData: (state) => {
      state.applicationFeatures = [];
      state.facilities = [];
      state.countries = [];
      state.isFeaturesInitialized = false;
      state.isFacilitiesInitialized = false;
      state.isCountriesInitialized = false;
      state.lastFetchedFeatures = null;
      state.lastFetchedFacilities = null;
      state.lastFetchedCountries = null;
    },

    /**
     * Clear all errors
     */
    clearLookupsErrors: (state) => {
      state.featuresError = null;
      state.facilitiesError = null;
      state.countriesError = null;
    },

    /**
     * Reset entire lookups state
     */
    resetLookupsState: () => initialState,
  },

  extraReducers: (builder: ActionReducerMapBuilder<LookupsState>) => {
    // ========================================================================
    // Fetch Application Features
    // ========================================================================

    builder
      .addCase(fetchApplicationFeatures.pending, (state) => {
        state.isLoadingFeatures = true;
        state.featuresError = null;
      })
      .addCase(fetchApplicationFeatures.fulfilled, (state, action) => {
        state.isLoadingFeatures = false;
        state.isFeaturesInitialized = true;
        state.applicationFeatures = action.payload;
        state.lastFetchedFeatures = Date.now();
        state.featuresError = null;
      })
      .addCase(fetchApplicationFeatures.rejected, (state, action) => {
        state.isLoadingFeatures = false;
        state.featuresError = action.payload as string;
      });

    // ========================================================================
    // Fetch Facilities
    // ========================================================================

    builder
      .addCase(fetchFacilities.pending, (state) => {
        state.isLoadingFacilities = true;
        state.facilitiesError = null;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.isLoadingFacilities = false;
        state.isFacilitiesInitialized = true;
        state.facilities = action.payload;
        state.lastFetchedFacilities = Date.now();
        state.facilitiesError = null;
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.isLoadingFacilities = false;
        state.facilitiesError = action.payload as string;
      });

    // ========================================================================
    // Fetch Countries
    // ========================================================================

    builder
      .addCase(fetchCountries.pending, (state) => {
        state.isLoadingCountries = true;
        state.countriesError = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.isLoadingCountries = false;
        state.isCountriesInitialized = true;
        state.countries = action.payload;
        state.lastFetchedCountries = Date.now();
        state.countriesError = null;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.isLoadingCountries = false;
        state.countriesError = action.payload as string;
      });

    // ========================================================================
    // Fetch All Lookups
    // ========================================================================

    builder
      .addCase(fetchAllLookups.pending, (state) => {
        state.isLoadingFeatures = true;
        state.isLoadingFacilities = true;
        state.isLoadingCountries = true;
      })
      .addCase(fetchAllLookups.fulfilled, (state, action) => {
        state.isLoadingFeatures = false;
        state.isLoadingFacilities = false;
        state.isLoadingCountries = false;
        state.isFeaturesInitialized = true;
        state.isFacilitiesInitialized = true;
        state.isCountriesInitialized = true;
        state.applicationFeatures = action.payload.features;
        state.facilities = action.payload.facilities;
        state.countries = action.payload.countries;
        const now = Date.now();
        state.lastFetchedFeatures = now;
        state.lastFetchedFacilities = now;
        state.lastFetchedCountries = now;
        state.featuresError = null;
        state.facilitiesError = null;
        state.countriesError = null;
      })
      .addCase(fetchAllLookups.rejected, (state, action) => {
        state.isLoadingFeatures = false;
        state.isLoadingFacilities = false;
        state.isLoadingCountries = false;
        state.featuresError = action.payload as string;
        state.facilitiesError = action.payload as string;
        state.countriesError = action.payload as string;
      });
  },
});

// ============================================================================
// Export Actions and Reducer
// ============================================================================

export const { clearLookupsData, clearLookupsErrors, resetLookupsState } = lookupsSlice.actions;

export default lookupsSlice.reducer;
