import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import Table from '@gradex/shared/components/Table';
import { useTranslation } from 'react-i18next';
import Badge from '@gradex/shared/components/Badge';
import Pagination from '@gradex/shared/components/Pagination';
import DropdownMenuSchoolsAction from './DropdownMenuSchoolsAction';
import PhoneIcon from '@gradex/assets/icons/Phone.svg';
import EmailIcon from '@gradex/assets/icons/Email.svg';
import Loading from '@gradex/shared/components/Loading';
import {
  fetchRegisteredSchools,
  selectSchools,
  selectIsLoading,
  selectPagination,
  selectError,
} from '@gradex/redux/features/schools';
import { selectCountries } from '@gradex/redux/features/lookups';
import { selectAcademicSystems } from '@gradex/redux/features/academic-system';
import type { School } from '@gradex/services/api/types/school.types';
import { Link } from 'react-router-dom';

interface RegisteredSchoolsTabProps {
  filters?: {
    searchTerm?: string;
    academicSystemId?: string;
    lKCountryId?: string;
  };
}

export default function RegisteredSchoolsTab({ filters }: RegisteredSchoolsTabProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const schools = useSelector(selectSchools) || [];
  const isLoading = useSelector(selectIsLoading);
  const pagination = useSelector(selectPagination);
  const error = useSelector(selectError);
  const countries = useSelector(selectCountries) || [];
  const academicSystems = useSelector(selectAcademicSystems) || [];

  const currentLang = i18n.language as 'ar' | 'en';

  // Helper function to get country name by ID
  const getCountryName = (countryId: string): string => {
    if (!countryId || !Array.isArray(countries)) return '-';
    const country = countries.find((c) => c?.id === countryId);
    if (!country) return '-';
    return currentLang === 'ar' ? country.arabicName : country.englishName;
  };

  // Helper function to get academic system name by ID
  const getAcademicSystemName = (academicSystemId: string): string => {
    if (!academicSystemId || !Array.isArray(academicSystems)) return '-';
    const system = academicSystems.find((s) => s?.id === academicSystemId);
    if (!system) return '-';
    return system.name || '-';
  };

  // Fetch schools on mount and when filters change
  useEffect(() => {
    dispatch(
      fetchRegisteredSchools({
        page: pagination.page,
        limit: pagination.limit,
        filters,
      })
    );
  }, [dispatch, filters]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchRegisteredSchools({
        page,
        limit: pagination.limit,
        filters,
      })
    );
  };

  const getStatusBadge = (schoolStatus: number) => {
    const statusConfig: Record<
      number,
      { variant: 'success' | 'warning' | 'danger'; label: string }
    > = {
      1: { variant: 'success', label: 'common.approved' },
      2: { variant: 'warning', label: 'common.inactive' },
    };

    const config = statusConfig[schoolStatus] || { variant: 'success', label: 'common.approved' };

    return (
      <Badge variant={config.variant} size="lg">
        {t(config.label)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-600">
        {t('common.error')}: {error}
      </div>
    );
  }

  const columns = [
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
      accessor: (row: School) => (
        <Link to={`/schools/view-school/${row?.id}`}>{row?.name || '-'}</Link>
      ),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.educationSystem',
      accessor: (row: School) => {
        // Get academic system name by academicSystemId
        if (row?.academicSystemId) {
          return getAcademicSystemName(row.academicSystemId);
        }
        return '-';
      },
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.status',
      accessor: (row: School) => {
        if (!row || row.schoolStatus === undefined) return '-';
        return getStatusBadge(row.schoolStatus);
      },
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
      accessor: (row: School) => (
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
      ),
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'common.actions',
      accessor: (row: School) => {
        if (!row || !row.id) return null;
        return (
          <DropdownMenuSchoolsAction
            id={row.id}
            selectedTab={1}
            onActionComplete={() => {
              // Refresh the registered schools list
              dispatch(
                fetchRegisteredSchools({
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
      sticky: false,
    },
  ];

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        {!Array.isArray(schools) || schools.length === 0 ? (
          <div className="py-10 text-center text-gray-500">{t('schools.noSchoolsFound')}</div>
        ) : (
          <Table columns={columns} data={schools} keyExtractor={(row) => row?.id || ''} />
        )}
      </div>

      {/* Pagination */}
      {Array.isArray(schools) && schools.length > 0 && pagination && (
        <Pagination
          currentPage={pagination.page || 1}
          totalPages={pagination.totalPages || 0}
          to={(pagination.page - 1) * pagination.limit + schools.length}
          from={(pagination.page - 1) * pagination.limit + 1}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
