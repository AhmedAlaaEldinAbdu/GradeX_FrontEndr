import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import Card from '@gradex/shared/components/Card';
import Table from '@gradex/shared/components/Table';
import { useTranslation } from 'react-i18next';
import Pagination from '@gradex/shared/components/Pagination';
import Loading from '@gradex/shared/components/Loading';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import DeletePopup from '@gradex/shared/components/DeletePopup';
import { Link } from 'react-router-dom';
import { useToast } from '@/shared/context/ToastContext';
import {
  fetchUsers,
  deleteUser,
  selectUsers,
  selectUsersLoading,
  selectPagination,
} from '@gradex/redux/features/user-management';
import {
  fetchRoles,
  selectRoles,
  selectIsLoading as selectIsLoadingRoles,
} from '@gradex/redux/features/roles';
import { fetchCountries } from '@gradex/redux/features/lookups';
import type { User } from '@gradex/services/api/types/users.types';

export default function SystemUsers() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const users = useSelector(selectUsers) || [];
  const isLoading = useSelector(selectUsersLoading);
  const pagination = useSelector(selectPagination);
  const roles = useSelector(selectRoles) || [];
  const isLoadingRoles = useSelector(selectIsLoadingRoles);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(
      fetchUsers({
        page: 1,
        limit: 10,
      })
    );
    dispatch(
      fetchRoles({
        page: 1,
        limit: 1000,
      })
    );
    dispatch(fetchCountries());
  }, [dispatch]);

  // Handle search and role filter with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: Record<string, string> = {};
      if (searchTerm) filters.searchTerm = searchTerm;
      if (selectedRole) filters.roleId = selectedRole;

      dispatch(
        fetchUsers({
          page: 1,
          limit: pagination.limit,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        })
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedRole, dispatch, pagination.limit]);

  const handlePageChange = (page: number) => {
    const filters: Record<string, string> = {};
    if (searchTerm) filters.searchTerm = searchTerm;
    if (selectedRole) filters.roleId = selectedRole;

    dispatch(
      fetchUsers({
        page,
        limit: pagination.limit,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      })
    );
  };

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteUser(selectedUserId)).unwrap();
      setShowDeletePopup(false);
      setSelectedUserId(null);

      showToast({
        message: t('rolesManagement.userDeleted'),
        type: 'success',
        duration: 3000,
      });

      // Refresh the users list
      const filters: Record<string, string> = {};
      if (searchTerm) filters.searchTerm = searchTerm;
      if (selectedRole) filters.roleId = selectedRole;

      dispatch(
        fetchUsers({
          page: pagination.page,
          limit: pagination.limit,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        })
      );
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { header: '#', accessor: (_row: User, index?: number) => (index ?? 0) + 1 },
    {
      header: 'rolesManagement.userName',
      accessor: (row: User) => row.fullName,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'rolesManagement.roleName',
      accessor: (row: User) => (row.roles && row.roles.length > 0 ? row.roles.join(', ') : '-'),
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'rolesManagement.phoneNumber',
      accessor: (row: User) => row.phoneNumber || '-',
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'rolesManagement.email',
      accessor: (row: User) => row.email,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'common.actions',
      accessor: (row: User) => (
        <div className="flex items-center gap-2">
          <Link
            to={`edit-user/${row.id}`}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" />
          </Link>
          <button
            onClick={() => handleDeleteClick(row.id)}
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
    <Card>
      {isLoading && users.length === 0 ? (
        <Loading />
      ) : (
        <div>
          {/* Filters */}
          <div className="flex justify-between">
            <div className="mb-6 flex flex-1 flex-wrap gap-4 lg:flex-nowrap">
              <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg xl:w-[60%]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('rolesManagement.SearchUsername')}
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
                <div className="min-w-[200px]">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isLoadingRoles}
                  >
                    <option value="">
                      {isLoadingRoles ? t('common.loading') : t('rolesManagement.role')}
                    </option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('');
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

          {/* Table */}
          <div className="overflow-x-auto">
            {!Array.isArray(users) || users.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                {t('rolesManagement.noUsersFound')}
              </div>
            ) : (
              <Table columns={columns} data={users} keyExtractor={(row) => row.id} />
            )}
          </div>

          {/* Pagination */}
          {Array.isArray(users) && users.length > 0 && pagination && pagination.totalPages > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              to={Math.min(pagination.page * pagination.limit, pagination.total)}
              from={(pagination.page - 1) * pagination.limit + 1}
              onPageChange={handlePageChange}
            />
          )}

          {/* Delete Popup */}
          {showDeletePopup && (
            <DeletePopup
              message="rolesManagement.confirmDeleteUser"
              onConfirm={handleDeleteConfirm}
              onCancel={() => setShowDeletePopup(false)}
              iconSrc={BigTrashIcon}
            />
          )}
        </div>
      )}
    </Card>
  );
}
