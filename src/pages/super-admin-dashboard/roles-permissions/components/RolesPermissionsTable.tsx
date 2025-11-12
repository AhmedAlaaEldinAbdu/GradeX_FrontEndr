import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Table from '@gradex/shared/components/Table';
import Pagination from '@gradex/shared/components/Pagination';
import Loading from '@gradex/shared/components/Loading';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import type { Role } from '@gradex/services/api/types/roles.types';
import {
  fetchRoles,
  selectRoles,
  selectIsLoading,
  selectPagination,
} from '@gradex/redux/features/roles';

interface RolesPermissionsTableProps {
  filters?: {
    searchTerm?: string;
  };
  isDeleting: boolean;
  onDeleteClick: (roleId: string) => void;
}

export default function RolesPermissionsTable({
  filters,
  isDeleting,
  onDeleteClick,
}: RolesPermissionsTableProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const roles = useSelector(selectRoles) || [];
  const isLoading = useSelector(selectIsLoading);
  const pagination = useSelector(selectPagination);

  // Fetch roles on mount and when filters change
  useEffect(() => {
    dispatch(
      fetchRoles({
        page: 1,
        limit: 10,
        filters: filters?.searchTerm ? { searchTerm: filters.searchTerm } : undefined,
      })
    );
  }, [dispatch, filters]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchRoles({
        page,
        limit: pagination.limit,
        filters: filters?.searchTerm ? { searchTerm: filters.searchTerm } : undefined,
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loading />
      </div>
    );
  }

  const columns = [
    {
      header: '#',
      accessor: (_row: Role) => {
        if (!_row || !Array.isArray(roles) || !pagination) return '-';
        const index = roles.findIndex((s) => s?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + index + 1;
      },
    },
    {
      header: 'rolesManagement.roleName',
      accessor: (row: Role) => row.name,
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'rolesManagement.description',
      accessor: (row: Role) => row.description || '-',
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'common.actions',
      accessor: (row: Role) => (
        <div className="flex items-center gap-2">
          <Link
            to={`edit-role/${row.id}`}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" />
          </Link>
          <button
            onClick={() => onDeleteClick(row.id)}
            disabled={isDeleting}
            className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <img src={TrashIcon} alt="Delete" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[100px]',
    },
  ];

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto">
        {!Array.isArray(roles) || roles.length === 0 ? (
          <div className="py-10 text-center text-gray-500">{t('rolesManagement.noRolesFound')}</div>
        ) : (
          <Table columns={columns} data={roles} keyExtractor={(row) => row.id} />
        )}
      </div>

      {/* Pagination */}
      {Array.isArray(roles) && roles.length > 0 && pagination && pagination.totalPages > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          to={Math.min(pagination.page * pagination.limit, pagination.total)}
          from={(pagination.page - 1) * pagination.limit + 1}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
