import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Controller, FormProvider } from 'react-hook-form';
import PopupMessage from '@gradex/shared/components/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import FormField from '@gradex/shared/components/FormField';
import Input from '@gradex/shared/components/Input';
import PhoneInput from '@gradex/shared/components/PhoneInput';
import CustomSelect from '@gradex/shared/components/CustomSelect';
import { useToast } from '@/shared/context/ToastContext';
import { createUser, selectValidationErrors } from '@gradex/redux/features/user-management';
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
import type { ValidationErrorResponse } from '@/services/api/config';
import { useUserForm, type UserFormData } from '../hooks/useUserForm';
import i18n from '@/i18n';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

export default function AddUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const roles = useSelector(selectRoles) || [];
  const isLoadingRoles = useSelector(selectIsLoadingRoles);
  const countries = useSelector(selectCountries) || [];
  const isLoadingCountries = useSelector(selectIsLoadingCountries);
  const validationErrorsFromRedux = useSelector(selectValidationErrors);

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const currentLang = i18n.language as 'ar' | 'en';

  // Initialize form with custom hook
  const { form, validateForm } = useUserForm();
  const {
    control,
    formState: { errors },
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

  // Fetch roles and countries on component mount
  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 1000 }));
    dispatch(fetchCountries());
  }, [dispatch]);

  /**
   * Handle form submission with validation
   */
  const onFormSubmit = async (data: UserFormData) => {
    try {
      setIsCreating(true);
      const resultAction = await dispatch(
        createUser({
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          roleId: data.roleId,
          phoneNumber: data.phoneNumber.trim(),
          lkCountryId: data.lkCountryId,
        })
      );

      if (createUser.fulfilled.match(resultAction)) {
        setShowPopupMessage({
          show: true,
          type: 'success',
          message: t('rolesManagement.userCreatedSuccessfully'),
        });
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      showToast({
        message: error && typeof error === 'string' ? error : t('rolesManagement.createUserFailed'),
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    // Trigger validation for all fields
    await form.trigger(['fullName', 'email', 'phoneNumber', 'roleId', 'lkCountryId']);

    // Validate entire form
    const isValid = await validateForm();

    if (!isValid) {
      console.error('Form validation failed');
      return;
    }

    // Use react-hook-form's handleSubmit
    form.handleSubmit(onFormSubmit)(e);
  };

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
                    id="fullName"
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
                    id="email"
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
                render={({ field }) => (
                  <CustomSelect
                    value={field.value || ''}
                    onChange={(value) => {
                      field.onChange(value);
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
                  />
                )}
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
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
        navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
      />
    </FormProvider>
  );
}
