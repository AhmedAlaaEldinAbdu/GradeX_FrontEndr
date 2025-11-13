import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import Card from '@gradex/shared/components/Card';
import EmptyState from '@gradex/shared/components/EmptyState';
import CustomSelect from '@gradex/shared/components/CustomSelect';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/utils/logger';
import schoolIcon from '@gradex/assets/icons/School.svg';
import RegisteredSchoolsTab from './RegisteredSchoolsTab';
import PendingSchoolsTab from './PendingSchoolsTab';
import DeletedSchoolsTab from './DeletedSchoolsTab';
import {
  fetchCountries,
  selectCountries,
  selectIsLoadingCountries,
} from '@gradex/redux/features/lookups';
import {
  getAcademicSystems,
  selectAcademicSystems,
  selectIsLoadingAcademicSystems,
} from '@gradex/redux/features/academic-system';
import { resetPagination } from '@gradex/redux/features/schools';
import SearchInput from '@/shared/components/SearchInput';

export default function Schools() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState('RegisteredSchools');
  const [hasSchools] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicSystem, setAcademicSystem] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Get countries from Redux
  const countries = useSelector(selectCountries) || [];
  const isLoadingCountries = useSelector(selectIsLoadingCountries);

  // Get academic systems from Redux
  const academicSystems = useSelector(selectAcademicSystems) || [];
  const isLoadingAcademicSystems = useSelector(selectIsLoadingAcademicSystems);

  // Get current language
  const currentLang = i18n.language as 'ar' | 'en';

  // Fetch countries and academic systems on component mount
  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getAcademicSystems({ pageIndex: 1, pageSize: 100 }));
  }, [dispatch]);

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
    // Reset filters first
    setSearchTerm('');
    setAcademicSystem('');
    setSelectedCountry('');
    dispatch(resetPagination());
    setActiveTab(tabId);
  };

  const tabs = [
    { id: 'RegisteredSchools', label: 'schools.registeredSchools' },
    { id: 'PendingSchools', label: 'schools.pendingSchools' },
    { id: 'DeletedSchools', label: 'schools.deletedSchools' },
  ];

  return (
    <>
      {hasSchools && (
        <div className="mb-5 w-full max-w-lg px-1">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-2 text-center font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-green-500'
                }`}
              >
                {t(tab.label)}
              </button>
            ))}
          </div>
        </div>
      )}
      <Card>
        {!hasSchools ? (
          <EmptyState
            imgSrc={schoolIcon}
            description={t('schools.noSchoolsMessage')}
            blend={true}
          />
        ) : (
          <div>
            {/* Filters */}
            <div className="flex justify-between">
              <div className="mb-6 flex flex-1 flex-wrap gap-4 lg:flex-nowrap">
                <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg xl:w-[60%]">
                  <div className="relative">
                    <SearchInput
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder={t('schools.searchBySchoolRegionDistrictName')}
                      name="school-search"
                    />
                  </div>
                </div>
                <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <CustomSelect
                      value={academicSystem}
                      onChange={(value) =>
                        setAcademicSystem(Array.isArray(value) ? (value[0] ?? '') : value)
                      }
                      options={
                        Array.isArray(academicSystems)
                          ? academicSystems.map((system) => ({
                              value: system.id,
                              label: system.nameAr,
                            }))
                          : []
                      }
                      placeholder={
                        isLoadingAcademicSystems ? t('common.loading') : t('schools.academicSystem')
                      }
                      disabled={isLoadingAcademicSystems}
                      maxHeight="200px"
                    />
                  </div>

                  <div>
                    <CustomSelect
                      value={selectedCountry}
                      onChange={(value) =>
                        setSelectedCountry(Array.isArray(value) ? (value[0] ?? '') : value)
                      }
                      options={
                        Array.isArray(countries)
                          ? countries.map((country) => ({
                              value: country?.id || '',
                              label:
                                currentLang === 'ar'
                                  ? country?.arabicName || ''
                                  : country?.englishName || '',
                            }))
                          : []
                      }
                      placeholder={isLoadingCountries ? t('common.loading') : t('schools.country')}
                      disabled={isLoadingCountries}
                      maxHeight="200px"
                    />
                  </div>
                </div>
              </div>
              <div>
                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setAcademicSystem('');
                    setSelectedCountry('');
                  }}
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  title={t('actions.clearFilter')}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className=""
                    aria-hidden="true"
                  >
                    <path
                      d="M21 12a9 9 0 1 0-3.46 6.54"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 3v6h-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {activeTab === 'RegisteredSchools' && (
                <RegisteredSchoolsTab
                  filters={{
                    searchTerm: searchTerm || undefined,
                    academicSystemId: academicSystem || undefined,
                    lKCountryId: selectedCountry || undefined,
                  }}
                />
              )}
              {activeTab === 'PendingSchools' && (
                <PendingSchoolsTab
                  filters={{
                    searchTerm: searchTerm || undefined,
                    academicSystemId: academicSystem || undefined,
                    lKCountryId: selectedCountry || undefined,
                  }}
                />
              )}
              {activeTab === 'DeletedSchools' && (
                <DeletedSchoolsTab
                  filters={{
                    searchTerm: searchTerm || undefined,
                    academicSystemId: academicSystem || undefined,
                    lKCountryId: selectedCountry || undefined,
                  }}
                />
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
