import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';
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

export default function EditRole() {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    [{ id: 'add-school' }, { id: 'approve-school' }].map((p) => p.id)
  );
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  const handlePermissionChange = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((perm) => perm !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPermissions([]);
      setSelectAll(false);
    } else {
      const all = permissionGroups.flatMap((group) => group.permissions.map((p) => p.id));
      setSelectedPermissions(all);
      setSelectAll(true);
    }
  };

  const toggleGroupPermissions = (group: PermissionGroup) => {
    const allIds = group.permissions.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedPermissions.includes(id));

    setSelectedPermissions((prev) =>
      allSelected ? prev.filter((id) => !allIds.includes(id)) : [...new Set([...prev, ...allIds])]
    );
  };

  const isGroupFullyChecked = (group: PermissionGroup) => {
    const allIds = group.permissions.map((p) => p.id);
    return allIds.every((id) => selectedPermissions.includes(id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ roleName, description, selectedPermissions });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4">
        <label className="required mb-2 block text-start font-medium text-gray-700">
          {t('rolesManagement.roleName')}
        </label>
        <input
          type="text"
          placeholder={t('rolesManagement.enterRoleName')}
          value={roleName || 'موظف عام'}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-start font-medium text-gray-700">
          {t('rolesManagement.description')}
          <span className="text-gray-500"> ({t('rolesManagement.optional')}) </span>
        </label>
        <textarea
          placeholder={t('rolesManagement.enterRoleDescription')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-4 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="mb-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-gray-800">
            {t('rolesManagement.permissions')}
          </h3>

          <div className="flex items-center gap-2">
            {/* <input
              type="checkbox"
              id="selectAll"
              checked={selectAll}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="selectAll" className="cursor-pointer font-semibold text-green-700">
              {t('rolesManagement.selectAll')}
            </label> */}
            <CustomCheckbox
              name="selectAll"
              checked={selectAll}
              onChange={handleSelectAll}
              label={t('rolesManagement.selectAll')}
            />
          </div>
        </div>

        <div className="space-y-4">
          {permissionGroups.map((group, index) => (
            <div
              key={group.id}
              className={`rounded-lg border border-gray-200 p-4 ${
                index === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              {group.permissions
                .filter((perm) => perm.parentControl)
                .map((perm) => (
                  <CustomCheckbox
                    name={perm.id}
                    checked={isGroupFullyChecked(group)}
                    onChange={() => toggleGroupPermissions(group)}
                    label={t(`${perm.label}`)}
                  />
                ))}

              <div className="grid gap-2 md:grid-cols-2">
                {group.permissions
                  .filter((perm) => !perm.parentControl)
                  .map((perm) => (
                    <CustomCheckbox
                      name={perm.id}
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handlePermissionChange(perm.id)}
                      label={t(`${perm.label}`)}
                    />
                  ))}
              </div>
            </div>
          ))}
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
