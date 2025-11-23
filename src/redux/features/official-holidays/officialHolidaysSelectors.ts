/**
 * Official Holidays Redux Selectors
 * Memoized selectors for official holidays state
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/redux/store/store';
import type { OfficialHolidaysState } from './officialHolidaysTypes';
import type {
  OfficialHoliday,
  CountryWithLeave,
} from '@/services/api/types/official-holidays.types';

// ============================================================================
// Base Selectors
// ============================================================================

/**
 * Select the entire official holidays state
 */
export const selectOfficialHolidaysState = (state: RootState): OfficialHolidaysState =>
  state.officialHolidays;

// ============================================================================
// Data Selectors
// ============================================================================

/**
 * Select all official holidays
 */
export const selectOfficialHolidays = createSelector(
  [selectOfficialHolidaysState],
  (officialHolidaysState): OfficialHoliday[] => officialHolidaysState.holidays
);

/**
 * Select all countries with leave count
 */
export const selectCountriesWithLeave = createSelector(
  [selectOfficialHolidaysState],
  (officialHolidaysState): CountryWithLeave[] => officialHolidaysState.countries
);

// ============================================================================
// Loading State Selectors
// ============================================================================

/**
 * Select loading state
 */
export const selectIsLoading = createSelector(
  [selectOfficialHolidaysState],
  (officialHolidaysState) => officialHolidaysState.isLoading
);

/**
 * Select deleting state
 */
export const selectIsDeleting = createSelector(
  [selectOfficialHolidaysState],
  (officialHolidaysState) => officialHolidaysState.isDeleting
);

// ============================================================================
// Error State Selectors
// ============================================================================

/**
 * Select error
 */
export const selectError = createSelector(
  [selectOfficialHolidaysState],
  (officialHolidaysState) => officialHolidaysState.error
);
