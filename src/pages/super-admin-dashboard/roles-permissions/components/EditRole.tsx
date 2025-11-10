import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';
import Loading from '@gradex/shared/components/Loading';
import { useRoleForm } from '../hooks/useRoleForm';
import {
  fetchRoleById,
  updateRole,
  selectCurrentRole,
  selectIsLoading,
  selectIsUpdating,
} from '@gradex/redux/features/roles';
import { permissionsApiService } from '@gradex/services/api/permissions/permissions.service';
import type { PermissionGroup } from '@gradex/services/api/types/permissions.types';
import { useToast } from '@/shared/context/ToastContext';

export default function EditRole() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const currentRole = useSelector(selectCurrentRole);
  const isLoading = useSelector(selectIsLoading);
  const isUpdating = useSelector(selectIsUpdating);

  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');

  const { form } = useRoleForm();

  useEffect(() => {
    if (id) {
      dispatch(fetchRoleById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoadingPermissions(true);
        const response = await permissionsApiService.getPermissions({
          PageIndex: 1,
          PageSize: 1000,
        });
        setPermissionGroups(response.permissionGroupDtos || []);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        showToast({
          message: t('common.error'),
          type: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [showToast, t]);

  useEffect(() => {
    if (currentRole) {
      setRoleName(currentRole.name || '');
      setDescription(currentRole.description || '');
      const permissionIds = currentRole.permissions?.map((p) => p.id) || [];
      setSelectedPermissions(permissionIds);
      form.reset({
        roleName: currentRole.name || '',
        description: currentRole.description || '',
        permissions: permissionIds,
      });
    }
  }, [currentRole, form]);

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((perm) => perm !== permissionId)
        : [...prev, permissionId]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (!roleName.trim()) {
      showToast({
        message: t('rolesManagement.roleNameRequired'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (selectedPermissions.length === 0) {
      showToast({
        message: t('rolesManagement.permissionsRequired'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await dispatch(
        updateRole({
          roleId: id,
          roleName: roleName.trim(),
          description: description.trim() || undefined,
          permissions: selectedPermissions,
        })
      ).unwrap();

      showToast({
        message: t('rolesManagement.roleUpdatedSuccessfully'),
        type: 'success',
        duration: 3000,
      });

      navigate('/employees-administration/roles-permissions');
    } catch (error) {
      console.error('Failed to update role:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    }
  };

  if (isLoading || isLoadingPermissions) {
    return (
      <div className="flex justify-center py-10">
        <Loading />
      </div>
    );
  }

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
          value={roleName}
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
              key={group.module}
              className={`rounded-lg border border-gray-200 p-4 ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <CustomCheckbox
                name={`group-${group.module}`}
                checked={isGroupFullyChecked(group)}
                onChange={() => toggleGroupPermissions(group)}
                label={group.module}
              />

              <div className="grid gap-2 md:grid-cols-2">
                {group.permissions.map((perm) => (
                  <CustomCheckbox
                    key={perm.id}
                    name={perm.id}
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => handlePermissionChange(perm.id)}
                    label={perm.arabicName}
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
          onClick={() => navigate('/employees-administration/roles-permissions')}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isUpdating}
          className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800 disabled:opacity-50"
        >
          {isUpdating ? t('common.saving') : t('actions.saveChanges')}
        </button>
      </div>
    </form>
  );
}
