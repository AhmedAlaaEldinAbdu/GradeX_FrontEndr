import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import FileUpload from '@/shared/components/FileUpload';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';

export type EmployeesNotificationFormValues = {
  sentTo: string;
  employeeNames: string[];
  educationalStages: string[];
  classrooms: string[];
  date: string;
  subjectAr: string;
  subjectEn: string;
  attachments: File[];
};

type EmployeesNotificationFormProps = {
  mode: 'add' | 'edit';
  schoolBranchId: string;
  initialValues?: Partial<EmployeesNotificationFormValues>;
  onCancel?: () => void;
  onSubmit?: (values: EmployeesNotificationFormValues) => void | Promise<void>;
};

type EmployeesNotificationFormErrors = Partial<
  Record<'sentTo' | 'educationalStages' | 'date' | 'subjectAr' | 'subjectEn', string>
>;

export default function EmployeesNotificationForm({
  mode,
  schoolBranchId,
  initialValues,
  onCancel,
  onSubmit,
}: EmployeesNotificationFormProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const teachers = useAppSelector((state) => state.teachers.teachers);
  const isEmployeesLoading = useAppSelector((state) => state.teachers.isLoading);
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const isEducationalStagesLoading = useAppSelector((state) => state.educationalStages.isLoading);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const isClassroomsLoading = useAppSelector((state) => state.classrooms.isLoading);

  useEffect(() => {
    if (!schoolBranchId) return;

    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: { schoolBranchId },
      })
    );
    dispatch(
      fetchTeachers({
        page: 1,
        limit: 10000,
        filters: { schoolBranchId },
      })
    );
  }, [dispatch, schoolBranchId]);

  const employeeOptions = useMemo<CustomSelectOption[]>(
    () =>
      teachers
        .map((teacher) => ({
          value: teacher.id,
          label: teacher.fullName,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [teachers]
  );

  const educationalStageOptions = useMemo<CustomSelectOption[]>(
    () =>
      educationalStages
        .map((stage) => ({
          value: stage.id,
          label:
            (currentLang === 'ar' ? stage.nameAr : stage.nameEn) || stage.nameAr || stage.nameEn,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [currentLang, educationalStages]
  );

  const classroomOptions = useMemo<CustomSelectOption[]>(
    () =>
      classrooms
        .map((classroom) => ({
          value: classroom.id,
          label:
            (currentLang === 'ar' ? classroom.name : classroom.nameEn) ||
            classroom.name ||
            classroom.nameEn,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [classrooms, currentLang]
  );

  const [values, setValues] = useState<EmployeesNotificationFormValues>({
    sentTo: initialValues?.sentTo ?? 'employees',
    employeeNames: initialValues?.employeeNames ?? [],
    educationalStages: initialValues?.educationalStages ?? [],
    classrooms: initialValues?.classrooms ?? [],
    date: initialValues?.date ?? '',
    subjectAr: initialValues?.subjectAr ?? '',
    subjectEn: initialValues?.subjectEn ?? '',
    attachments: initialValues?.attachments ?? [],
  });

  const errors = useMemo<EmployeesNotificationFormErrors>(() => {
    if (!submitAttempted) return {};

    return {
      sentTo: values.sentTo ? '' : t('notifications.validation.sentToRequired'),
      educationalStages: values.educationalStages.length > 0 ? '' : t('common.validation.required'),
      date: values.date ? '' : t('notifications.validation.dateRequired'),
      subjectAr: values.subjectAr.trim() ? '' : t('notifications.validation.subjectArRequired'),
      subjectEn: values.subjectEn.trim() ? '' : t('notifications.validation.subjectEnRequired'),
    };
  }, [submitAttempted, t, values]);

  const hasValidationErrors = Object.values(errors).some(Boolean);
  const submitLabel = isSubmitting
    ? t('common.saving')
    : mode === 'add'
      ? t('common.send')
      : t('common.save');
  const cancelLabel = t('common.cancel');

  const patch = (partial: Partial<EmployeesNotificationFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitAttempted(true);

    const nextErrors = {
      sentTo: values.sentTo ? '' : t('notifications.validation.sentToRequired'),
      educationalStages: values.educationalStages.length > 0 ? '' : t('common.validation.required'),
      date: values.date ? '' : t('notifications.validation.dateRequired'),
      subjectAr: values.subjectAr.trim() ? '' : t('notifications.validation.subjectArRequired'),
      subjectEn: values.subjectEn.trim() ? '' : t('notifications.validation.subjectEnRequired'),
    };

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <FormField label={t('notifications.sentTo')} required error={errors.sentTo}>
          <CustomSelect
            value={values.sentTo}
            onChange={(value) => {
              const selected = Array.isArray(value) ? (value[0] ?? '') : value;
              patch({ sentTo: selected ?? '' });
            }}
            options={[{ value: 'employees', label: t('notifications.tabs.employees') }]}
            placeholder={t('notifications.selectRecipient')}
            showSearch={false}
            error={Boolean(errors.sentTo)}
          />
        </FormField>

        <FormField label={t('notifications.employeeNames')} optional>
          <CustomSelect
            isMulti
            value={values.employeeNames}
            onChange={(value) => patch({ employeeNames: Array.isArray(value) ? value : [value] })}
            options={employeeOptions}
            placeholder={isEmployeesLoading ? t('common.loading') : t('notifications.chooseNames')}
            disabled={!schoolBranchId || isEmployeesLoading}
          />
        </FormField>

        <FormField
          label={t('notifications.educationalStageFilter')}
          required
          error={errors.educationalStages}
        >
          <CustomSelect
            isMulti
            value={values.educationalStages}
            onChange={(value) =>
              patch({ educationalStages: Array.isArray(value) ? value : [value] })
            }
            options={educationalStageOptions}
            placeholder={
              isEducationalStagesLoading
                ? t('common.loading')
                : t('notifications.educationalStageFilter')
            }
            disabled={!schoolBranchId || isEducationalStagesLoading}
            error={Boolean(errors.educationalStages)}
          />
        </FormField>

        <FormField label={t('notifications.classroomFilter')} optional>
          <CustomSelect
            isMulti
            value={values.classrooms}
            onChange={(value) => patch({ classrooms: Array.isArray(value) ? value : [value] })}
            options={classroomOptions}
            placeholder={
              isClassroomsLoading ? t('common.loading') : t('notifications.classroomFilter')
            }
            disabled={!schoolBranchId || isClassroomsLoading}
          />
        </FormField>

        <FormField label={t('notifications.date')} required error={errors.date}>
          <Input
            type="date"
            value={values.date}
            onChange={(event) => patch({ date: event.target.value })}
            placeholder={t('common.chooseDate')}
          />
        </FormField>

        <FormField
          label={t('notifications.notificationSubjectAr')}
          required
          error={errors.subjectAr}
        >
          <TextArea
            value={values.subjectAr}
            onChange={(event) => patch({ subjectAr: event.target.value })}
            rows={3}
            placeholder={t('notifications.enterSubject')}
          />
        </FormField>

        <FormField
          label={t('notifications.notificationSubjectEn')}
          required
          error={errors.subjectEn}
        >
          <TextArea
            value={values.subjectEn}
            onChange={(event) => patch({ subjectEn: event.target.value })}
            rows={3}
            placeholder={t('notifications.enterSubject')}
          />
        </FormField>

        <FileUpload
          label={t('notifications.attachments')}
          optional
          multiple
          accept=".gif,.svg,.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx"
          uploadText={t('notifications.uploadAttachments')}
          formatHints={[
            'gif',
            'svg',
            'jpg',
            'png',
            'pdf',
            'doc',
            'docx',
            'xls',
            'xlsx',
            'txt',
            'ppt',
            'pptx',
          ]}
          maxSize={10}
          onFilesChange={(files) => patch({ attachments: files })}
        />

        <div className="flex flex-row-reverse gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isSubmitting || (submitAttempted && hasValidationErrors)}
          >
            {submitLabel}
          </Button>
          <Button onClick={onCancel} variant="outline" type="button">
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
