import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import Card from '@gradex/shared/components/Card';
import EmptyState from '@gradex/shared/components/EmptyState';
import CustomSelect from '@gradex/shared/components/CustomSelect';
import { useTranslation } from 'react-i18next';
import schoolIcon from '@gradex/assets/icons/School.svg';
import RegisteredSchoolsTab from './RegisteredSchoolsTab';
import PendingSchoolsTab from './PendingSchoolsTab';
import DeletedSchoolsTab from './DeletedSchoolsTab';
import {
  fetchCountries,
  selectCountries,
  selectIsLoadingCountries,
} from '@gradex/redux/features/lookups';

export default function Schools() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState('RegisteredSchools');
  const [hasSchools] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicSystem, setAcademicSystem] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Get countries from Redux
  const countries = useSelector(selectCountries);
  const isLoadingCountries = useSelector(selectIsLoadingCountries);

  // Get current language
  const currentLang = i18n.language as 'ar' | 'en';

  // Fetch countries on component mount
  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  // Log countries when loaded
  useEffect(() => {
    if (countries.length > 0) {
      console.log('✅ Countries loaded:', countries.length, 'countries');
      console.log('📍 First country:', countries[0]);
    }
  }, [countries]);

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
                onClick={() => setActiveTab(tab.id)}
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
            <div className="mb-6 flex flex-wrap gap-4 lg:flex-nowrap">
              <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg xl:w-[60%]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('schools.searchBySchoolRegionDistrictName')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-[40px] w-full rounded-lg border border-gray-300 pl-4 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  >
                    <path
                      d="M11 1.25C5.61522 1.25 1.25 5.61522 1.25 11C1.25 16.3848 5.61522 20.75 11 20.75C13.4226 20.75 15.6366 19.8638 17.3418 18.4014L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L18.4023 17.3408C19.8643 15.6358 20.75 13.4221 20.75 11C20.75 5.61522 16.3848 1.25 11 1.25ZM11 2.75C15.5563 2.75 19.25 6.44365 19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75Z"
                      fill="#878F8F"
                    />
                  </svg>
                </div>
              </div>
              <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <select
                    value={academicSystem}
                    onChange={(e) => setAcademicSystem(e.target.value)}
                    className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">{t('schools.academicSystem')}</option>
                    <option value="1">حكومي</option>
                    <option value="2">خاص</option>
                    <option value="3">أهلي</option>
                  </select>
                </div>

                <div>
                  <CustomSelect
                    value={selectedCountry}
                    onChange={(value) => setSelectedCountry(value)}
                    options={countries.map((country) => ({
                      value: country.id,
                      label: currentLang === 'ar' ? country.arabicName : country.englishName,
                    }))}
                    placeholder={isLoadingCountries ? t('common.loading') : t('schools.country')}
                    disabled={isLoadingCountries}
                    maxHeight="200px"
                  />
                </div>

                {/* <div>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">{t('schools.region')}</option>
                    <option value="cairo">القاهرة</option>
                    <option value="riyadh">الرياض</option>
                  </select>
                </div> */}
                {/* <div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">{t('schools.district')}</option>
                    <option value="1">الشرقي</option>
                    <option value="2">الغربي</option>
                  </select>
                </div> */}
              </div>
            </div>

            <div className="overflow-x-auto">
              {activeTab === 'RegisteredSchools' && <RegisteredSchoolsTab />}
              {activeTab === 'PendingSchools' && <PendingSchoolsTab />}
              {activeTab === 'DeletedSchools' && <DeletedSchoolsTab />}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
