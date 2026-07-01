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
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';

export type EmployeesNotificationFormValues = {
  sentTo: string;
  employeeNames: string[];
  date: string;
  subjectAr: string;
  subjectEn: string;
  bodyAr: string;
  bodyEn: string;
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
  Record<
    'sentTo' | 'employeeNames' | 'date' | 'subjectAr' | 'subjectEn' | 'bodyAr' | 'bodyEn',
    string
  >
>;

export default function EmployeesNotificationForm({
  mode,
  schoolBranchId,
  initialValues,
  onCancel,
  onSubmit,
}: EmployeesNotificationFormProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const scrollToFirstError = useScrollToFirstError<EmployeesNotificationFormValues>();

  const teachers = useAppSelector((state) => state.teachers.teachers);
  const isEmployeesLoading = useAppSelector((state) => state.teachers.isLoading);

  useEffect(() => {
    if (!schoolBranchId) return;

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
          value: teacher.userId,
          label: teacher.fullName,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [teachers]
  );

  const [values, setValues] = useState<EmployeesNotificationFormValues>({
    sentTo: initialValues?.sentTo ?? 'employees',
    employeeNames: initialValues?.employeeNames ?? [],
    date: initialValues?.date ?? '',
    subjectAr: initialValues?.subjectAr ?? '',
    subjectEn: initialValues?.subjectEn ?? '',
    bodyAr: initialValues?.bodyAr ?? '',
    bodyEn: initialValues?.bodyEn ?? '',
    attachments: initialValues?.attachments ?? [],
  });

  const errors = useMemo<EmployeesNotificationFormErrors>(() => {
    if (!submitAttempted) return {};

    return {
      sentTo: values.sentTo ? '' : t('notifications.validation.sentToRequired'),
      employeeNames:
        values.employeeNames.length > 0 ? '' : t('notifications.validation.recipientNamesRequired'),
      date: values.date ? '' : t('notifications.validation.dateRequired'),
      subjectAr: values.subjectAr.trim() ? '' : t('notifications.validation.subjectArRequired'),
      subjectEn: values.subjectEn.trim() ? '' : t('notifications.validation.subjectEnRequired'),
      bodyAr: values.bodyAr.trim() ? '' : t('notifications.validation.bodyArRequired'),
      bodyEn: values.bodyEn.trim() ? '' : t('notifications.validation.bodyEnRequired'),
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
      employeeNames:
        values.employeeNames.length > 0 ? '' : t('notifications.validation.recipientNamesRequired'),
      date: values.date ? '' : t('notifications.validation.dateRequired'),
      subjectAr: values.subjectAr.trim() ? '' : t('notifications.validation.subjectArRequired'),
      subjectEn: values.subjectEn.trim() ? '' : t('notifications.validation.subjectEnRequired'),
      bodyAr: values.bodyAr.trim() ? '' : t('notifications.validation.bodyArRequired'),
      bodyEn: values.bodyEn.trim() ? '' : t('notifications.validation.bodyEnRequired'),
    };

    if (Object.values(nextErrors).some(Boolean)) {
      scrollToFirstError(nextErrors);
      return;
    }

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
        <FormField label={t('notifications.sentTo')} required error={errors.sentTo} name="sentTo">
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

        <FormField
          label={t('notifications.employeeNames')}
          required
          error={errors.employeeNames}
          name="employeeNames"
        >
          <CustomSelect
            isMulti
            value={values.employeeNames}
            onChange={(value) => patch({ employeeNames: Array.isArray(value) ? value : [value] })}
            options={employeeOptions}
            placeholder={isEmployeesLoading ? t('common.loading') : t('notifications.chooseNames')}
            disabled={!schoolBranchId || isEmployeesLoading}
            error={Boolean(errors.employeeNames)}
          />
        </FormField>

        <FormField label={t('notifications.date')} required error={errors.date} name="date">
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
          name="subjectAr"
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
          name="subjectEn"
        >
          <TextArea
            value={values.subjectEn}
            onChange={(event) => patch({ subjectEn: event.target.value })}
            rows={3}
            placeholder={t('notifications.enterSubject')}
          />
        </FormField>

        <FormField
          label={t('notifications.notificationContentAr')}
          required
          error={errors.bodyAr}
          name="bodyAr"
        >
          <TextArea
            value={values.bodyAr}
            onChange={(event) => patch({ bodyAr: event.target.value })}
            rows={4}
            placeholder={t('notifications.enterContent')}
          />
        </FormField>

        <FormField
          label={t('notifications.notificationContentEn')}
          required
          error={errors.bodyEn}
          name="bodyEn"
        >
          <TextArea
            value={values.bodyEn}
            onChange={(event) => patch({ bodyEn: event.target.value })}
            rows={4}
            placeholder={t('notifications.enterContent')}
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
