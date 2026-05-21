import { useTranslation } from 'react-i18next';

export const useJobRoleValidations = () => {
  const { t } = useTranslation();

  return {
    roleNameRules: {
      required: t('rolesManagement.roleNameRequired'),
      maxLength: { value: 100, message: t('rolesManagement.validation.roleNameMax') },
    },
    descriptionRules: {
      maxLength: { value: 500, message: t('rolesManagement.validation.descriptionMax') },
    },
    validatePermissions: (count: number) =>
      count > 0 ? true : t('rolesManagement.validation.permissionsRequired'),
  };
};
