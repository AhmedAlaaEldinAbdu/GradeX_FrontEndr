import { t } from 'i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Permission {
  id: string;
  label: string;
  parentControl?: boolean;
}

interface PermissionGroup {
  id: string;
  permissions: Permission[];
}

const permissionGroups: PermissionGroup[] = [
  {
    id: 'first',
    permissions: [
      {
        id: 'education-systems',
        label: 'rolesManagement.educationalSystemPermissions',
        parentControl: true,
      },
      { id: 'add-school', label: 'إضافة المدارس' },
      { id: 'approve-school', label: 'قبول المدارس' },
      { id: 'edit-school', label: 'تعديل المدارس' },
      { id: 'delete-school', label: 'حذف المدارس' },
    ],
  },
  {
    id: 'second',
    permissions: [
      {
        id: 'education-management',
        label: 'rolesManagement.educationalSystemPermissions',
        parentControl: true,
      },
      { id: 'add-system', label: 'إضافة أنظمة تعليمية' },
      { id: 'edit-system', label: 'تعديل أنظمة تعليمية' },
      { id: 'delete-system', label: 'حذف أنظمة تعليمية' },
    ],
  },
];

export default function EditUser() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ userName, userEmail, phoneNumber, selectedRole });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <div className="col-span-1">
          <div>
            <label className="mb-2 block text-start font-medium text-gray-700">
              {t('rolesManagement.fullUserName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('rolesManagement.enterFullUserName')}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-green-500 focus:ring focus:ring-green-100"
            />
          </div>
        </div>
        <div className="col-span-1">
          <div>
            <label className="mb-2 block text-start font-medium text-gray-700">
              {t('rolesManagement.phoneNumber')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('rolesManagement.selectRole')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-green-500 focus:ring focus:ring-green-100"
            />
          </div>
        </div>
        <div className="col-span-1">
          <div>
            <label className="mb-2 block text-start font-medium text-gray-700">
              {t('rolesManagement.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('rolesManagement.enterEmail')}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-green-500 focus:ring focus:ring-green-100"
            />
          </div>
        </div>
        <div className="col-span-1">
          <div>
            <label className="mb-2 block text-start font-medium text-gray-700">
              {t('rolesManagement.roleName')} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('rolesManagement.selectRole')}</option>
              <option value="1">مشرف عام</option>
              <option value="2">مشرف عام</option>
              <option value="3">مشرف عام</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-green-700 px-6 py-2 text-green-700 hover:bg-green-50"
          onClick={() => navigate(-1)}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
        >
          {t('actions.saveChanges')}
        </button>
      </div>
    </form>
  );
}
