/**
 * Lookup API Endpoints
 * Endpoint definitions for lookup tables
 */

const BASE_LK = '/api';

export const LookupsEndpoints = {
  applicationFeatures: `${BASE_LK}/LKApplicationFeatures`,
  countries: `${BASE_LK}/LKCountries/GetAllCountries`,
} as const;
