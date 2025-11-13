import { useEffect, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import DataTable, { type DataTableColumn } from '@gradex/shared/components/DataTable';
import { useTranslation } from 'react-i18next';
import Badge from '@gradex/shared/components/Badge';
import DropdownMenuSchoolsAction from './DropdownMenuSchoolsAction';
import PhoneIcon from '@gradex/assets/icons/Phone.svg';
import EmailIcon from '@gradex/assets/icons/Email.svg';
import {
  fetchDeletedSchools,
  selectSchools,
  selectIsLoading,
  selectPagination,
  selectError,
} from '@gradex/redux/features/schools';
import { selectCountries } from '@gradex/redux/features/lookups';
import { selectAcademicSystems } from '@gradex/redux/features/academic-system';
import type { School } from '@gradex/services/api/types/school.types';
import { Link } from 'react-router-dom';

interface DeletedSchoolsTabProps {
  filters?: {
    searchTerm?: string;
    academicSystemId?: string;
    lKCountryId?: string;
  };
  filterComponent?: ReactNode;
}

export default function DeletedSchoolsTab({ filters, filterComponent }: DeletedSchoolsTabProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const schools = useSelector(selectSchools) || [];
  const isLoading = useSelector(selectIsLoading);
  const pagination = useSelector(selectPagination);
  const error = useSelector(selectError);
  const countries = useSelector(selectCountries) || [];
  const academicSystems = useSelector(selectAcademicSystems) || [];

  const currentLang = i18n.language as 'ar' | 'en';

  // Helper function to get country name from country ID
  const getCountryName = (countryId: string): string => {
    if (!countryId || !Array.isArray(countries)) return '-';
    const country = countries.find((c) => c?.id === countryId);
    if (!country) return '-';
    return currentLang === 'ar' ? country.arabicName : country.englishName;
  };

  const getAcademicSystemName = (academicSystemId: string): string => {
    if (!academicSystemId || !Array.isArray(academicSystems)) return '-';
    const system = academicSystems.find((s) => s?.id === academicSystemId);
    if (!system) return '-';
    return system.nameAr || '-';
  };

  // Fetch schools on mount and when filters change
  useEffect(() => {
    dispatch(
      fetchDeletedSchools({
        page: pagination.page,
        limit: pagination.limit,
        filters,
      })
    );
  }, [dispatch, filters, pagination.page, pagination.limit]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchDeletedSchools({
        page,
        limit: pagination.limit,
        filters,
      })
    );
  };

  if (error) {
    return (
      <div className="py-10 text-center text-red-600">
        {t('common.error')}: {error}
      </div>
    );
  }

  const columns: DataTableColumn<School>[] = [
    {
      header: '#',
      accessor: (_row: School) => {
        if (!_row || !Array.isArray(schools) || !pagination) return '-';
        const index = schools.findIndex((s) => s?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + index + 1;
      },
    },
    {
      header: 'schools.schoolName',
      accessor: (row: School) => {
        const schoolName =
          currentLang === 'ar' ? row?.nameAr || row?.name || '-' : row?.nameEn || row?.name || '-';
        return <Link to={`/schools/view-school/${row?.id}`}>{schoolName}</Link>;
      },
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.educationSystem',
      accessor: (row: School) => {
        if (row?.academicSystemId) {
          return getAcademicSystemName(row.academicSystemId);
        }
        return '-';
      },
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.status',
      accessor: () => (
        <Badge variant="danger" size="lg">
          {t('common.rejected')}
        </Badge>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'schools.country',
      accessor: (row: School) => {
        if (!row) return '-';
        // Get country name from school branches
        const countryId =
          row?.schoolBranches && Array.isArray(row.schoolBranches) && row.schoolBranches.length > 0
            ? row.schoolBranches[0]?.lkCountryId
            : null;
        return countryId ? getCountryName(countryId) : '-';
      },
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.region',
      accessor: (row: School) => {
        if (!row) return '-';
        const region =
          row?.schoolBranches && Array.isArray(row.schoolBranches) && row.schoolBranches.length > 0
            ? row.schoolBranches[0]?.region || '-'
            : '-';
        return region;
      },
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.district',
      accessor: (row: School) => {
        if (!row) return '-';
        const neighborhood =
          row?.schoolBranches && Array.isArray(row.schoolBranches) && row.schoolBranches.length > 0
            ? row.schoolBranches[0]?.neighborhood || '-'
            : '-';
        return neighborhood;
      },
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'schools.addedDate',
      accessor: (row: School) => {
        if (!row?.foundingDate) return '-';
        try {
          const date = new Date(row.foundingDate);
          return date.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US');
        } catch {
          return '-';
        }
      },
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'schools.contactMethods',
      accessor: (row: School) => {
        if (!row) return null;
        return (
          <div className="flex items-center justify-center gap-3">
            {row?.email && (
              <a href={`mailto:${row.email}`} className="cursor-pointer">
                <img src={EmailIcon} alt="EmailIcon" className="h-[24px] w-[24px]" />
              </a>
            )}
            {row?.phoneNumber && (
              <a href={`tel:${row.phoneNumber}`} className="cursor-pointer">
                <img src={PhoneIcon} alt="PhoneIcon" className="h-[24px] w-[24px]" />
              </a>
            )}
          </div>
        );
      },
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'common.actions',
      accessor: (row: School) => {
        if (!row || !row.id) return null;
        return (
          <DropdownMenuSchoolsAction
            id={row.id}
            selectedTab={3}
            onActionComplete={() => {
              // Refresh the deleted schools list
              dispatch(
                fetchDeletedSchools({
                  page: pagination.page,
                  limit: pagination.limit,
                  filters,
                })
              );
            }}
          />
        );
      },
      headerClassName: 'min-w-[100px]',
    },
  ];

  return (
    <DataTable
      data={schools}
      columns={columns}
      keyExtractor={(row) => row?.id || ''}
      pagination={pagination}
      onPageChange={handlePageChange}
      showFilters={true}
      filterComponent={filterComponent}
      isLoading={isLoading}
      emptyMessage={t('schools.noSchoolsFound')}
      t={t}
    />
  );
}
