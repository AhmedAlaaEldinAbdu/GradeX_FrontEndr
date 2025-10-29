/**
 * Lookups API Service
 * Handles all API calls related to lookup tables using Axios
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { LookupsEndpoints } from '../endpoints/lookups-endpoints';
import type {
  ApplicationFeature,
  ApplicationFeaturesResponse,
  Country,
  CountriesResponse,
  Facility,
  FacilitiesResponse,
} from '../types/lookup.types';

// ============================================================================
// Application Features
// ============================================================================

/**
 * Get all application features
 */
export async function getApplicationFeatures(): Promise<ApplicationFeature[]> {
  const response: AxiosResponse<ApplicationFeaturesResponse> = await axiosClient.get(
    LookupsEndpoints.applicationFeatures
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.successMessage || 'Failed to fetch application features');
  }

  return response.data.value;
}

// ============================================================================
// Facilities
// ============================================================================

/**
 * Get all facilities
 */
export async function getFacilities(): Promise<Facility[]> {
  const response: AxiosResponse<FacilitiesResponse> = await axiosClient.get(
    LookupsEndpoints.facilities
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.successMessage || 'Failed to fetch facilities');
  }

  return response.data.value;
}

// ============================================================================
// Countries
// ============================================================================

/**
 * Get all countries
 */
export async function getCountries(): Promise<Country[]> {
  const response: AxiosResponse<CountriesResponse> = await axiosClient.get(
    LookupsEndpoints.countries
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.successMessage || 'Failed to fetch countries');
  }

  return response.data.value;
}

/**
 * Get country by ID
 */
export function getCountryById(countries: Country[], id: string): Country | undefined {
  return countries.find((country) => country.id === id);
}

/**
 * Get country by code
 */
export function getCountryByCode(countries: Country[], code: string): Country | undefined {
  return countries.find((country) => country.countryCode.toUpperCase() === code.toUpperCase());
}

/**
 * Search countries by name
 */
export function searchCountries(
  countries: Country[],
  searchTerm: string,
  language: 'ar' | 'en' = 'en'
): Country[] {
  const term = searchTerm.toLowerCase();

  return countries.filter((country) => {
    const name = language === 'ar' ? country.arabicName : country.englishName;
    return (
      name.toLowerCase().includes(term) ||
      country.countryCode.toLowerCase().includes(term) ||
      country.areaCode.includes(term)
    );
  });
}

// ============================================================================
// Export All Services
// ============================================================================

export const lookupsApiService = {
  // Application Features
  getApplicationFeatures,

  // Facilities
  getFacilities,

  // Countries
  getCountries,
  getCountryById,
  getCountryByCode,
  searchCountries,
};

export default lookupsApiService;
