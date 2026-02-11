import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import CustomSelect from '@gradex/shared/components/CustomSelect';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/utils/logger';
import RegisteredSchoolsTab from './RegisteredSchoolsTab';
import PendingSchoolsTab from './PendingSchoolsTab';
import DeletedSchoolsTab from './DeletedSchoolsTab';
import {
  fetchCountries,
  fetchAllRegions,
  fetchRegionsByCountry,
  fetchAllCities,
  fetchCitiesByRegion,
  clearRegions,
  clearCities,
  selectCountries,
  selectIsLoadingCountries,
  selectRegions,
  selectIsLoadingRegions,
  selectCities,
  selectIsLoadingCities,
} from '@gradex/redux/features/lookups';
import {
  getAcademicSystems,
  selectAcademicSystems,
  selectIsLoadingAcademicSystems,
} from '@gradex/redux/features/academic-system';
import { resetPagination, clearSchools } from '@gradex/redux/features/schools';
import Tabs from '@/shared/components/Tabs';
import type { FilterConfig } from '@/shared/components/DataTable';

export default function Schools() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState('RegisteredSchools');
  const [searchTerm, setSearchTerm] = useState('');
  const [academicSystem, setAcademicSystem] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Get countries from Redux
  const countries = useSelector(selectCountries) || [];
  const isLoadingCountries = useSelector(selectIsLoadingCountries);

  const regions = useSelector(selectRegions) || [];
  const isLoadingRegions = useSelector(selectIsLoadingRegions);

  const cities = useSelector(selectCities) || [];
  const isLoadingCities = useSelector(selectIsLoadingCities);

  // Get academic systems from Redux
  const academicSystems = useSelector(selectAcademicSystems) || [];
  const isLoadingAcademicSystems = useSelector(selectIsLoadingAcademicSystems);

  // Get current language
  const currentLang = i18n.language as 'ar' | 'en';

  // Fetch countries, academic systems, all regions and all cities on component mount
  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAcademicSystems({ pageIndex: 1, pageSize: 100 }));
    dispatch(fetchAllRegions());
    dispatch(fetchAllCities());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCountry) {
      dispatch(fetchRegionsByCountry(selectedCountry));
      setSelectedRegion('');
      setSelectedCity('');
    } else {
      dispatch(fetchAllRegions());
      setSelectedRegion('');
      setSelectedCity('');
    }
  }, [selectedCountry, dispatch]);

  useEffect(() => {
    if (selectedRegion) {
      dispatch(fetchCitiesByRegion(selectedRegion));
      setSelectedCity('');
    } else {
      dispatch(fetchAllCities());
      setSelectedCity('');
    }
  }, [selectedRegion, dispatch]);

  // Log countries when loaded
  useEffect(() => {
    if (Array.isArray(countries) && countries.length > 0) {
      logger.success(`Countries loaded: ${countries.length} countries`);
      logger.debug('First country', countries[0]);
    }
  }, [countries]);

  // Log academic systems when loaded
  useEffect(() => {
    if (Array.isArray(academicSystems) && academicSystems.length > 0) {
      logger.success(`Academic systems loaded: ${academicSystems.length} systems`);
      logger.debug('First academic system', academicSystems[0]);
    }
  }, [academicSystems]);

  // Handle tab change with filter reset
  const handleTabChange = (tabId: string) => {
    // Clear schools data immediately to prevent stale data from showing
    dispatch(clearSchools());
    // Reset filters
    setSearchTerm('');
    setAcademicSystem('');
    setSelectedCountry('');
    setSelectedRegion('');
    setSelectedCity('');
    dispatch(resetPagination());
    dispatch(clearRegions());
    dispatch(clearCities());
    setActiveTab(tabId);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setAcademicSystem('');
    setSelectedCountry('');
    setSelectedRegion('');
    setSelectedCity('');
    dispatch(fetchAllRegions());
    dispatch(fetchAllCities());
  };

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'school-search',
      placeholder: t('schools.searchBySchoolName'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '25%',
    },
    {
      type: 'custom',
      name: 'academic-system-filter',
      value: academicSystem,
      onChange: () => {},
      width: 'auto',
      customComponent: (
        <CustomSelect
          value={academicSystem}
          onChange={(value) => setAcademicSystem(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={
            Array.isArray(academicSystems)
              ? academicSystems.map((system) => ({ value: system.id, label: system.nameAr }))
              : []
          }
          placeholder={isLoadingAcademicSystems ? t('common.loading') : t('schools.academicSystem')}
          disabled={isLoadingAcademicSystems}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'country-filter',
      value: selectedCountry,
      onChange: () => {},
      width: 'auto',
      customComponent: (
        <CustomSelect
          value={selectedCountry}
          onChange={(value) => setSelectedCountry(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={
            Array.isArray(countries)
              ? countries.map((country) => ({
                  value: country?.id || '',
                  label:
                    currentLang === 'ar' ? country?.arabicName || '' : country?.englishName || '',
                }))
              : []
          }
          placeholder={isLoadingCountries ? t('common.loading') : t('schools.country')}
          disabled={isLoadingCountries}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'region-filter',
      value: selectedRegion,
      onChange: () => {},
      width: 'auto',
      customComponent: (
        <CustomSelect
          value={selectedRegion}
          onChange={(value) => setSelectedRegion(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={
            Array.isArray(regions)
              ? regions.map((region) => ({
                  value: region?.id || '',
                  label:
                    currentLang === 'ar' ? region?.arabicName || '' : region?.englishName || '',
                }))
              : []
          }
          placeholder={isLoadingRegions ? t('common.loading') : t('schools.region')}
          disabled={isLoadingRegions}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'city-filter',
      value: selectedCity,
      onChange: () => {},
      width: 'auto',
      customComponent: (
        <CustomSelect
          value={selectedCity}
          onChange={(value) => setSelectedCity(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={
            Array.isArray(cities)
              ? cities.map((city) => ({
                  value: city?.id || '',
                  label: currentLang === 'ar' ? city?.arabicName || '' : city?.englishName || '',
                }))
              : []
          }
          placeholder={isLoadingCities ? t('common.loading') : t('schools.neighborhood')}
          disabled={isLoadingCities}
          maxHeight="200px"
        />
      ),
    },
  ];

  const tabs = [
    {
      id: 'RegisteredSchools',
      label: t('schools.registeredSchools'),
      content: (
        <RegisteredSchoolsTab
          filters={{
            searchTerm: searchTerm || undefined,
            academicSystemId: academicSystem || undefined,
            lKCountryId: selectedCountry || undefined,
            region: selectedRegion || undefined,
            neighborhood: selectedCity || undefined,
          }}
          filterConfigs={filterConfigs}
          onResetFilters={handleResetFilters}
          isActive={activeTab === 'RegisteredSchools'}
        />
      ),
    },
    {
      id: 'PendingSchools',
      label: t('schools.pendingSchools'),
      content: (
        <PendingSchoolsTab
          filters={{
            searchTerm: searchTerm || undefined,
            academicSystemId: academicSystem || undefined,
            lKCountryId: selectedCountry || undefined,
            region: selectedRegion || undefined,
            neighborhood: selectedCity || undefined,
          }}
          filterConfigs={filterConfigs}
          onResetFilters={handleResetFilters}
          isActive={activeTab === 'PendingSchools'}
        />
      ),
    },
    {
      id: 'DeletedSchools',
      label: t('schools.deletedSchools'),
      content: (
        <DeletedSchoolsTab
          filters={{
            searchTerm: searchTerm || undefined,
            academicSystemId: academicSystem || undefined,
            lKCountryId: selectedCountry || undefined,
            region: selectedRegion || undefined,
            neighborhood: selectedCity || undefined,
          }}
          filterConfigs={filterConfigs}
          onResetFilters={handleResetFilters}
          isActive={activeTab === 'DeletedSchools'}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-5 w-full px-1">
        <div>
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={handleTabChange}
            variant="underline"
            listClassName="flex w-[100%] md:w-[75%] lg:w-[50%] gap-2 mb-5 px-1 flex-wrap"
            lazy={true}
            searchParamKey="tab"
          />
        </div>
      </div>
    </div>
  );
}
