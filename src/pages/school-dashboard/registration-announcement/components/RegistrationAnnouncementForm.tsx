import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@gradex/shared/components/Card';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import CustomSelect from '@/shared/components/CustomSelect';
import FormField from '@/shared/components/FormField';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchGrades } from '@/redux/features/grades/gradesSlice';
import {
  RegistrationAnnouncementSchema,
  type RegistrationAnnouncementProps,
} from '@/validations/registration-announcement-validations';
import { registrationAnnouncementApi } from '@/services/api/registration-announcement/registration-announcement.service';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { getErrorMessage } from '@/lib/http';
import { formatValidationErrors } from '@/lib/utils/error-utils';
import type { RegistrationAnnouncementMutationResponse } from '@/services/api/registration-announcement/registration-announcement.types';

interface RegistrationAnnouncementFormProps {
  initialValues?: Partial<RegistrationAnnouncementProps>;
  isEditMode?: boolean;
  registrationId?: string;
}

const normalizeGradeIds = (
  gradeIds: unknown
): RegistrationAnnouncementProps['gradeIds'] => {
  if (!Array.isArray(gradeIds)) return [];

  return gradeIds
    .map((grade) => {
      if (typeof grade === 'string') return grade;
      if (grade && typeof grade === 'object') {
        const gradeId =
          'id' in grade && typeof grade.id === 'string'
            ? grade.id
            : 'value' in grade && typeof grade.value === 'string'
              ? grade.value
              : '';

        return gradeId;
      }

      return '';
    })
    .filter(Boolean);
};

const getMutationErrorMessage = (
  response: RegistrationAnnouncementMutationResponse,
  fallbackMessage: string
): string => formatValidationErrors(response.validationErrors, response.message || fallbackMessage);

const RegistrationAnnouncementForm: React.FC<RegistrationAnnouncementFormProps> = ({
  initialValues,
  isEditMode = false,
  registrationId,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schoolBranchesId = getCurrentSchoolBranchId() || undefined;
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const grades = useAppSelector((state) => state.grades.grades);
  const isLoadingGrades = useAppSelector((state) => state.grades.isLoading);

  useEffect(() => {
    if (schoolBranchesId) {
      dispatch(fetchGrades(schoolBranchesId));
    }
  }, [dispatch, schoolBranchesId]);

  const gradeOptions = React.useMemo(() => {
    if (!Array.isArray(grades)) return [];
    return grades.map((grade) => ({
      value: grade.id,
      label: currentLang === 'ar' ? grade.nameAr : grade.nameEn || grade.nameAr,
    }));
  }, [grades, currentLang]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RegistrationAnnouncementProps>({
    resolver: yupResolver(RegistrationAnnouncementSchema),
    defaultValues: {
      gradeIds: normalizeGradeIds(initialValues?.gradeIds),
      startDate: initialValues?.startDate || '',
      endDate: initialValues?.endDate || '',
    },
  });

  const scrollToFirstError = useScrollToFirstError<RegistrationAnnouncementProps>();

  useEffect(() => {
    reset({
      gradeIds: normalizeGradeIds(initialValues?.gradeIds),
      startDate: initialValues?.startDate || '',
      endDate: initialValues?.endDate || '',
    });
  }, [initialValues, reset]);

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const handleFormSubmit = async (data: RegistrationAnnouncementProps) => {
    setIsSubmitting(true);
    const normalizedGradeIds = normalizeGradeIds(data.gradeIds);
    try {
      if (isEditMode && registrationId) {
        const response = await registrationAnnouncementApi.update({
          id: registrationId,
          gradeIds: normalizedGradeIds,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          schoolBranchId: schoolBranchesId,
          registrationAnouncementStatus: 1, // Status needs to be 1 for update based on requirement
        });

        if (response.isSuccess === false) {
          setShowPopupMessage({
            show: true,
            type: 'error',
            message: getMutationErrorMessage(response, t('common.errorOccurred')),
          });
          return;
        }

        setShowPopupMessage({
          show: true,
          type: 'success',
          message: t('registrationAnnouncement.updatedSuccessfully'),
        });
      } else {
        const response = await registrationAnnouncementApi.create({
          gradeIds: normalizedGradeIds,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          schoolBranchId: schoolBranchesId,
        });

        if (response.isSuccess === false) {
          setShowPopupMessage({
            show: true,
            type: 'error',
            message: getMutationErrorMessage(response, t('common.errorOccurred')),
          });
          return;
        }

        setShowPopupMessage({
          show: true,
          type: 'success',
          message: t('registrationAnnouncement.addedSuccessfully'),
        });
      }
    } catch (error: unknown) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: getErrorMessage(error) || t('common.errorOccurred'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/registration-announcement');
  };

  const currentDate = new Date().toISOString().slice(0, 10);

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(handleFormSubmit, scrollToFirstError)} noValidate className="space-y-6">
        {/* Educational Stages (Multi Select) */}
        <FormField
          label={t('registrationAnnouncement.educationalStagesLabel')}
          required
          error={errors.gradeIds?.message && t(errors.gradeIds.message)}
          htmlFor="gradeIds"
        >
          <Controller
            name="gradeIds"
            control={control}
            render={({ field }) => (
              <CustomSelect
                value={normalizeGradeIds(field.value)}
                onChange={(value) => field.onChange(value)}
                options={gradeOptions}
                placeholder={
                  isLoadingGrades
                    ? t('common.loading')
                    : t('registrationAnnouncement.selectEducationalStages')
                }
                disabled={isLoadingGrades}
                error={!!errors.gradeIds}
                isMulti={true}
                id="gradeIds"
              />
            )}
          />
        </FormField>

        {/* Start and End Dates */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label={t('registrationAnnouncement.startDateLabel')}
            required
            error={errors.startDate?.message && t(errors.startDate.message)}
            htmlFor="startDate"
          >
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  placeholder={t('registrationAnnouncement.chooseStartDate')}
                  min={currentDate}
                  max={endDate || undefined}
                  error={errors.startDate?.message ? ' ' : undefined}
                  className={errors.startDate?.message ? 'border-red-500' : ''}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('registrationAnnouncement.endDateLabel')}
            required
            error={errors.endDate?.message && t(errors.endDate.message)}
            htmlFor="endDate"
          >
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  placeholder={t('registrationAnnouncement.chooseEndDate')}
                  min={startDate || currentDate}
                  error={errors.endDate?.message ? ' ' : undefined}
                  className={errors.endDate?.message ? 'border-red-500' : ''}
                />
              )}
            />
          </FormField>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
            className="min-w-[120px] border-green-800 text-green-800 hover:bg-green-50"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="min-w-[120px] bg-green-800 hover:bg-green-900"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('common.saving')
              : isEditMode
                ? t('common.saveChanges')
                : t('common.add')}
          </Button>
        </div>
      </form>

      {/* Popup Message */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
        navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
      />
    </Card>
  );
};

export default RegistrationAnnouncementForm;
