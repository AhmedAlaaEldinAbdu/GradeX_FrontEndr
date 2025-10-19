/**
 * Lookups Redux Slice
 * State management for lookup tables
 */

import { createSlice, type ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { LookupsState } from './lookupsTypes';
import { fetchApplicationFeatures, fetchCountries, fetchAllLookups } from './lookupsActions';

// ============================================================================
// Initial State
// ============================================================================

const initialState: LookupsState = {
  // Data
  applicationFeatures: [],
  countries: [],

  // Loading States
  isLoadingFeatures: false,
  isLoadingCountries: false,

  // Error States
  featuresError: null,
  countriesError: null,

  // Initialization States
  isFeaturesInitialized: false,
  isCountriesInitialized: false,

  // Timestamps
  lastFetchedFeatures: null,
  lastFetchedCountries: null,
};

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
      state.countries = [];
      state.isFeaturesInitialized = false;
      state.isCountriesInitialized = false;
      state.lastFetchedFeatures = null;
      state.lastFetchedCountries = null;
    },

    /**
     * Clear all errors
     */
    clearLookupsErrors: (state) => {
      state.featuresError = null;
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
        state.isLoadingCountries = true;
      })
      .addCase(fetchAllLookups.fulfilled, (state, action) => {
        state.isLoadingFeatures = false;
        state.isLoadingCountries = false;
        state.isFeaturesInitialized = true;
        state.isCountriesInitialized = true;
        state.applicationFeatures = action.payload.features;
        state.countries = action.payload.countries;
        const now = Date.now();
        state.lastFetchedFeatures = now;
        state.lastFetchedCountries = now;
        state.featuresError = null;
        state.countriesError = null;
      })
      .addCase(fetchAllLookups.rejected, (state, action) => {
        state.isLoadingFeatures = false;
        state.isLoadingCountries = false;
        state.featuresError = action.payload as string;
        state.countriesError = action.payload as string;
      });
  },
});

// ============================================================================
// Export Actions and Reducer
// ============================================================================

export const { clearLookupsData, clearLookupsErrors, resetLookupsState } = lookupsSlice.actions;

export default lookupsSlice.reducer;
