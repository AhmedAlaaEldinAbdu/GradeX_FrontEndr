import { useTranslation } from 'react-i18next';
import DropdownMenuAcademicSystemAction from './DropdownMenuAcademicSystemAction';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import AcademicIcon from '@gradex/assets/icons/Academic.svg';
import { useEffect, useState } from 'react';
import AcademicDetailsPopup from '../popups/AcademicSystemDetailsPopup';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getAcademicSystems } from '@/redux/features/academic-system/academicSystemSlice';
import { getAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import { fetchCountries } from '@/redux/features/lookups';
import type { AcademicSubSystemResponse } from '@/services/api/types/academic-system.types';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';

export default function AcademicSystemTab() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubSystemId, setSelectedSubSystemId] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [showAcademicDetails, setShowAcademicDetails] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<AcademicSubSystemResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Redux state
  const academicSystems = useAppSelector((state) => state.academicSystems.academicSystems);
  const pagination = useAppSelector((state) => state.academicSystems.pagination);
  const isLoading = useAppSelector((state) => state.academicSystems.isLoading);

  const academicSubSystems = useAppSelector((state) => state.academicSubSystems.academicSubSystems);
  const isLoadingSubSystems = useAppSelector((state) => state.academicSubSystems.isLoading);

  const countries = useAppSelector((state) => state.lookups.countries);
  const isLoadingCountries = useAppSelector((state) => state.lookups.isLoadingCountries);

  useEffect(() => {
    dispatch(getAcademicSubSystems());
    dispatch(fetchCountries());
  }, [dispatch]);

  useEffect(() => {
    fetchAcademicSystems();
  }, [currentPage, searchTerm, selectedSubSystemId, selectedCountryId]);

  const fetchAcademicSystems = () => {
    dispatch(
      getAcademicSystems({
        pageIndex: currentPage,
        pageSize,
        academicSubSystemName: undefined,
        ...(currentLang === 'ar'
          ? { nameAr: searchTerm || undefined }
          : { nameEn: searchTerm || undefined }),
        subsystemId: selectedSubSystemId || undefined,
        countryId: selectedCountryId || undefined,
      })
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSystemClick = (system: AcademicSubSystemResponse) => {
    setSelectedSystem(system);
    setShowAcademicDetails(true);
  };

  // Check if we have any filters or search active
  const hasActiveFilters = searchTerm || selectedSubSystemId || selectedCountryId;

  // Show empty state only when: not loading AND no data AND no active filters
  const shouldShowEmptyState = !isLoading && academicSystems.length === 0 && !hasActiveFilters;

  // Show content when: loading OR has data OR has active filters
  const shouldShowContent = isLoading || academicSystems.length > 0 || hasActiveFilters;

  const columns: DataTableColumn<AcademicSubSystemResponse>[] = [
    {
      header: '#',
      accessor: (_row) => {
        if (!_row || !Array.isArray(academicSystems) || !pagination) return '-';
        const index = academicSystems?.findIndex((s) => s?.id === _row?.id);
        return (pagination.pageIndex - 1) * pagination.pageSize + (index + 1);
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'academicSystem.systemName',
      accessor: (row) => (
        <div onClick={() => handleSystemClick(row)} className="cursor-pointer hover:text-green-600">
          {currentLang === 'ar' ? row.nameAr : row.nameEn}
        </div>
      ),
      headerClassName: 'min-w-[180px]',
    },
    {
      header: 'academicSystem.systemType',
      accessor: (row) => {
        const subSystemNames = row.academicSubSystemDto?.map((subSystem) =>
          currentLang === 'ar' ? subSystem.nameAr : subSystem.nameEn
        );

        return (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm">{subSystemNames?.join(' - ')}</span>
          </div>
        );
      },
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'academicSystem.countryName',
      accessor: (row) => {
        const countries = row.lkCountriesDto?.map((country) =>
          currentLang === 'ar' ? country.arabicName : country.englishName
        );

        return (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm">{countries?.join(' - ')}</span>
          </div>
        );
      },
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'academicSystem.educationalStagesCount',
      accessor: (row) => row.gradeCount,
      headerClassName: 'min-w-[280px]',
      className: 'text-center',
    },
    {
      header: 'academicSystem.addedDate',
      accessor: (row) => <div>{new Date(row.created).toLocaleDateString()}</div>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center">
          <DropdownMenuAcademicSystemAction id={row.id} onActionComplete={fetchAcademicSystems} />
        </div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchBySystemName',
      placeholder: t('academicSystem.searchBySystemName'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '60%',
    },
    {
      type: 'custom',
      name: 'subsystem-filter',
      placeholder: '',
      value: selectedSubSystemId,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedSubSystemId}
          onChange={(value) =>
            setSelectedSubSystemId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={
            Array.isArray(academicSubSystems)
              ? academicSubSystems.map((subSystem) => ({
                  value: subSystem?.id || '',
                  label: currentLang === 'ar' ? subSystem?.nameAr || '' : subSystem?.nameEn || '',
                }))
              : []
          }
          placeholder={isLoadingSubSystems ? t('common.loading') : t('academicSystem.systemType')}
          disabled={isLoadingSubSystems}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'country-filter',
      placeholder: '',
      value: selectedCountryId,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedCountryId}
          onChange={(value) =>
            setSelectedCountryId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={
            Array.isArray(countries)
              ? countries.map((country) => ({
                  value: country?.id || '',
                  label:
                    currentLang === 'ar' ? country?.arabicName || '' : country?.englishName || '',
                }))
              : []
          }
          placeholder={isLoadingCountries ? t('common.loading') : t('academicSystem.country')}
          disabled={isLoadingCountries}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubSystemId('');
    setSelectedCountryId('');
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={AcademicIcon}
          description={t('academicSystem.noAcademicSystemMessage')}
          blend={true}
        />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={academicSystems}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page: pagination.pageIndex,
              limit: pagination.pageSize,
              total: pagination.totalItems,
              totalPages: pagination.totalPages,
            }}
            onPageChange={handlePageChange}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            isLoading={isLoading}
            emptyMessage={t('common.noResults')}
            t={t}
          />

          <AcademicDetailsPopup
            open={showAcademicDetails && !!selectedSystem}
            system={selectedSystem!}
            onClose={() => setShowAcademicDetails(false)}
          />
        </div>
      ) : null}
    </Card>
  );
}
