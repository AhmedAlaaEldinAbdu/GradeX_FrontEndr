import type { OfficialHoliday } from '@/services/api/types/official-holidays.types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CountryHolidayGroup {
  countryAR: string;
  countryEN: string;
  count: number;
  firstHolidayId: string;
}

// ============================================================================
// Data Transformation Functions
// ============================================================================

/**
 * Groups official holidays by country and counts them
 * @param holidays - Array of official holidays
 * @returns Array of country groups with holiday counts
 */
export function groupHolidaysByCountry(holidays: OfficialHoliday[]): CountryHolidayGroup[] {
  const groupedByCountry: Record<string, CountryHolidayGroup> = {};

  holidays.forEach((holiday) => {
    const key = holiday.countryNameAR || holiday.countryNameEN;
    if (!groupedByCountry[key]) {
      groupedByCountry[key] = {
        countryAR: holiday.countryNameAR,
        countryEN: holiday.countryNameEN,
        count: 0,
        firstHolidayId: holiday.lkCountryId,
      };
    }
    groupedByCountry[key].count++;
  });

  return Object.values(groupedByCountry);
}

/**
 * Filters country groups by search term
 * @param countries - Array of country holiday groups
 * @param searchTerm - Search term to filter by
 * @returns Filtered array of country groups
 */
export function filterCountriesBySearch(
  countries: CountryHolidayGroup[],
  searchTerm: string
): CountryHolidayGroup[] {
  if (!searchTerm) return countries;

  const searchLower = searchTerm.toLowerCase();
  return countries.filter(
    (country) =>
      country.countryAR.toLowerCase().includes(searchLower) ||
      country.countryEN.toLowerCase().includes(searchLower)
  );
}
