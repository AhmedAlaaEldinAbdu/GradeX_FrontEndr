import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import Loading from '@/shared/components/Loading';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { useSystemUserValidations } from '@/validations/system-user-validations';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { resolveErrorMessage } from '@/lib/http';
import {
  assignSchoolRole,
  fetchUsers,
  selectUsers,
  selectIsLoading,
  selectIsAssigning,
} from '@/redux/features/user-management';
import { fetchRoles } from '@/redux/features/roles/rolesSlice';

interface SystemUserFormValues {
  userName: string;
  role: string[];
}

interface SystemUserFormProps {
  mode: 'add' | 'edit';
  initialData?: {
    userId: string;
    roleIds: string[];
  };
}

export default function SystemUserForm({ mode, initialData }: SystemUserFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const scrollToFirstError = useScrollToFirstError<SystemUserFormValues>();
  const { userNameRules, roleRules } = useSystemUserValidations();
  const schoolBranchId = getCurrentSchoolBranchId();

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isRaw: boolean;
  }>({ show: false, type: 'success', message: '', isRaw: false });

  const users = useAppSelector(selectUsers);
  const isLoadingUsers = useAppSelector(selectIsLoading);
  const isAssigning = useAppSelector(selectIsAssigning);
  const roles = useAppSelector((state) => state.roles.roles);
  const isLoadingRoles = useAppSelector((state) => state.roles.isLoading);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SystemUserFormValues>({
    defaultValues: { userName: '', role: [] },
  });

  useEffect(() => {
    dispatch(
      fetchUsers({
        page: 1,
        limit: 1000,
        filters: { schoolBranchesId: schoolBranchId || undefined },
      })
    );
    dispatch(
      fetchRoles({
        page: 1,
        limit: 1000,
        filters: { schoolBranchesId: schoolBranchId || undefined },
      })
    );
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (!initialData) return;
    reset({
      userName: initialData.userId,
      role: initialData.roleIds,
    });
  }, [initialData, reset]);

  const userOptions = useMemo(
    () => users.map((u) => ({ value: u.id, label: u.fullName })),
    [users]
  );

  const roleOptions = useMemo(() => roles.map((r) => ({ value: r.id, label: r.name })), [roles]);

  const onValid = async (values: SystemUserFormValues) => {
    try {
      await dispatch(
        assignSchoolRole({
          userId: values.userName,
          roleIds: values.role,
          ...(schoolBranchId ? { schoolBrancheId: schoolBranchId } : {}),
        })
      ).unwrap();
      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t(
          mode === 'edit'
            ? 'rolesManagement.userUpdatedSuccessfully'
            : 'rolesManagement.userCreatedSuccessfully'
        ),
        isRaw: true,
      });
    } catch (error) {
      const { message, isRaw } = resolveErrorMessage(error);
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: message || t('common.errorOccurred'),
        isRaw,
      });
    }
  };

  if (isLoadingUsers && users.length === 0) {
    return (
      <Card padding="md">
        <Loading />
      </Card>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onValid, scrollToFirstError)} className="flex flex-col gap-6">
        <Card padding="md" className="flex flex-col gap-8">
          {/* User name */}
          <div className="w-full">
            <FormField
              label={t('rolesManagement.userName')}
              required
              htmlFor="userName"
              name="userName"
              error={errors.userName?.message}
            >
              <Controller
                name="userName"
                control={control}
                rules={userNameRules}
                render={({ field }) => (
                  <CustomSelect
                    id="userName"
                    value={field.value}
                    onChange={field.onChange}
                    options={userOptions}
                    placeholder={t('rolesManagement.selectUserName')}
                    disabled={mode === 'edit' || isLoadingUsers}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Role */}
          <div className="w-full md:w-1/2">
            <FormField
              label={t('rolesManagement.role')}
              required
              htmlFor="role"
              name="role"
              error={errors.role?.message}
            >
              <Controller
                name="role"
                control={control}
                rules={roleRules}
                render={({ field }) => (
                  <CustomSelect
                    id="role"
                    isMulti
                    value={field.value}
                    onChange={field.onChange}
                    options={roleOptions}
                    placeholder={t('rolesManagement.selectRole')}
                    disabled={isLoadingRoles}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/settings/job-roles?tab=system-users')}
              disabled={isAssigning}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="success" disabled={isAssigning}>
              {isAssigning
                ? t('common.saving')
                : mode === 'edit'
                  ? t('common.save')
                  : t('common.add')}
            </Button>
          </div>
        </Card>
      </form>

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        message={showPopupMessage.message}
        isMessageRaw={showPopupMessage.isRaw}
        onClose={() => {
          const wasSuccess = showPopupMessage.type === 'success';
          setShowPopupMessage({ show: false, type: 'success', message: '', isRaw: false });
          if (wasSuccess) {
            navigate('/settings/job-roles?tab=system-users');
          }
        }}
      />
    </>
  );
}
