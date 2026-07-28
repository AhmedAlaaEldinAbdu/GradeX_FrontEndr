import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import DataTable, { type DataTableColumn } from '@gradex/shared/components/DataTable';
import { useTranslation } from 'react-i18next';
import Badge from '@gradex/shared/components/Badge';
import DropdownMenuSchoolsAction from './DropdownMenuSchoolsAction';
import WhatsAppIcon from '@gradex/assets/icons/WhatsApp.svg';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';
import {
  fetchRegisteredSchools,
  selectSchools,
  selectIsLoading,
  selectPagination,
  selectError,
  selectCurrentTabType,
} from '@gradex/redux/features/schools';
import { selectCountries } from '@gradex/redux/features/lookups';
import { selectAcademicSystems } from '@gradex/redux/features/academic-system';
import type { School } from '@gradex/services/api/types/school.types';
import { Link } from 'react-router-dom';
import Card from '@/shared/components/Card';
import EmptyState from '@gradex/shared/components/EmptyState';
import schoolIcon from '@gradex/assets/icons/School.svg';
import CustomImage from '@/shared/components/CustomImage';

import { type FilterConfig } from '@gradex/shared/components/DataTable';

interface RegisteredSchoolsTabProps {
  filters?: {
    searchTerm?: string;
    academicSystemId?: string;
    lKCountryId?: string;
    region?: string;
    neighborhood?: string;
  };
  filterConfigs?: FilterConfig[];
  onResetFilters?: () => void;
  isActive?: boolean;
  exportAction?: ReactNode;
}

export default function RegisteredSchoolsTab({
  filters,
  filterConfigs,
  onResetFilters,
  isActive = true,
  exportAction,
}: RegisteredSchoolsTabProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const allSchools = useSelector(selectSchools) || [];
  const currentTabType = useSelector(selectCurrentTabType);
  const isDataForThisTab = currentTabType === 'registered';
  const schools = isDataForThisTab ? allSchools : [];
  const [hasSchools] = useState(true); // TODO Need to implement actual check
  const reduxIsLoading = useSelector(selectIsLoading);
  const isLoading = reduxIsLoading || !isDataForThisTab;
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
    return system.nameAr || '-';
  };

  // Track abort controller for cancelling pending requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch schools on mount and when filters change
  useEffect(() => {
    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!isActive) return;

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const fetchData = async () => {
      try {
        await dispatch(
          fetchRegisteredSchools({
            page: pagination.page,
            limit: pagination.limit,
            filters,
          })
        ).unwrap();
      } catch {
        // Ignore abort errors
      }
    };

    fetchData();

    // Cleanup: abort request when dependencies change or component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dispatch, filters, pagination.page, pagination.limit, isActive]);

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
        return (
          <Link
            to={`/schools/view-school/${row?.id}`}
            className="cursor-pointer hover:text-green-600"
          >
            {schoolName}
          </Link>
        );
      },
      headerClassName: 'min-w-[160px]',
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
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'schools.status',
      accessor: (row: School) => {
        if (!row || row.schoolStatus === undefined) return '-';
        return getStatusBadge(row.schoolStatus);
      },
      headerClassName: 'min-w-[160px]',
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
      headerClassName: 'min-w-[160px]',
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
      headerClassName: 'min-w-[160px]',
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
      headerClassName: 'min-w-[120px]',
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
      headerClassName: 'min-w-[130px]',
    },
    {
      header: 'schools.contactMethods',
      accessor: (row: School) => (
        <div className="flex items-center justify-center gap-3">
          {row?.phoneNumber && (
            <a
              href={`tel:${row.phoneNumber}`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-lightGreen-100 hover:bg-green-200"
            >
              <CustomImage src={WhatsAppIcon} alt="Phone" className="h-6 w-6" />
            </a>
          )}
          {row?.email && (
            <a
              href={`mailto:${row.email}`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-yellow-100 hover:bg-orange-200"
            >
              <CustomImage src={EmailYellowIcon} alt="Email" className="h-6 w-6" />
            </a>
          )}
        </div>
      ),
      headerClassName: 'min-w-[180px]',
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

  if (!hasSchools) {
    return (
      <Card>
        <EmptyState imgSrc={schoolIcon} description={t('schools.noSchoolsMessage')} blend={true} />
      </Card>
    );
  }

  return (
    <Card>
      <DataTable
        data={schools}
        columns={columns}
        keyExtractor={(row) => row?.id || ''}
        pagination={pagination}
        onPageChange={handlePageChange}
        showFilters={true}
        filters={filterConfigs}
        onResetFilters={onResetFilters}
        bulkActions={exportAction}
        isLoading={isLoading}
        emptyMessage={t('schools.noSchoolsFound')}
        t={t}
      />
    </Card>
  );
}
