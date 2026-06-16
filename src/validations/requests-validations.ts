import { useTranslation } from 'react-i18next';

export const useAddMessageValidations = () => {
  const { t } = useTranslation();

  return {
    gradesRules: {
      validate: (value: string[]) =>
        (Array.isArray(value) && value.length > 0) ||
        t('requests.addMessage.validation.gradesRequired'),
    },
    classroomsRules: {
      validate: (value: string[]) =>
        (Array.isArray(value) && value.length > 0) ||
        t('requests.addMessage.validation.classroomsRequired'),
    },
    contentRules: {
      required: t('requests.addMessage.validation.contentRequired'),
      validate: (value: string) =>
        Boolean(value && value.trim()) || t('requests.addMessage.validation.contentRequired'),
    },
    validateStudents: (directedTo: 'all' | 'selected', count: number) =>
      directedTo === 'all' || count > 0
        ? true
        : t('requests.addMessage.validation.studentsRequired'),
  };
};
