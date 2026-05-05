import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Controller, FormProvider } from 'react-hook-form';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import FormField from '@gradex/shared/components/FormField';
import Input from '@gradex/shared/components/Input';
import PhoneInput from '@gradex/shared/components/PhoneInput';
import CustomSelect from '@gradex/shared/components/CustomSelect';
import {
  createUser,
  selectValidationErrors,
  selectError,
  clearError,
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
import {
  fetchSchools,
  selectSchools,
  selectIsLoading as selectIsLoadingSchools,
} from '@gradex/redux/features/schools';
import { useUserForm, type UserFormData } from '../hooks/useUserForm';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import i18n from '@/i18n';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { extractErrorMessage } from '@/lib/utils';
import { normalizePhoneForApi } from '@/lib/utils/phone-utils';
import { SchoolStatusEnum } from '@/services/api';

export default function AddUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const roles = useSelector(selectRoles) || [];
  const isLoadingRoles = useSelector(selectIsLoadingRoles);
  const countries = useSelector(selectCountries) || [];
  const isLoadingCountries = useSelector(selectIsLoadingCountries);
  const schools = useSelector(selectSchools) || [];
  const isLoadingSchools = useSelector(selectIsLoadingSchools);
  const validationErrorsFromRedux = useSelector(selectValidationErrors);
  const errorFromRedux = useSelector(selectError);

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const currentLang = i18n.language as 'ar' | 'en';

  const schoolBranchOptions = useMemo(() => {
    return (schools || []).flatMap((school) => {
      const schoolLabel =
        currentLang === 'ar'
          ? school.nameAr || school.name || ''
          : school.nameEn || school.name || '';

      const branches = Array.isArray((school as any).schoolBranches)
        ? ((school as any).schoolBranches as Array<{ id: string; city?: string }>)
        : [];

      return branches
        .filter((branch) => Boolean(branch?.id))
        .map((branch) => ({
          value: branch.id,
          label: branch.city ? `${schoolLabel} - ${branch.city}` : schoolLabel,
        }));
    });
  }, [schools, currentLang]);

  // Initialize form with custom hook
  const { form, validateForm } = useUserForm();
  const {
    control,
    formState: { errors },
    trigger,
  } = form;

  const scrollToFirstError = useScrollToFirstError<UserFormData>();

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

  // Fetch roles and countries on component mount
  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 1000 }));
    dispatch(fetchCountries());
    dispatch(
      fetchSchools({ page: 1, limit: 1000, filters: { schoolStatus: SchoolStatusEnum.ACTIVE } })
    );
  }, [dispatch]);

  /**
   * Handle form submission with validation
   */
  const onFormSubmit = async (data: UserFormData) => {
    try {
      setIsCreating(true);

      const normalizedPhone = normalizePhoneForApi(data.phoneNumber);

      const resultAction = await dispatch(
        createUser({
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          roleId: data.roleId,
          phoneNumber: normalizedPhone.phoneNumber,
          countryCode: normalizedPhone.countryCode,
          lkCountryId: data.lkCountryId,
          ...(data.schoolBrancheId ? { schoolBrancheId: data.schoolBrancheId } : {}),
        })
      );

      if (createUser.fulfilled.match(resultAction)) {
        setShowPopupMessage({
          show: true,
          type: 'success',
          message: t('rolesManagement.userCreatedSuccessfully'),
        });
      } else if (createUser.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload as { message?: string } | undefined;
        setShowPopupMessage({
          show: true,
          type: 'error',
          message: errorPayload?.message || t('common.error'),
        });
      }
    } catch (error) {
      const errorPayload = (error as any)?.payload as { message?: string } | undefined;
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: errorPayload?.message || t('common.error'),
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
    form.handleSubmit(onFormSubmit, scrollToFirstError)(e);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit}
        noValidate
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

          {/* School Branch Field (Optional) */}
          <div className="col-span-1">
            <FormField label={t('rolesManagement.school')} htmlFor="schoolBrancheId">
              <Controller
                name="schoolBrancheId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value || ''}
                    onChange={(value) => {
                      field.onChange(value);
                      if (errors.schoolBrancheId) {
                        trigger('schoolBrancheId');
                      }
                    }}
                    options={schoolBranchOptions}
                    placeholder={
                      isLoadingSchools ? t('common.loading') : t('rolesManagement.selectSchool')
                    }
                    disabled={isLoadingSchools}
                    maxHeight="200px"
                    isMulti={false}
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
        onClose={() => {
          setShowPopupMessage({ ...showPopupMessage, show: false });
          dispatch(clearError());
        }}
        navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
      />
    </FormProvider>
  );
}
