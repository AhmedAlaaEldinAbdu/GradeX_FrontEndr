import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Card from '@gradex/shared/components/Card';
import DataTable, {
  type FilterConfig,
  type DataTableColumn,
} from '@gradex/shared/components/DataTable';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import DeletePopup from '@gradex/shared/components/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import type { Role } from '@gradex/services/api/types/roles.types';
import {
  fetchRoles,
  deleteRole,
  selectRoles,
  selectIsLoading,
  selectPagination,
} from '@gradex/redux/features/roles';

export default function RolesPermissions() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const roles = useSelector(selectRoles) || [];
  const isLoading = useSelector(selectIsLoading);
  const pagination = useSelector(selectPagination);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch roles with debounce when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(
        fetchRoles({
          page: 1,
          limit: 10,
          filters: searchTerm ? { searchTerm } : undefined,
        })
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, dispatch]);

  const handleDeleteConfirm = async () => {
    if (!selectedRoleId) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteRole(selectedRoleId)).unwrap();
      setShowDeletePopup(false);
      setSelectedRoleId(null);

      showToast({
        message: t('rolesManagement.roleDeleted'),
        type: 'success',
        duration: 3000,
      });

      // Refresh the roles list
      dispatch(
        fetchRoles({
          page: pagination.page,
          limit: pagination.limit,
          filters: searchTerm ? { searchTerm } : undefined,
        })
      );
    } catch (error) {
      console.error('Failed to delete role:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
  };

  const handlePageChange = (page: number) => {
    dispatch(
      fetchRoles({
        page,
        limit: 10,
        filters: searchTerm ? { searchTerm } : undefined,
      })
    );
  };

  // Define table columns
  const columns: DataTableColumn<Role>[] = [
    {
      header: '#',
      accessor: (_row) => {
        if (!_row || !Array.isArray(roles) || !pagination) return '-';
        const rowIndex = roles.findIndex((r) => r?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + rowIndex + 1;
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'rolesManagement.roleName',
      accessor: (row) => row.name,
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'rolesManagement.description',
      accessor: (row) => row.description || '-',
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`edit-role/${row.id}`}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" />
          </Link>
          <button
            onClick={() => {
              setSelectedRoleId(row.id);
              setShowDeletePopup(true);
            }}
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

  // Define filters configuration
  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'role-search',
      placeholder: t('rolesManagement.searchRole'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '40%',
    },
  ];

  return (
    <Card>
      <div>
        <DataTable
          data={roles}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={pagination}
          onPageChange={handlePageChange}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
          emptyMessage={t('rolesManagement.noRolesFound')}
          t={t}
        />

        {/* Delete Popup */}
        {showDeletePopup && (
          <DeletePopup
            message="rolesManagement.confirmDeleteRole"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </Card>
  );
}
