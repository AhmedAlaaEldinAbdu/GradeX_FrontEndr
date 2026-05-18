import { useTranslation } from 'react-i18next';

const ARABIC_TEXT_REGEX = /^[؀-ۿ\s\d\p{P}]+$/u;
const ENGLISH_TEXT_REGEX = /^[a-zA-Z\s\d\p{P}]+$/u;

export const useJobRoleValidations = () => {
  const { t } = useTranslation();

  return {
    nameArRules: {
      required: t('rolesManagement.roleNameArRequired'),
      maxLength: { value: 100, message: t('rolesManagement.validation.roleNameMax') },
      pattern: {
        value: ARABIC_TEXT_REGEX,
        message: t('rolesManagement.validation.roleNameArInvalid'),
      },
    },
    nameEnRules: {
      required: t('rolesManagement.roleNameEnRequired'),
      maxLength: { value: 100, message: t('rolesManagement.validation.roleNameMax') },
      pattern: {
        value: ENGLISH_TEXT_REGEX,
        message: t('rolesManagement.validation.roleNameEnInvalid'),
      },
    },
    descriptionArRules: {
      maxLength: { value: 500, message: t('rolesManagement.validation.descriptionMax') },
      validate: (value: string) =>
        !value ||
        ARABIC_TEXT_REGEX.test(value) ||
        t('rolesManagement.validation.descriptionArInvalid'),
    },
    descriptionEnRules: {
      maxLength: { value: 500, message: t('rolesManagement.validation.descriptionMax') },
      validate: (value: string) =>
        !value ||
        ENGLISH_TEXT_REGEX.test(value) ||
        t('rolesManagement.validation.descriptionEnInvalid'),
    },
    validatePermissions: (count: number) =>
      count > 0 ? true : t('rolesManagement.validation.permissionsRequired'),
  };
};
