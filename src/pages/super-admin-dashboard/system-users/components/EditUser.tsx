import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Controller, FormProvider } from 'react-hook-form';
import PopupMessage from '@gradex/shared/components/PopupMessage';
import Loading from '@gradex/shared/components/Loading';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import FormField from '@gradex/shared/components/FormField';
import Input from '@gradex/shared/components/Input';
import PhoneInput from '@gradex/shared/components/PhoneInput';
import CustomSelect from '@gradex/shared/components/CustomSelect';
import {
  fetchUserById,
  updateUser,
  selectCurrentUser,
  selectIsLoading,
  selectValidationErrors,
} from '@gradex/redux/features/user-management';
import {
  fetchRoles,
  selectRoles,
  selectIsLoading as selectIsLoadingRoles,
} from '@gradex/redux/features/roles';
import {
  fetchCountries,
  selectCountries,
  selectIsLoadingCountries,
} from '@gradex/redux/features/lookups';
import { useToast } from '@/shared/context/ToastContext';
import type { ValidationErrorResponse } from '@/services/api/config';
import { useUserForm } from '../hooks/useUserForm';
import i18n from '@/i18n';

export default function EditUser() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectIsLoading);
  const validationErrorsFromRedux = useSelector(selectValidationErrors);
  const rolesData = useSelector(selectRoles);
  const roles = useMemo(() => rolesData || [], [rolesData]);
  const isLoadingRoles = useSelector(selectIsLoadingRoles);
  const countries = useSelector(selectCountries) || [];
  const isLoadingCountries = useSelector(selectIsLoadingCountries);

  const currentLang = i18n.language as 'ar' | 'en';

  const [isUpdating, setIsUpdating] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Initialize form with custom hook
  const { form } = useUserForm();
  const {
    control,
    formState: { errors },
    reset,
    trigger,
  } = form;

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

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 1000 }));
    dispatch(fetchCountries());
  }, [dispatch]);

  // Debug: Log roles when they change
  useEffect(() => {
    if (roles.length > 0) {
      console.log('Available Roles:', roles);
      console.log(
        'Role IDs:',
        roles.map((r) => r.id)
      );
    }
  }, [roles]);

  useEffect(() => {
    if (currentUser && roles.length > 0) {
      console.log('Current User Data:', currentUser);
      console.log('Role ID:', currentUser.roleId);
      console.log('Roles:', currentUser.roles);
      console.log('Available Roles:', roles);

      // Ensure roleId matches an existing role
      const roleId = currentUser.roleId || (currentUser.roles && currentUser.roles[0]) || '';

      reset({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        roleId: roleId,
        lkCountryId: currentUser.lkCountryId || '',
      });
    }
  }, [currentUser, roles, reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    if (!id) {
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    // Trigger validation for all fields
    const isValid = await form.trigger();

    if (!isValid) {
      console.error('Form validation failed');
      console.error('Validation errors:', errors);
      console.error('Form values:', form.getValues());
      return;
    }

    const formData = form.getValues();

    try {
      setIsUpdating(true);
      const resultAction = await dispatch(
        updateUser({
          userId: id,
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          roleId: formData.roleId,
          phoneNumber: formData.phoneNumber.trim(),
          lkCountryId: formData.lkCountryId || '',
        })
      );

      console.log('Update result:', resultAction);

      if (updateUser.fulfilled.match(resultAction)) {
        console.log('Update successful, showing popup');
        setShowPopupMessage({
          show: true,
          type: 'success',
          message: t('rolesManagement.userUpdatedSuccessfully'),
        });
      } else if (updateUser.rejected.match(resultAction)) {
        console.error('Update rejected:', resultAction.payload);
        showToast({
          message: t('common.error'),
          type: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    setShowPopupMessage({ ...showPopupMessage, show: false });
    navigate('/employees-administration/system-users');
  };

  if (isLoading || isLoadingRoles || isLoadingCountries) {
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
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 grid gap-3 lg:grid-cols-2">
          {/* Full Name Field */}
          <div className="col-span-1">
            <FormField
              label={t('rolesManagement.fullUserName')}
              required
              htmlFor="fullName"
              error={
                showValidationErrors && errors.fullName?.message
                  ? t(errors.fullName.message)
                  : undefined
              }
            >
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('rolesManagement.enterFullUserName')}
                    required
                  />
                )}
              />
            </FormField>
          </div>

          {/* Phone Number Field */}
          <div className="col-span-1">
            <FormField
              label={t('rolesManagement.phoneNumber')}
              required
              htmlFor="phoneNumber"
              error={
                showValidationErrors && errors.phoneNumber?.message
                  ? t(errors.phoneNumber.message)
                  : undefined
              }
            >
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    label=""
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (errors.phoneNumber) {
                        trigger('phoneNumber');
                      }
                    }}
                    required
                  />
                )}
              />
            </FormField>
          </div>

          {/* Email Field */}
          <div className="col-span-1">
            <FormField
              label={t('rolesManagement.email')}
              required
              htmlFor="email"
              error={
                showValidationErrors && errors.email?.message ? t(errors.email.message) : undefined
              }
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('rolesManagement.enterEmail')}
                    required
                  />
                )}
              />
            </FormField>
          </div>

          {/* Role Field */}
          <div className="col-span-1">
            <FormField
              label={t('rolesManagement.roleName')}
              required
              htmlFor="roleId"
              error={
                showValidationErrors && errors.roleId?.message
                  ? t(errors.roleId.message)
                  : undefined
              }
            >
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => {
                  // Ensure we have a valid string value
                  const fieldValue = Array.isArray(field.value)
                    ? field.value[0] || ''
                    : field.value || '';

                  return (
                    <CustomSelect
                      value={fieldValue}
                      onChange={(value) => {
                        const newValue = typeof value === 'string' ? value : value[0] || '';
                        field.onChange(newValue);
                        if (errors.roleId) {
                          trigger('roleId');
                        }
                      }}
                      options={roles.map((role) => ({
                        value: role.id,
                        label: role.name,
                      }))}
                      placeholder={
                        isLoadingRoles ? t('common.loading') : t('rolesManagement.selectRole')
                      }
                      disabled={isLoadingRoles}
                      maxHeight="200px"
                      isMulti={false}
                    />
                  );
                }}
              />
            </FormField>
          </div>

          {/* Country Field */}
          <div className="col-span-1">
            <FormField
              label={t('rolesManagement.country')}
              required
              htmlFor="lkCountryId"
              error={
                showValidationErrors && errors.lkCountryId?.message
                  ? t(errors.lkCountryId.message)
                  : undefined
              }
            >
              <Controller
                name="lkCountryId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value || ''}
                    onChange={(value) => {
                      field.onChange(value);
                      if (errors.lkCountryId) {
                        trigger('lkCountryId');
                      }
                    }}
                    options={countries.map((country) => ({
                      value: country.id,
                      label: currentLang === 'ar' ? country.arabicName : country.englishName,
                    }))}
                    placeholder={
                      isLoadingCountries ? t('common.loading') : t('rolesManagement.selectCountry')
                    }
                    disabled={isLoadingCountries}
                    maxHeight="200px"
                  />
                )}
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-green-700 px-6 py-2 text-green-700 hover:bg-green-50"
            onClick={() => navigate('/employees-administration/system-users')}
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
