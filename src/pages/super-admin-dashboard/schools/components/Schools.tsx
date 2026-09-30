import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import CustomSelect from '@gradex/shared/components/CustomSelect';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/utils/logger';
import RegisteredSchoolsTab from './RegisteredSchoolsTab';
import PendingSchoolsTab from './PendingSchoolsTab';
import DeletedSchoolsTab from './DeletedSchoolsTab';
import ExcelFileIcon from '@gradex/assets/icons/ExcelFile.svg';
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
import { resetPagination, clearSchools, exportSchoolsExcel } from '@gradex/redux/features/schools';
import Tabs from '@/shared/components/Tabs';
import Button from '@/shared/components/Button';
import { useToast } from '@/shared/context/ToastContext';
import type { FilterConfig } from '@/shared/components/DataTable';
import { SchoolStatusEnum, type SchoolFilters } from '@/services/api';

export default function Schools() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('RegisteredSchools');
  const [isExporting, setIsExporting] = useState(false);
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

  const getActiveTabStatus = (): SchoolFilters['schoolStatus'] => {
    if (activeTab === 'PendingSchools') return SchoolStatusEnum.PENDING;
    if (activeTab === 'DeletedSchools') {
      return [SchoolStatusEnum.REJECTED, SchoolStatusEnum.DELETED];
    }
    return SchoolStatusEnum.ACTIVE;
  };

  const getActiveTabFileName = () => {
    const tabName =
      activeTab === 'PendingSchools'
        ? 'pending-schools'
        : activeTab === 'DeletedSchools'
          ? 'deleted-schools'
          : 'registered-schools';

    return `${tabName}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportSchools = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const blob = await dispatch(
        exportSchoolsExcel({
          schoolStatus: getActiveTabStatus(),
          searchTerm: searchTerm || undefined,
          academicSystemId: academicSystem || undefined,
          lKCountryId: selectedCountry || undefined,
          region: selectedRegion || undefined,
          neighborhood: selectedCity || undefined,
        })
      ).unwrap();

      downloadBlob(blob, getActiveTabFileName());
      showToast({ message: 'invoices.exportSuccess', type: 'success' });
    } catch (error) {
      showToast({
        message: typeof error === 'string' ? error : 'common.error',
        type: 'error',
        isRaw: typeof error === 'string',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAction = (
    <div className="flex justify-end">
      <Button
        variant="outline"
        size="sm"
        imgSrc={ExcelFileIcon}
        imgClassName="h-4 w-4"
        onClick={handleExportSchools}
        loading={isExporting}
      >
        {isExporting ? t('common.processing') : t('studentManagement.exportExcel')}
      </Button>
    </div>
  );

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
          exportAction={exportAction}
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
          exportAction={exportAction}
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
          exportAction={exportAction}
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
            listClassName="flex w-full md:w-[75%] lg:w-[50%] gap-2 mb-5 px-1 flex-wrap"
            lazy={true}
            searchParamKey="tab"
          />
        </div>
      </div>
    </div>
  );
}
