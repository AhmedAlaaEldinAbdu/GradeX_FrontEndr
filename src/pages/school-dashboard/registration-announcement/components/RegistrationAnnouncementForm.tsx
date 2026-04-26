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
        await registrationAnnouncementApi.update({
          id: registrationId,
          gradeIds: normalizedGradeIds,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          schoolBranchId: schoolBranchesId,
          registrationAnouncementStatus: 1, // Status needs to be 1 for update based on requirement
        });

        setShowPopupMessage({
          show: true,
          type: 'success',
          message: t('registrationAnnouncement.updatedSuccessfully'),
        });
      } else {
        await registrationAnnouncementApi.create({
          gradeIds: normalizedGradeIds,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          schoolBranchId: schoolBranchesId,
        });

        setShowPopupMessage({
          show: true,
          type: 'success',
          message: t('registrationAnnouncement.addedSuccessfully'),
        });
      }
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || t('common.errorOccurred');
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/registration-announcement');
  };

  const currentDateTime = new Date().toISOString().slice(0, 16);

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
        {/* Grades (Multi Select) */}
        <FormField
          label={t('registrationAnnouncement.gradesLabel', 'Grades')} // You might want to add translations or just use existing
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
                    : t('registrationAnnouncement.selectGrades', 'Select Grades')
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
                  type="datetime-local"
                  placeholder={t('registrationAnnouncement.chooseStartDate')}
                  min={currentDateTime}
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
                  type="datetime-local"
                  placeholder={t('registrationAnnouncement.chooseEndDate')}
                  min={startDate || currentDateTime}
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
