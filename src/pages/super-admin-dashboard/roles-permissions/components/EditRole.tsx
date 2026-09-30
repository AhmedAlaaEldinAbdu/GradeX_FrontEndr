import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';
import Loading from '@gradex/shared/components/Loading';
import FormField from '@gradex/shared/components/FormField';
import Input from '@gradex/shared/components/Input';
import TextArea from '@gradex/shared/components/TextArea';
import { Controller, FormProvider } from 'react-hook-form';
import { useRoleForm, type RoleFormData } from '../hooks/useRoleForm';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import {
  fetchRoleById,
  updateRole,
  selectCurrentRole,
  selectIsLoading,
  selectIsUpdating,
  selectValidationErrors,
  selectError,
  clearError,
} from '@gradex/redux/features/roles';
import { extractErrorMessage } from '@/lib/utils';
import { permissionsApiService } from '@gradex/services/api/permissions/permissions.service';
import type { PermissionGroup } from '@gradex/services/api/types/permissions.types';
import { useToast } from '@/shared/context/ToastContext';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

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
  const [selectAll, setSelectAll] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const { form, validateForm } = useRoleForm();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = form;

  const scrollToFirstError = useScrollToFirstError<RoleFormData>();

  const selectedPermissions = watch('permissions') || [];

  const validationErrorsFromRedux = useSelector(selectValidationErrors);
  const errorFromRedux = useSelector(selectError);

  useEffect(() => {
    const errorMessage = extractErrorMessage(validationErrorsFromRedux) || errorFromRedux;

    if (errorMessage) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: errorMessage || t('common.errorOccurred'),
      });
    }
  }, [validationErrorsFromRedux, errorFromRedux, t]);

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
        setShowPopupMessage({
          show: true,
          type: 'error',
          message: t('common.error'),
        });
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [showToast, t]);

  useEffect(() => {
    if (currentRole) {
      const permissionIds = currentRole.permissions?.map((p) => p.id) || [];
      form.reset({
        roleName: currentRole.name || '',
        description: currentRole.description || '',
        permissions: permissionIds,
      });
    }
  }, [currentRole, form]);

  const handlePermissionChange = (permissionId: string) => {
    const currentPermissions = selectedPermissions || [];
    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter((perm) => perm !== permissionId)
      : [...currentPermissions, permissionId];

    setValue('permissions', updatedPermissions);
    if (errors.permissions) {
      trigger('permissions');
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setValue('permissions', []);
      setSelectAll(false);
    } else {
      const all = permissionGroups.flatMap((group) => group.permissions.map((p) => p.id));
      setValue('permissions', all);
      setSelectAll(true);
    }
    if (errors.permissions) {
      trigger('permissions');
    }
  };

  const toggleGroupPermissions = (group: PermissionGroup) => {
    const allIds = group.permissions.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedPermissions.includes(id));

    const currentPermissions = selectedPermissions || [];
    const updatedPermissions = allSelected
      ? currentPermissions.filter((id) => !allIds.includes(id))
      : [...new Set([...currentPermissions, ...allIds])];

    setValue('permissions', updatedPermissions);
    if (errors.permissions) {
      trigger('permissions');
    }
  };

  const isGroupFullyChecked = (group: PermissionGroup) => {
    const allIds = group.permissions.map((p) => p.id);
    return allIds.every((id) => selectedPermissions.includes(id));
  };

  const onFormSubmit = async (data: {
    roleName: string;
    description?: string;
    permissions: string[];
  }) => {
    if (!id) return;

    try {
      await dispatch(
        updateRole({
          roleId: id,
          roleName: data.roleName.trim(),
          description: data.description?.trim() || undefined,
          permissions: data.permissions,
        })
      ).unwrap();

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t('rolesManagement.roleUpdatedSuccessfully'),
      });
    } catch (error) {
      console.error('Failed to update role:', error);
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: (error as { message?: string })?.message || t('common.errorOccurred'),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    if (!id) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: t('common.error'),
      });
      return;
    }

    await form.trigger(['roleName', 'description', 'permissions']);

    const isValid = await validateForm();

    if (!isValid) {
      console.error('Form validation failed');
      return;
    }

    form.handleSubmit(onFormSubmit, scrollToFirstError)(e);
  };

  if (isLoading || isLoadingPermissions) {
    return (
      <div className="flex justify-center py-10">
        <Loading />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs"
      >
        <div className="mb-4">
          <FormField
            label={t('rolesManagement.roleName')}
            required
            htmlFor="roleName"
            error={errors.roleName?.message && t(errors.roleName.message)}
          >
            <Controller
              name="roleName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={t('rolesManagement.enterRoleName')}
                  required
                  id="roleName"
                />
              )}
            />
          </FormField>
        </div>

        <div className="mb-6">
          <FormField
            label={t('rolesManagement.description')}
            optional
            htmlFor="description"
            error={errors.description?.message && t(errors.description.message)}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  placeholder={t('rolesManagement.enterRoleDescription')}
                  rows={3}
                  id="description"
                />
              )}
            />
          </FormField>
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

          <FormField
            label={''}
            error={
              showValidationErrors && errors.permissions?.message
                ? t(errors.permissions.message)
                : undefined
            }
          >
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
                    textClassName="text-xl font-semibold text-gray-800"
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
          </FormField>
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
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        onClose={() => {
          setShowPopupMessage({ ...showPopupMessage, show: false });
          dispatch(clearError());
        }}
        navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
      />
    </FormProvider>
  );
}
