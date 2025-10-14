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
