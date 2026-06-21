import { useTranslation } from 'react-i18next';

export const useLessonValidations = () => {
  const { t } = useTranslation();

  const validateStartTime = (value: string) => {
    if (!value) return true;
    // if (value < '08:30') {
    //   return t('lesson.validation.startTimeMin');
    // }
    return true;
  };

  const validateEndTime = (value: string, startTime?: string) => {
    if (!value) return true;
    if (value > '15:15') {
      return t('lesson.validation.endTimeMax');
    }
    if (startTime) {
      if (value === startTime) {
        return t('lesson.validation.timeEquality');
      }
      if (value < startTime) {
        return t('lesson.validation.endTimeBeforeStart');
      }
    }
    return true;
  };

  return {
    validateStartTime,
    validateEndTime,
  };
};
