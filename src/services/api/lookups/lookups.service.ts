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
  JobBenefit,
  JobBenefitsResponse,
  Language,
  LanguagesResponse,
  LanguageLevel,
  LanguageLevelsResponse,
  TeacherLevel,
  TeacherLevelsResponse,
  Qualification,
  QualificationsResponse,
  AdministrativePosition,
  AdministrativePositionsResponse,
  LKPaymentMethodDto,
  LKPaymentMethodsResponse,
  LKPaymentMethodQueryParams,
  CreateLKPaymentMethodRequest,
  UpdateLKPaymentMethodRequest,
} from '../types/lookup.types';
import type { ApiResponseModel } from '../config';

const serializeParams = (params?: Record<string, string | number | boolean | undefined | null>) => {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams.toString();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

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
// Job Benefits
// ============================================================================

export async function getJobBenefits(): Promise<JobBenefit[]> {
  const response: AxiosResponse<JobBenefitsResponse> = await axiosClient.get(
    LookupsEndpoints.jobBenefits
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Failed to fetch job benefits');
  }

  return response.data.data?.lkJobBenefitDto || [];
}

// ============================================================================
// Languages
// ============================================================================

export async function getLanguages(): Promise<Language[]> {
  const response: AxiosResponse<LanguagesResponse> = await axiosClient.get(
    LookupsEndpoints.languages
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Failed to fetch languages');
  }

  return response.data.data?.languageDto || [];
}

// ============================================================================
// Language Levels
// ============================================================================

export async function getLanguageLevels(): Promise<LanguageLevel[]> {
  const response: AxiosResponse<LanguageLevelsResponse> = await axiosClient.get(
    LookupsEndpoints.languageLevels
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Failed to fetch language levels');
  }

  return response.data.data?.lkLevelsDto || [];
}

// ============================================================================
// Teacher Levels
// ============================================================================

export async function getTeacherLevels(): Promise<TeacherLevel[]> {
  const response: AxiosResponse<TeacherLevelsResponse> = await axiosClient.get(
    LookupsEndpoints.teacherLevels
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Failed to fetch teacher levels');
  }

  return response.data.data?.lkTeacherLevelDto || [];
}

// ============================================================================
// Qualifications
// ============================================================================

export async function getQualifications(): Promise<Qualification[]> {
  const response: AxiosResponse<QualificationsResponse> = await axiosClient.get(
    LookupsEndpoints.qualifications
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Failed to fetch qualifications');
  }

  return response.data.data?.lkQualificationDto || [];
}

// ============================================================================
// Administrative Positions
// ============================================================================

export async function getAdministrativePositions(): Promise<AdministrativePosition[]> {
  const response: AxiosResponse<AdministrativePositionsResponse> = await axiosClient.get(
    LookupsEndpoints.administrativePositions
  );

  if (!response.data.isSuccess) {
    throw new Error(response.data.message || 'Failed to fetch administrative positions');
  }

  return response.data.data?.lkAdministrativePositionDto || [];
}

// ============================================================================
// LK Payment Methods
// ============================================================================

export async function getLKPaymentMethods(
  params?: LKPaymentMethodQueryParams
): Promise<LKPaymentMethodsResponse> {
  const response: AxiosResponse<LKPaymentMethodsResponse> = await axiosClient.get(
    LookupsEndpoints.lkPaymentMethods,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  return response.data;
}

export async function getLKPaymentMethodById(id: string): Promise<LKPaymentMethodDto> {
  const response: AxiosResponse<ApiResponseModel<LKPaymentMethodDto>> = await axiosClient.get(
    `${LookupsEndpoints.lkPaymentMethods}/${id}`
  );

  return (response.data.data ?? response.data.value) as LKPaymentMethodDto;
}

export async function createLKPaymentMethod(
  data: CreateLKPaymentMethodRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    LookupsEndpoints.lkPaymentMethods,
    data
  );

  return response.data;
}

export async function updateLKPaymentMethod(
  data: UpdateLKPaymentMethodRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    LookupsEndpoints.lkPaymentMethods,
    data
  );

  return response.data;
}

export async function deleteLKPaymentMethod(id: string): Promise<ApiResponseModel<string>> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    `${LookupsEndpoints.lkPaymentMethods}/${id}`
  );

  return response.data;
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

  // Job Benefits
  getJobBenefits,

  // Languages
  getLanguages,

  // Language Levels
  getLanguageLevels,

  // Teacher Levels
  getTeacherLevels,

  // Qualifications
  getQualifications,

  // Administrative Positions
  getAdministrativePositions,

  // LK Payment Methods
  getLKPaymentMethods,
  getLKPaymentMethodById,
  createLKPaymentMethod,
  updateLKPaymentMethod,
  deleteLKPaymentMethod,
};

export default lookupsApiService;
