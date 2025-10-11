import { useState } from 'react';
import Card from '@gradex/shared/components/Card';
import EmptyState from '@gradex/shared/components/EmptyState';
import Table from '@gradex/shared/components/Table';
import { useTranslation } from 'react-i18next';
import Pagination from '@gradex/shared/components/Pagination';
import EmployeesIcon from '@gradex/assets/icons/Employees.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import { Link } from 'react-router-dom';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import DeletePopup from '@gradex/shared/components/DeletePopup';
import PopupMessage from '@gradex/shared/components/PopupMessage';

interface User {
  id: number;
  userName: string;
  roleName: string;
  userPhone: string;
  userEmail: string;
}

export default function SystemUsers() {
  const { t } = useTranslation();
  const [hasUsers, setHasUsers] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleDeleteConfirm = () => {
    setShowDelete(false);
    setShowPopupMessage(true);
  };

  const roles: User[] = [
    {
      id: 1,
      userName: 'أحمد محمد ابراهيم',
      roleName: 'مشرف عام',
      userPhone: '+966 556831361',
      userEmail: 'Ahmed@gmail.com',
    },
    {
      id: 2,
      userName: 'عبدالكريم عزيز أحمد',
      roleName: 'مشرف عام',
      userPhone: '+966 556831361',
      userEmail: 'Ahmed@gmail.com',
    },
    {
      id: 3,
      userName: 'أحمد محمد ابراهيم',
      roleName: 'مشرف عام',
      userPhone: '+966 556831361',
      userEmail: 'Ahmed@gmail.com',
    },
    {
      id: 4,
      userName: 'عبدالكريم عزيز أحمد',
      roleName: 'مشرف عام',
      userPhone: '+966 556831361',
      userEmail: 'Ahmed@gmail.com',
    },
    {
      id: 5,
      userName: 'أحمد محمد ابراهيم',
      roleName: 'مشرف عام',
      userPhone: '+966 556831361',
      userEmail: 'Ahmed@gmail.com',
    },
    {
      id: 6,
      userName: 'عبدالكريم عزيز أحمد',
      roleName: 'مشرف عام',
      userPhone: '+966 556831361',
      userEmail: 'Ahmed@gmail.com',
    },
  ];

  const columns = [
    { header: '#', accessor: (row: User) => row.id },
    {
      header: 'rolesManagement.userName',
      accessor: (row: User) => row.userName,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'rolesManagement.roleName',
      accessor: (row: User) => row.roleName,
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'rolesManagement.phoneNumber',
      accessor: (row: User) => row.userPhone,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'rolesManagement.email',
      accessor: (row: User) => row.userEmail,
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
            onClick={() => setShowDelete(true)}
            className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
          >
            <img src={TrashIcon} alt="Trash" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[100px]',
    },
  ];

  return (
    <Card>
      {!hasUsers ? (
        <EmptyState
          imgSrc={EmployeesIcon}
          description={t('rolesManagement.noUsersMessage')}
          blend={true}
        />
      ) : (
        <div>
          <div className="mb-6 grid gap-3 lg:grid-cols-3">
            <div className="col-span-1">
              <input
                type="text"
                placeholder={t('rolesManagement.SearchUsername')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-[40px] w-full rounded-lg border border-gray-300 pl-4 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="col-span-1">
              <div className="lg:w-[75%] xl:w-[50%]">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t('rolesManagement.role')}</option>
                  <option value="1">مشرف عام</option>
                  <option value="2">مشرف عام</option>
                  <option value="3">مشرف عام</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table columns={columns} data={roles} keyExtractor={(row) => row.id} />
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={1}
            totalPages={2}
            to={6}
            from={1}
            onPageChange={() => console.log('change page')}
          />

          {/* Popups */}
          {showDelete && (
            <DeletePopup
              message="rolesManagement.confirmDeleteRole"
              onConfirm={handleDeleteConfirm}
              onCancel={() => setShowDelete(false)}
              iconSrc={BigTrashIcon}
            />
          )}
          {showPopupMessage && (
            <PopupMessage
              type="success"
              message="rolesManagement.userDeleted"
              iconSrc={BigSuccessIcon}
              autoClose={true}
              onClose={() => setShowPopupMessage(false)}
            />
          )}
        </div>
      )}
    </Card>
  );
}
