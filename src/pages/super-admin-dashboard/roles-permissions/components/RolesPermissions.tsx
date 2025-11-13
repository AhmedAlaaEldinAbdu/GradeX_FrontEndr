import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import Card from '@gradex/shared/components/Card';
import { useTranslation } from 'react-i18next';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import DeletePopup from '@gradex/shared/components/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import RolesPermissionsTable from './RolesPermissionsTable';
import { fetchRoles, deleteRole, selectPagination } from '@gradex/redux/features/roles';
import SearchInput from '@/shared/components/SearchInput';

export default function RolesPermissions() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const pagination = useSelector(selectPagination);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<{ searchTerm?: string }>({});

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newFilters: { searchTerm?: string } = {};
      if (searchTerm) newFilters.searchTerm = searchTerm;
      setFilters(newFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleDeleteClick = (roleId: string) => {
    setSelectedRoleId(roleId);
    setShowDeletePopup(true);
  };

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

  return (
    <Card>
      <div>
        {/* Filters */}
        <div className="flex justify-between">
          <div className="mb-6 flex flex-1 flex-wrap gap-4 lg:flex-nowrap">
            <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg xl:w-[60%]">
              <div className="relative">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder={t('rolesManagement.searchRole')}
                  name="role-search"
                />
              </div>
            </div>

            <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg sm:grid-cols-2 xl:grid-cols-3"></div>
          </div>
          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchTerm('');
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

        {/* Table and Pagination */}
        <RolesPermissionsTable
          filters={filters}
          isDeleting={isDeleting}
          onDeleteClick={handleDeleteClick}
        />

        {/* Delete Popup */}
        {showDeletePopup && (
          <DeletePopup
            message="rolesManagement.confirmDeleteRole"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
          />
        )}
      </div>
    </Card>
  );
}
