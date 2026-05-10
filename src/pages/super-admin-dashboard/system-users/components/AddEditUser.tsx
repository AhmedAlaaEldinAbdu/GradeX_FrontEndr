import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Controller, FormProvider } from 'react-hook-form';
import PopupMessage from '@/shared/popups/PopupMessage';
import Loading from '@gradex/shared/components/Loading';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import FormField from '@gradex/shared/components/FormField';
import Input from '@gradex/shared/components/Input';
import PhoneInput from '@gradex/shared/components/PhoneInput';
import CustomSelect from '@gradex/shared/components/CustomSelect';
import {
  createUser,
  updateUser,
  fetchUserById,
  selectCurrentUser,
  selectIsLoading,
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
import type { ValidationErrorResponse } from '@/services/api/config';
import { useUserForm, type UserFormData } from '../hooks/useUserForm';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import i18n from '@/i18n';
import { extractErrorMessage } from '@/lib/utils';
import { formatPhoneForInput, normalizePhoneForApi } from '@/lib/utils/phone-utils';
import { SchoolStatusEnum } from '@/services/api';

interface AddEditUserProps {
  mode: 'add' | 'edit';
}

export default function AddEditUser({ mode }: AddEditUserProps) {
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector(selectCurrentUser);
  const isUserLoading = useSelector(selectIsLoading);
  const validationErrorsFromRedux = useSelector(selectValidationErrors);
  const errorFromRedux = useSelector(selectError);
  const rolesData = useSelector(selectRoles);
  const roles = useMemo(() => rolesData || [], [rolesData]);
  const isLoadingRoles = useSelector(selectIsLoadingRoles);
  const countries = useSelector(selectCountries) || [];
  const isLoadingCountries = useSelector(selectIsLoadingCountries);
  const schools = useSelector(selectSchools) || [];
  const isLoadingSchools = useSelector(selectIsLoadingSchools);

  const currentLang = i18n.language as 'ar' | 'en';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

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

  const { form, validateForm } = useUserForm({ isEditMode: isEdit });
  const {
    control,
    formState: { errors },
    reset,
    trigger,
  } = form;

  const scrollToFirstError = useScrollToFirstError<UserFormData>();

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchUserById(id));
    }
  }, [isEdit, id, dispatch]);

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 1000 }));
    dispatch(fetchCountries());
    dispatch(
      fetchSchools(
        isEdit
          ? { page: 1, limit: 1000 }
          : { page: 1, limit: 1000, filters: { schoolStatus: SchoolStatusEnum.ACTIVE } }
      )
    );
  }, [dispatch, isEdit]);

  useEffect(() => {
    if (!isEdit || !currentUser || roles.length === 0) return;

    const roleId = currentUser.roleId || (currentUser.roles && currentUser.roles[0]) || '';
    const explicitSchoolBranchId =
      ((currentUser as any)?.schoolBrancheId as string | undefined) ||
      ((currentUser as any)?.schoolBranchId as string | undefined) ||
      '';
    const schoolId = ((currentUser as any)?.schoolId as string | undefined) || '';
    const fallbackBranchId = schoolId
      ? (schools.find((s) => s.id === schoolId)?.schoolBranches?.[0]?.id ?? '')
      : '';
    const schoolBrancheId = explicitSchoolBranchId || fallbackBranchId;

    reset({
      fullName: currentUser.fullName || '',
      email: currentUser.email || '',
      phoneNumber: formatPhoneForInput(currentUser.countryCode, currentUser.phoneNumber),
      roleId,
      lkCountryId: currentUser.lkCountryId || '',
      schoolBrancheId,
    });
  }, [isEdit, currentUser, roles, reset, schools]);

  useEffect(() => {
    if (isEdit) {
      if (!validationErrorsFromRedux) return;
      let errorMessages = '';
      if (Array.isArray(validationErrorsFromRedux)) {
        errorMessages = validationErrorsFromRedux
          .map((err: ValidationErrorResponse) => err.errorMessage)
          .join('\n');
      } else if (typeof validationErrorsFromRedux === 'object') {
        errorMessages = Object.values(validationErrorsFromRedux)
          .filter((msg) => typeof msg === 'string')
          .join('\n');
      }
      if (errorMessages) {
        setShowPopupMessage({ show: true, type: 'error', message: errorMessages });
      }
    } else {
      const errorMessage = extractErrorMessage(validationErrorsFromRedux) || errorFromRedux;
      if (errorMessage) {
        setShowPopupMessage({
          show: true,
          type: 'error',
          message: errorMessage || t('common.errorOccurred'),
        });
      }
    }
  }, [isEdit, validationErrorsFromRedux, errorFromRedux, t]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    if (isEdit && !id) {
      setShowPopupMessage({ show: true, type: 'error', message: t('common.error') });
      return;
    }

    const isValid = await validateForm();
    if (!isValid) {
      scrollToFirstError(form.formState.errors);
      return;
    }

    const data = form.getValues();
    const normalizedPhone = normalizePhoneForApi(data.phoneNumber);

    try {
      setIsSubmitting(true);

      if (isEdit) {
        const resultAction = await dispatch(
          updateUser({
            userId: id!,
            fullName: data.fullName.trim(),
            email: data.email.trim(),
            roleId: data.roleId,
            phoneNumber: normalizedPhone.phoneNumber,
            countryCode: normalizedPhone.countryCode,
            lkCountryId: data.lkCountryId || '',
            ...(data.schoolBrancheId ? { schoolBrancheId: data.schoolBrancheId } : {}),
          })
        );

        if (updateUser.fulfilled.match(resultAction)) {
          setShowPopupMessage({
            show: true,
            type: 'success',
            message: t('rolesManagement.userUpdatedSuccessfully'),
          });
        } else if (updateUser.rejected.match(resultAction)) {
          const errorPayload = resultAction.payload as { message?: string } | undefined;
          setShowPopupMessage({
            show: true,
            type: 'error',
            message: errorPayload?.message || t('common.error'),
          });
        }
      } else {
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
      }
    } catch (error) {
      const errorPayload = (error as any)?.payload as { message?: string } | undefined;
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: errorPayload?.message || t('common.error'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && (isUserLoading || isLoadingRoles || isLoadingCountries || isLoadingSchools)) {
    return (
      <div className="flex justify-center py-10">
        <Loading />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 grid gap-3 lg:grid-cols-2">
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
                      if (errors.phoneNumber) trigger('phoneNumber');
                    }}
                    required
                  />
                )}
              />
            </FormField>
          </div>

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
                  const fieldValue = Array.isArray(field.value)
                    ? field.value[0] || ''
                    : field.value || '';
                  return (
                    <CustomSelect
                      value={fieldValue}
                      onChange={(value) => {
                        const newValue = typeof value === 'string' ? value : value[0] || '';
                        field.onChange(newValue);
                        if (errors.roleId) trigger('roleId');
                      }}
                      options={roles.map((role) => ({ value: role.id, label: role.name }))}
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

          <div className="col-span-1">
            <FormField
              label={t('rolesManagement.country')}
              required={!isEdit}
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
                      if (errors.lkCountryId) trigger('lkCountryId');
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
                      if (errors.schoolBrancheId) trigger('schoolBrancheId');
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
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? t('common.saving')
              : isEdit
                ? t('actions.saveChanges')
                : t('common.add')}
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
          if (!isEdit) dispatch(clearError());
        }}
        navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
      />
    </FormProvider>
  );
}
