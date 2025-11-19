import CustomCheckbox from '@gradex/shared/components/CustomCheckbox';
import { t } from 'i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, FormProvider } from 'react-hook-form';
import type { AppDispatch } from '@gradex/redux/store/store';
import { createRole, selectValidationErrors, selectIsCreating } from '@gradex/redux/features/roles';
import { permissionsApiService } from '@gradex/services/api';
import type { PermissionGroup as APIPermissionGroup } from '@gradex/services/api/types/permissions.types';
import Loading from '@gradex/shared/components/Loading';
import PopupMessage from '@gradex/shared/components/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import { useToast } from '@/shared/context/ToastContext';
import type { ValidationErrorResponse } from '@/services/api/config';
import { useRoleForm, type RoleFormData } from '../hooks/useRoleForm';
import FormField from '@gradex/shared/components/FormField';
import Input from '@gradex/shared/components/Input';
import TextArea from '@gradex/shared/components/TextArea';

export default function AddRole() {
  const [selectAll, setSelectAll] = useState(false);
  const [permissionGroups, setPermissionGroups] = useState<APIPermissionGroup[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const { form, validateForm } = useRoleForm();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = form;

  // Watch form values
  const selectedPermissions = watch('permissions') || [];

  const isCreating = useSelector(selectIsCreating);
  const validationErrorsFromRedux = useSelector(selectValidationErrors);

  // Show validation errors in toast when they occur
  useEffect(() => {
    if (validationErrorsFromRedux) {
      // Handle array of validation errors
      if (Array.isArray(validationErrorsFromRedux)) {
        validationErrorsFromRedux.forEach((error: ValidationErrorResponse) => {
          showToast({
            message: error.errorMessage,
            type: 'error',
            duration: 5000,
          });
        });
      }
      // Handle object with error messages
      else if (typeof validationErrorsFromRedux === 'object') {
        const errorMessages = Object.values(validationErrorsFromRedux);
        if (errorMessages.length > 0) {
          errorMessages.forEach((errorMsg) => {
            if (typeof errorMsg === 'string') {
              showToast({
                message: errorMsg,
                type: 'error',
                duration: 5000,
              });
            }
          });
        }
      }
    }
  }, [validationErrorsFromRedux, showToast]);

  // Fetch all permissions on component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoadingPermissions(true);
        const response = await permissionsApiService.getPermissions({
          PageIndex: 1,
          PageSize: 10000,
        });
        setPermissionGroups(response.permissionGroupDtos || []);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        showToast({
          message: t('rolesManagement.failedToLoadPermissions'),
          type: 'error',
          duration: 5000,
        });
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [showToast]);

  const handlePermissionChange = (id: string) => {
    const currentPermissions = selectedPermissions || [];
    const updatedPermissions = currentPermissions.includes(id)
      ? currentPermissions.filter((perm) => perm !== id)
      : [...currentPermissions, id];

    setValue('permissions', updatedPermissions);
    // Clear permissions validation error when user selects/deselects
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
    // Clear validation error
    if (errors.permissions) {
      trigger('permissions');
    }
  };

  const toggleGroupPermissions = (group: APIPermissionGroup) => {
    const allIds = group.permissions.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedPermissions.includes(id));

    const currentPermissions = selectedPermissions || [];
    const updatedPermissions = allSelected
      ? currentPermissions.filter((id) => !allIds.includes(id))
      : [...new Set([...currentPermissions, ...allIds])];

    setValue('permissions', updatedPermissions);
    // Clear validation error
    if (errors.permissions) {
      trigger('permissions');
    }
  };

  const isGroupFullyChecked = (group: APIPermissionGroup) => {
    const allIds = group.permissions.map((p) => p.id);
    return allIds.every((id) => selectedPermissions.includes(id));
  };

  /**
   * Handle form submission with validation
   */
  const onFormSubmit = async (data: RoleFormData) => {
    try {
      await dispatch(
        createRole({
          roleName: data.roleName.trim(),
          description: data.description?.trim() || undefined,
          permissions: data.permissions,
        })
      ).unwrap();

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t('rolesManagement.roleCreatedSuccessfully'),
      });
      setTimeout(() => {
        navigate('/employees-administration/roles-permissions');
      }, 1500);
    } catch (error) {
      console.error('Failed to create role:', error);
      showToast({
        message: error && typeof error === 'string' ? error : t('rolesManagement.createRoleFailed'),
        type: 'error',
        duration: 5000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    // Trigger validation for all fields
    await form.trigger(['roleName', 'description', 'permissions']);

    // Validate entire form
    const isValid = await validateForm();

    if (!isValid) {
      console.error('Form validation failed');
      return;
    }

    form.handleSubmit(onFormSubmit)(e);
  };

  const handleCloseSuccessPopup = () => {
    setShowPopupMessage({ ...showPopupMessage, show: false });
    navigate('/employees-administration/roles-permissions');
  };

  if (isLoadingPermissions) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <Loading />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Role Name Field */}
        <div className="mb-4">
          <FormField
            label={t('rolesManagement.roleName')}
            required
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
                />
              )}
            />
          </FormField>
        </div>

        {/* Description Field */}
        <div className="mb-6">
          <FormField
            label={t('rolesManagement.description')}
            optional
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
                />
              )}
            />
          </FormField>
        </div>

        {/* Permissions Section */}
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
                    index === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <CustomCheckbox
                    name={group.module}
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
                        label={perm.arabicName || perm.englishName}
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
            onClick={() => navigate(-1)}
            disabled={isCreating}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isCreating}
          >
            {isCreating ? t('common.saving') : t('common.add')}
          </button>
        </div>
      </form>

      {/* Popups */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={BigSuccessIcon}
        autoClose={false}
        onClose={handleCloseSuccessPopup}
        navigateAfterClose={-1}
      />
    </FormProvider>
  );
}
