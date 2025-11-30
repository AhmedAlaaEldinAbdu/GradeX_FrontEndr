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
  Region,
  RegionsResponse,
  RegionQueryParams,
  City,
  CitiesResponse,
  CityQueryParams,
  SchoolStage,
  SchoolStagesResponse,
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
// Regions
// ============================================================================

/**
 * Get all regions
 */
export async function getAllRegions(): Promise<Region[]> {
  const params = {
    PageIndex: 1,
    PageSize: 1000,
  };

  const response: AxiosResponse<RegionsResponse> = await axiosClient.get(LookupsEndpoints.regions, {
    params,
  });

  if (!response.data.isSuccess) {
    throw new Error(response.data.successMessage || 'Failed to fetch regions');
  }

  return response.data.value.regionDto || [];
}

/**
 * Get regions by country ID
 */
export async function getRegionsByCountry(countryId: string): Promise<Region[]> {
  const params: RegionQueryParams = {
    PageIndex: 1,
    PageSize: 100,
    CountryId: countryId,
  };

  const response: AxiosResponse<RegionsResponse> = await axiosClient.get(LookupsEndpoints.regions, {
    params,
  });

  if (!response.data.isSuccess) {
    throw new Error(response.data.successMessage || 'Failed to fetch regions');
  }

  return response.data.value.regionDto || [];
}

// ============================================================================
// Cities (Neighborhoods)
// ============================================================================

/**
 * Get all cities
 */
export async function getAllCities(): Promise<City[]> {
  const params = {
    PageIndex: 1,
    PageSize: 1000,
  };

  const response: AxiosResponse<CitiesResponse> = await axiosClient.get(LookupsEndpoints.cities, {
    params,
  });

  if (!response.data.isSuccess) {
    throw new Error(response.data.successMessage || 'Failed to fetch cities');
  }

  return response.data.value.cityDto || [];
}

/**
 * Get cities by region ID
 */
export async function getCitiesByRegion(regionId: string): Promise<City[]> {
  const params: CityQueryParams = {
    PageIndex: 1,
    PageSize: 100,
    RegionId: regionId,
  };

  const response: AxiosResponse<CitiesResponse> = await axiosClient.get(LookupsEndpoints.cities, {
    params,
  });

  if (!response.data.isSuccess) {
    throw new Error(response.data.successMessage || 'Failed to fetch cities');
  }

  return response.data.value.cityDto || [];
}

// ============================================================================
// School Stages
// ============================================================================

/**
 * Get all school stages
 */
export async function getSchoolStages(): Promise<SchoolStage[]> {
  const response: AxiosResponse<SchoolStagesResponse> = await axiosClient.get(
    LookupsEndpoints.schoolStages
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.successMessage || 'Failed to fetch school stages');
  }

  return response.data.value;
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

  // Regions
  getAllRegions,
  getRegionsByCountry,

  // Cities
  getAllCities,
  getCitiesByRegion,

  // School Stages
  getSchoolStages,
};

export default lookupsApiService;
