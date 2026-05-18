import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import { useToast } from '@/shared/context/ToastContext';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { useSystemUserValidations } from '@/validations/system-user-validations';
import {
  MOCK_USER_NAME_OPTIONS,
  MOCK_ROLE_OPTIONS,
  type MockSystemUser,
} from '../data/mockSystemUsers';

interface SystemUserFormValues {
  userName: string[];
  role: string;
}

interface SystemUserFormProps {
  mode: 'add' | 'edit';
  initialData?: MockSystemUser;
}

export default function SystemUserForm({ mode, initialData }: SystemUserFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const scrollToFirstError = useScrollToFirstError<SystemUserFormValues>();
  const { userNameRules, roleRules } = useSystemUserValidations();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SystemUserFormValues>({
    defaultValues: { userName: [], role: '' },
  });

  // Edit mode: prefill from the provided user. Replace with API data on integration.
  useEffect(() => {
    if (!initialData) return;
    reset({
      userName: [initialData.userName],
      role: initialData.role,
    });
  }, [initialData, reset]);

  const onValid = () => {
    // Dummy submit — wire to the backend on integration.
    showToast({
      message:
        mode === 'edit'
          ? 'rolesManagement.userUpdatedSuccessfully'
          : 'rolesManagement.userCreatedSuccessfully',
      type: 'success',
    });
    navigate('/settings/job-roles?tab=system-users');
  };

  return (
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
                  isMulti
                  value={field.value}
                  onChange={field.onChange}
                  options={MOCK_USER_NAME_OPTIONS}
                  placeholder={t('rolesManagement.selectUserName')}
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
                  value={field.value}
                  onChange={field.onChange}
                  options={MOCK_ROLE_OPTIONS}
                  placeholder={t('rolesManagement.selectRole')}
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
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="success">
            {mode === 'edit' ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </Card>
    </form>
  );
}
