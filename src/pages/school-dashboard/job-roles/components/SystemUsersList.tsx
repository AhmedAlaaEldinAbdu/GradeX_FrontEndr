import { useState, useMemo } from 'react';
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
import { MOCK_SYSTEM_USERS, type MockSystemUser } from '../data/mockSystemUsers';

export default function SystemUsersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Dummy local data — replace with Redux/API on backend integration.
  const [users, setUsers] = useState<MockSystemUser[]>(MOCK_SYSTEM_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const limit = 10;

  const filteredUsers = useMemo(
    () =>
      searchTerm
        ? users.filter((u) => u.userName.toLowerCase().includes(searchTerm.toLowerCase()))
        : users,
    [users, searchTerm]
  );

  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pagedUsers = useMemo(
    () => filteredUsers.slice((page - 1) * limit, page * limit),
    [filteredUsers, page]
  );

  const hasActiveFilters = !!searchTerm;
  const shouldShowEmptyState = users.length === 0 && !hasActiveFilters;

  const columns: DataTableColumn<MockSystemUser>[] = [
    {
      header: '#',
      accessor: (row) => (page - 1) * limit + pagedUsers.findIndex((u) => u.id === row.id) + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'rolesManagement.role',
      accessor: (row) => <span>{row.role}</span>,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'rolesManagement.userName',
      accessor: (row) => <span>{row.userName}</span>,
      headerClassName: 'min-w-[300px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            onClick={() => navigate(`/settings/job-roles/edit-user/${row.id}`)}
            ariaLabel="Edit"
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedUserId(row.id);
              setShowDeletePopup(true);
            }}
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
      name: 'user-search',
      placeholder: t('rolesManagement.searchEmployee'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '40%',
    },
  ];

  const handleDeleteConfirm = () => {
    if (!selectedUserId) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
    setShowDeletePopup(false);
    setSelectedUserId(null);
    showToast({ message: 'rolesManagement.userDeleted', type: 'success' });
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={PeopleSupportIcon}
          description={t('rolesManagement.noUsersMessage')}
          blend={true}
        />
      ) : (
        <div>
          <DataTable
            data={pagedUsers}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{ page, limit, total, totalPages }}
            onPageChange={setPage}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={() => setSearchTerm('')}
            emptyMessage={t('common.noResults')}
            t={t}
          />

          <DeletePopup
            open={showDeletePopup}
            message="rolesManagement.confirmDeleteUser"
            itemName={users.find((u) => u.id === selectedUserId)?.userName ?? ''}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
          />
        </div>
      )}
    </Card>
  );
}
