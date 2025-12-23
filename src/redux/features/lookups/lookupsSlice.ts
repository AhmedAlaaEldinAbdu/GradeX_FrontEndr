/**
 * Lookups Redux Slice
 * State management for lookup tables
 */

import { createSlice, createAsyncThunk, type ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { lookupsApiService } from '@/services/api/lookups/lookups.service';
import { getErrorMessage } from '@/lib/http';
import type {
  ApplicationFeature,
  Country,
  Facility,
  Region,
  City,
  SchoolStage,
  JobBenefit,
  Language,
  LanguageLevel,
  TeacherLevel,
  Qualification,
  AdministrativePosition,
} from '@/services/api/types/lookup.types';
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
  regions: [],
  cities: [],
  schoolStages: [],
  jobBenefits: [],
  languages: [],
  languageLevels: [],
  teacherLevels: [],
  qualifications: [],
  administrativePositions: [],

  // Loading States
  isLoadingFeatures: false,
  isLoadingFacilities: false,
  isLoadingCountries: false,
  isLoadingRegions: false,
  isLoadingCities: false,
  isLoadingSchoolStages: false,
  isLoadingJobBenefits: false,
  isLoadingLanguages: false,
  isLoadingLanguageLevels: false,
  isLoadingTeacherLevels: false,
  isLoadingQualifications: false,
  isLoadingAdministrativePositions: false,

  // Error States
  featuresError: null,
  facilitiesError: null,
  countriesError: null,
  regionsError: null,
  citiesError: null,
  schoolStagesError: null,
  jobBenefitsError: null,
  languagesError: null,
  languageLevelsError: null,
  teacherLevelsError: null,
  qualificationsError: null,
  administrativePositionsError: null,

  // Initialization States
  isFeaturesInitialized: false,
  isFacilitiesInitialized: false,
  isCountriesInitialized: false,
  isSchoolStagesInitialized: false,
  isJobBenefitsInitialized: false,
  isLanguagesInitialized: false,
  isLanguageLevelsInitialized: false,
  isTeacherLevelsInitialized: false,
  isQualificationsInitialized: false,
  isAdministrativePositionsInitialized: false,

  // Timestamps
  lastFetchedFeatures: null,
  lastFetchedFacilities: null,
  lastFetchedCountries: null,
  lastFetchedSchoolStages: null,
  lastFetchedJobBenefits: null,
  lastFetchedLanguages: null,
  lastFetchedLanguageLevels: null,
  lastFetchedTeacherLevels: null,
  lastFetchedQualifications: null,
  lastFetchedAdministrativePositions: null,
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

/**
 * Fetch all regions
 */
export const fetchAllRegions = createAsyncThunk<Region[], void, { state: RootState }>(
  'lookups/fetchAllRegions',
  async (_, { rejectWithValue }) => {
    try {
      const regions = await lookupsApiService.getAllRegions();
      return regions;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Fetch regions by country ID
 */
export const fetchRegionsByCountry = createAsyncThunk<Region[], string, { state: RootState }>(
  'lookups/fetchRegionsByCountry',
  async (countryId, { rejectWithValue }) => {
    try {
      if (!countryId) {
        return [];
      }
      const regions = await lookupsApiService.getRegionsByCountry(countryId);
      return regions;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Fetch all cities
 */
export const fetchAllCities = createAsyncThunk<City[], void, { state: RootState }>(
  'lookups/fetchAllCities',
  async (_, { rejectWithValue }) => {
    try {
      const cities = await lookupsApiService.getAllCities();
      return cities;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Fetch cities by region ID
 */
export const fetchCitiesByRegion = createAsyncThunk<City[], string, { state: RootState }>(
  'lookups/fetchCitiesByRegion',
  async (regionId, { rejectWithValue }) => {
    try {
      if (!regionId) {
        return [];
      }
      const cities = await lookupsApiService.getCitiesByRegion(regionId);
      return cities;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Fetch school stages
 * Includes cache check to avoid unnecessary API calls
 */
export const fetchSchoolStages = createAsyncThunk<
  SchoolStage[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchSchoolStages', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { lastFetchedSchoolStages, isSchoolStagesInitialized, schoolStages } = state.lookups;

    // Check cache if not forced
    if (!options?.force && isSchoolStagesInitialized) {
      const now = Date.now();
      const isCacheValid =
        lastFetchedSchoolStages && now - lastFetchedSchoolStages < LOOKUP_CACHE_DURATION;

      if (isCacheValid && schoolStages.length > 0) {
        // Return cached data
        return schoolStages;
      }
    }

    // Fetch from API
    const schoolStagesData = await lookupsApiService.getSchoolStages();
    return schoolStagesData;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Fetch job benefits lookup
 */
export const fetchJobBenefits = createAsyncThunk<
  JobBenefit[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchJobBenefits', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { lastFetchedJobBenefits, isJobBenefitsInitialized, jobBenefits } = state.lookups;

    if (!options?.force && isJobBenefitsInitialized) {
      const now = Date.now();
      const isCacheValid =
        lastFetchedJobBenefits && now - lastFetchedJobBenefits < LOOKUP_CACHE_DURATION;

      if (isCacheValid && jobBenefits.length > 0) {
        return jobBenefits;
      }
    }

    const benefits = await lookupsApiService.getJobBenefits();
    return benefits;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Fetch languages lookup
 */
export const fetchLanguages = createAsyncThunk<
  Language[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchLanguages', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { lastFetchedLanguages, isLanguagesInitialized, languages } = state.lookups;

    if (!options?.force && isLanguagesInitialized) {
      const now = Date.now();
      const isCacheValid = lastFetchedLanguages && now - lastFetchedLanguages < LOOKUP_CACHE_DURATION;

      if (isCacheValid && languages.length > 0) {
        return languages;
      }
    }

    const fetchedLanguages = await lookupsApiService.getLanguages();
    return fetchedLanguages;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Fetch language levels lookup
 */
export const fetchLanguageLevels = createAsyncThunk<
  LanguageLevel[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchLanguageLevels', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { lastFetchedLanguageLevels, isLanguageLevelsInitialized, languageLevels } = state.lookups;

    if (!options?.force && isLanguageLevelsInitialized) {
      const now = Date.now();
      const isCacheValid =
        lastFetchedLanguageLevels && now - lastFetchedLanguageLevels < LOOKUP_CACHE_DURATION;

      if (isCacheValid && languageLevels.length > 0) {
        return languageLevels;
      }
    }

    const fetchedLevels = await lookupsApiService.getLanguageLevels();
    return fetchedLevels;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Fetch teacher levels lookup
 */
export const fetchTeacherLevels = createAsyncThunk<
  TeacherLevel[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchTeacherLevels', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { lastFetchedTeacherLevels, isTeacherLevelsInitialized, teacherLevels } = state.lookups;

    if (!options?.force && isTeacherLevelsInitialized) {
      const now = Date.now();
      const isCacheValid =
        lastFetchedTeacherLevels && now - lastFetchedTeacherLevels < LOOKUP_CACHE_DURATION;

      if (isCacheValid && teacherLevels.length > 0) {
        return teacherLevels;
      }
    }

    const fetchedTeacherLevels = await lookupsApiService.getTeacherLevels();
    return fetchedTeacherLevels;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Fetch qualifications lookup
 */
export const fetchQualifications = createAsyncThunk<
  Qualification[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchQualifications', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const { lastFetchedQualifications, isQualificationsInitialized, qualifications } = state.lookups;

    if (!options?.force && isQualificationsInitialized) {
      const now = Date.now();
      const isCacheValid =
        lastFetchedQualifications && now - lastFetchedQualifications < LOOKUP_CACHE_DURATION;

      if (isCacheValid && qualifications.length > 0) {
        return qualifications;
      }
    }

    const fetchedQualifications = await lookupsApiService.getQualifications();
    return fetchedQualifications;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Fetch administrative positions lookup
 */
export const fetchAdministrativePositions = createAsyncThunk<
  AdministrativePosition[],
  { force?: boolean } | void,
  { state: RootState }
>('lookups/fetchAdministrativePositions', async (options, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const {
      lastFetchedAdministrativePositions,
      isAdministrativePositionsInitialized,
      administrativePositions,
    } = state.lookups;

    if (!options?.force && isAdministrativePositionsInitialized) {
      const now = Date.now();
      const isCacheValid =
        lastFetchedAdministrativePositions &&
        now - lastFetchedAdministrativePositions < LOOKUP_CACHE_DURATION;

      if (isCacheValid && administrativePositions.length > 0) {
        return administrativePositions;
      }
    }

    const fetchedPositions = await lookupsApiService.getAdministrativePositions();
    return fetchedPositions;
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
      state.regions = [];
      state.cities = [];
      state.schoolStages = [];
      state.jobBenefits = [];
      state.languages = [];
      state.languageLevels = [];
      state.teacherLevels = [];
      state.qualifications = [];
      state.administrativePositions = [];
      state.isFeaturesInitialized = false;
      state.isFacilitiesInitialized = false;
      state.isCountriesInitialized = false;
      state.isSchoolStagesInitialized = false;
      state.isJobBenefitsInitialized = false;
      state.isLanguagesInitialized = false;
      state.isLanguageLevelsInitialized = false;
      state.isTeacherLevelsInitialized = false;
      state.isQualificationsInitialized = false;
      state.isAdministrativePositionsInitialized = false;
      state.lastFetchedFeatures = null;
      state.lastFetchedFacilities = null;
      state.lastFetchedCountries = null;
      state.lastFetchedSchoolStages = null;
      state.lastFetchedJobBenefits = null;
      state.lastFetchedLanguages = null;
      state.lastFetchedLanguageLevels = null;
      state.lastFetchedTeacherLevels = null;
      state.lastFetchedQualifications = null;
      state.lastFetchedAdministrativePositions = null;
    },

    /**
     * Clear all errors
     */
    clearLookupsErrors: (state) => {
      state.featuresError = null;
      state.facilitiesError = null;
      state.countriesError = null;
      state.regionsError = null;
      state.citiesError = null;
      state.schoolStagesError = null;
      state.jobBenefitsError = null;
      state.languagesError = null;
      state.languageLevelsError = null;
      state.teacherLevelsError = null;
      state.qualificationsError = null;
      state.administrativePositionsError = null;
    },

    /**
     * Clear regions
     */
    clearRegions: (state) => {
      state.regions = [];
      state.regionsError = null;
    },

    /**
     * Clear cities
     */
    clearCities: (state) => {
      state.cities = [];
      state.citiesError = null;
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

    // ========================================================================
    // Fetch All Regions
    // ========================================================================

    builder
      .addCase(fetchAllRegions.pending, (state) => {
        state.isLoadingRegions = true;
        state.regionsError = null;
      })
      .addCase(fetchAllRegions.fulfilled, (state, action) => {
        state.isLoadingRegions = false;
        state.regions = action.payload;
        state.regionsError = null;
      })
      .addCase(fetchAllRegions.rejected, (state, action) => {
        state.isLoadingRegions = false;
        state.regionsError = action.payload as string;
      });

    // ========================================================================
    // Fetch Regions by Country
    // ========================================================================

    builder
      .addCase(fetchRegionsByCountry.pending, (state) => {
        state.isLoadingRegions = true;
        state.regionsError = null;
      })
      .addCase(fetchRegionsByCountry.fulfilled, (state, action) => {
        state.isLoadingRegions = false;
        state.regions = action.payload;
        state.regionsError = null;
      })
      .addCase(fetchRegionsByCountry.rejected, (state, action) => {
        state.isLoadingRegions = false;
        state.regionsError = action.payload as string;
      });

    // ========================================================================
    // Fetch All Cities
    // ========================================================================

    builder
      .addCase(fetchAllCities.pending, (state) => {
        state.isLoadingCities = true;
        state.citiesError = null;
      })
      .addCase(fetchAllCities.fulfilled, (state, action) => {
        state.isLoadingCities = false;
        state.cities = action.payload;
        state.citiesError = null;
      })
      .addCase(fetchAllCities.rejected, (state, action) => {
        state.isLoadingCities = false;
        state.citiesError = action.payload as string;
      });

    // ========================================================================
    // Fetch Cities by Region
    // ========================================================================

    builder
      .addCase(fetchCitiesByRegion.pending, (state) => {
        state.isLoadingCities = true;
        state.citiesError = null;
      })
      .addCase(fetchCitiesByRegion.fulfilled, (state, action) => {
        state.isLoadingCities = false;
        state.cities = action.payload;
        state.citiesError = null;
      })
      .addCase(fetchCitiesByRegion.rejected, (state, action) => {
        state.isLoadingCities = false;
        state.citiesError = action.payload as string;
      });

    // ========================================================================
    // Fetch School Stages
    // ========================================================================

    builder
      .addCase(fetchSchoolStages.pending, (state) => {
        state.isLoadingSchoolStages = true;
        state.schoolStagesError = null;
      })
      .addCase(fetchSchoolStages.fulfilled, (state, action) => {
        state.isLoadingSchoolStages = false;
        state.isSchoolStagesInitialized = true;
        state.schoolStages = action.payload;
        state.lastFetchedSchoolStages = Date.now();
        state.schoolStagesError = null;
      })
      .addCase(fetchSchoolStages.rejected, (state, action) => {
        state.isLoadingSchoolStages = false;
        state.schoolStagesError = action.payload as string;
      });

    // ========================================================================
    // Fetch Job Benefits
    // ========================================================================

    builder
      .addCase(fetchJobBenefits.pending, (state) => {
        state.isLoadingJobBenefits = true;
        state.jobBenefitsError = null;
      })
      .addCase(fetchJobBenefits.fulfilled, (state, action) => {
        state.isLoadingJobBenefits = false;
        state.isJobBenefitsInitialized = true;
        state.jobBenefits = action.payload;
        state.lastFetchedJobBenefits = Date.now();
        state.jobBenefitsError = null;
      })
      .addCase(fetchJobBenefits.rejected, (state, action) => {
        state.isLoadingJobBenefits = false;
        state.jobBenefitsError = action.payload as string;
      });

    // ========================================================================
    // Fetch Languages
    // ========================================================================

    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.isLoadingLanguages = true;
        state.languagesError = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.isLoadingLanguages = false;
        state.isLanguagesInitialized = true;
        state.languages = action.payload;
        state.lastFetchedLanguages = Date.now();
        state.languagesError = null;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.isLoadingLanguages = false;
        state.languagesError = action.payload as string;
      });

    // ========================================================================
    // Fetch Language Levels
    // ========================================================================

    builder
      .addCase(fetchLanguageLevels.pending, (state) => {
        state.isLoadingLanguageLevels = true;
        state.languageLevelsError = null;
      })
      .addCase(fetchLanguageLevels.fulfilled, (state, action) => {
        state.isLoadingLanguageLevels = false;
        state.isLanguageLevelsInitialized = true;
        state.languageLevels = action.payload;
        state.lastFetchedLanguageLevels = Date.now();
        state.languageLevelsError = null;
      })
      .addCase(fetchLanguageLevels.rejected, (state, action) => {
        state.isLoadingLanguageLevels = false;
        state.languageLevelsError = action.payload as string;
      });

    // ========================================================================
    // Fetch Teacher Levels
    // ========================================================================

    builder
      .addCase(fetchTeacherLevels.pending, (state) => {
        state.isLoadingTeacherLevels = true;
        state.teacherLevelsError = null;
      })
      .addCase(fetchTeacherLevels.fulfilled, (state, action) => {
        state.isLoadingTeacherLevels = false;
        state.isTeacherLevelsInitialized = true;
        state.teacherLevels = action.payload;
        state.lastFetchedTeacherLevels = Date.now();
        state.teacherLevelsError = null;
      })
      .addCase(fetchTeacherLevels.rejected, (state, action) => {
        state.isLoadingTeacherLevels = false;
        state.teacherLevelsError = action.payload as string;
      });

    // ========================================================================
    // Fetch Qualifications
    // ========================================================================

    builder
      .addCase(fetchQualifications.pending, (state) => {
        state.isLoadingQualifications = true;
        state.qualificationsError = null;
      })
      .addCase(fetchQualifications.fulfilled, (state, action) => {
        state.isLoadingQualifications = false;
        state.isQualificationsInitialized = true;
        state.qualifications = action.payload;
        state.lastFetchedQualifications = Date.now();
        state.qualificationsError = null;
      })
      .addCase(fetchQualifications.rejected, (state, action) => {
        state.isLoadingQualifications = false;
        state.qualificationsError = action.payload as string;
      });

    // ========================================================================
    // Fetch Administrative Positions
    // ========================================================================

    builder
      .addCase(fetchAdministrativePositions.pending, (state) => {
        state.isLoadingAdministrativePositions = true;
        state.administrativePositionsError = null;
      })
      .addCase(fetchAdministrativePositions.fulfilled, (state, action) => {
        state.isLoadingAdministrativePositions = false;
        state.isAdministrativePositionsInitialized = true;
        state.administrativePositions = action.payload;
        state.lastFetchedAdministrativePositions = Date.now();
        state.administrativePositionsError = null;
      })
      .addCase(fetchAdministrativePositions.rejected, (state, action) => {
        state.isLoadingAdministrativePositions = false;
        state.administrativePositionsError = action.payload as string;
      });
  },
});

// ============================================================================
// Export Actions and Reducer
// ============================================================================

export const {
  clearLookupsData,
  clearLookupsErrors,
  clearRegions,
  clearCities,
  resetLookupsState,
} = lookupsSlice.actions;

export default lookupsSlice.reducer;
