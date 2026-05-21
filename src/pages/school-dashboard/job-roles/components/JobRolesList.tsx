import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import PeopleSupportIcon from '@/assets/icons/PeopleSupport.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchAllRoles, deleteRole as deleteRoleAction } from '@/redux/features/roles/rolesSlice';
import type { Role } from '@/services/api/types/roles.types';

export default function JobRolesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const roles = useAppSelector((state) => state.roles.roles);
  const isLoading = useAppSelector((state) => state.roles.isLoading);
  const isDeleting = useAppSelector((state) => state.roles.isDeleting);
  const isInitialized = useAppSelector((state) => state.roles.isInitialized);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const limit = 10;

  useEffect(() => {
    dispatch(fetchAllRoles());
  }, [dispatch]);

  const filteredRoles = useMemo(
    () =>
      searchTerm
        ? roles.filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : roles,
    [roles, searchTerm]
  );

  const total = filteredRoles.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pagedRoles = useMemo(
    () => filteredRoles.slice((page - 1) * limit, page * limit),
    [filteredRoles, page]
  );

  const hasActiveFilters = !!searchTerm;
  const shouldShowEmptyState =
    !isLoading && isInitialized && roles.length === 0 && !hasActiveFilters;

  const columns: DataTableColumn<Role>[] = [
    {
      header: '#',
      accessor: (row) => (page - 1) * limit + pagedRoles.findIndex((r) => r.id === row.id) + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'rolesManagement.role',
      accessor: (row) => <span>{row.name}</span>,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'rolesManagement.description',
      accessor: (row) => <span>{row.description ?? '-'}</span>,
      headerClassName: 'min-w-[300px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            onClick={() => navigate(`/settings/job-roles/edit-role/${row.id}`)}
            ariaLabel="Edit"
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedRoleId(row.id);
              setShowDeletePopup(true);
            }}
            disabled={isDeleting}
            ariaLabel="Delete"
          />
        </div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'role-search',
      placeholder: t('rolesManagement.searchRole'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '40%',
    },
  ];

  const handleDeleteConfirm = async () => {
    if (!selectedRoleId) return;
    try {
      await dispatch(deleteRoleAction(selectedRoleId)).unwrap();
      showToast({ message: 'rolesManagement.roleDeleted', type: 'success' });
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'common.errorOccurred';
      const isApiError = typeof error === 'string' && error !== 'common.errorOccurred';
      showToast({ message: errorMessage, type: 'error', isRaw: isApiError });
    } finally {
      setShowDeletePopup(false);
      setSelectedRoleId(null);
    }
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={PeopleSupportIcon}
          description={t('rolesManagement.noRolesMessage')}
          blend={true}
        />
      ) : (
        <div>
          <DataTable
            data={pagedRoles}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{ page, limit, total, totalPages }}
            onPageChange={setPage}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={() => setSearchTerm('')}
            isLoading={isLoading}
            emptyMessage={t('common.noResults')}
            t={t}
          />

          <DeletePopup
            open={showDeletePopup}
            message="rolesManagement.confirmDeleteRole"
            itemName={roles.find((r) => r.id === selectedRoleId)?.name ?? ''}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isProcessing={isDeleting}
          />
        </div>
      )}
    </Card>
  );
}
