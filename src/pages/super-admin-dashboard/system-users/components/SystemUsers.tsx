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
import type { User } from '@gradex/services/api/types/users.types';
import {
  fetchUsers,
  deleteUser,
  selectUsers,
  selectIsLoading,
  selectPagination,
  selectIsDeleting,
} from '@gradex/redux/features/user-management';
import {
  fetchRoles,
  selectRoles,
  selectIsLoading as selectIsLoadingRoles,
} from '@gradex/redux/features/roles';
import { fetchCountries } from '@gradex/redux/features/lookups';
import CustomSelect from '@/shared/components/CustomSelect';

export default function SystemUsers() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const users = useSelector(selectUsers) || [];
  const isLoading = useSelector(selectIsLoading);
  const pagination = useSelector(selectPagination);
  const roles = useSelector(selectRoles) || [];
  const isLoadingRoles = useSelector(selectIsLoadingRoles);
  const isDeleting = useSelector(selectIsDeleting);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch roles and countries on mount
  useEffect(() => {
    dispatch(
      fetchRoles({
        page: 1,
        limit: 1000,
      })
    );
    dispatch(fetchCountries());
  }, [dispatch]);

  // Fetch users with debounce when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtersObj: Record<string, string> = {};
      if (searchTerm) filtersObj.searchTerm = searchTerm;
      if (selectedRole) filtersObj.roleId = selectedRole;

      dispatch(
        fetchUsers({
          page: 1,
          limit: 10,
          filters: Object.keys(filtersObj).length > 0 ? filtersObj : undefined,
        })
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedRole, dispatch]);

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;

    try {
      await dispatch(deleteUser(selectedUserId)).unwrap();
      setShowDeletePopup(false);
      setSelectedUserId(null);

      showToast({
        message: t('rolesManagement.userDeleted'),
        type: 'success',
        duration: 3000,
      });

      // Refresh the users list
      const filtersObj: Record<string, string> = {};
      if (searchTerm) filtersObj.searchTerm = searchTerm;
      if (selectedRole) filtersObj.roleId = selectedRole;

      dispatch(
        fetchUsers({
          page: pagination.page,
          limit: pagination.limit,
          filters: Object.keys(filtersObj).length > 0 ? filtersObj : undefined,
        })
      );
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
  };

  const handlePageChange = (page: number) => {
    const filtersObj: Record<string, string> = {};
    if (searchTerm) filtersObj.searchTerm = searchTerm;
    if (selectedRole) filtersObj.roleId = selectedRole;

    dispatch(
      fetchUsers({
        page,
        limit: 10,
        filters: Object.keys(filtersObj).length > 0 ? filtersObj : undefined,
      })
    );
  };

  // Define table columns
  const columns: DataTableColumn<User>[] = [
    {
      header: '#',
      accessor: (_row) => {
        if (!_row || !Array.isArray(users) || !pagination) return '-';
        const rowIndex = users.findIndex((u) => u?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + rowIndex + 1;
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'rolesManagement.userName',
      accessor: (row) => row.fullName,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'rolesManagement.roleName',
      accessor: (row) => (row.roles && row.roles.length > 0 ? row.roles.join(', ') : '-'),
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'rolesManagement.phoneNumber',
      accessor: (row) => <bdi>{row.phoneNumber || '-'}</bdi>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'rolesManagement.email',
      accessor: (row) => row.email,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`edit-user/${row.id}`}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" />
          </Link>
          <button
            onClick={() => {
              setSelectedUserId(row.id);
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
      name: 'user-search',
      placeholder: t('rolesManagement.SearchUsername'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '60%',
    },
    {
      type: 'custom',
      name: 'role-filter',
      placeholder: '',
      value: selectedRole,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedRole}
          onChange={(value) => setSelectedRole(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={
            Array.isArray(roles)
              ? roles.map((role) => ({
                  value: role?.id || '',
                  label: role?.name || '',
                }))
              : []
          }
          placeholder={isLoadingRoles ? t('common.loading') : t('rolesManagement.role')}
          disabled={isLoadingRoles}
          maxHeight="200px"
        />
      ),
    },
  ];

  return (
    <Card>
      <div>
        <DataTable
          data={users}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={pagination}
          onPageChange={handlePageChange}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
          emptyMessage={t('rolesManagement.noUsersFound')}
          t={t}
        />

        {/* Delete Popup */}
        <DeletePopup
          open={showDeletePopup}
          message="rolesManagement.confirmDeleteUser"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeletePopup(false)}
          iconSrc={BigTrashIcon}
          isProcessing={isDeleting}
        />
      </div>
    </Card>
  );
}
