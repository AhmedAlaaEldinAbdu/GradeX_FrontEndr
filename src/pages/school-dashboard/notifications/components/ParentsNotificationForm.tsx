import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import FileUpload from '@/shared/components/FileUpload';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';

export type ParentsNotificationFormValues = {
  sentTo: string;
  parentNames: string[];
  date: string;
  subjectAr: string;
  subjectEn: string;
  attachments: File[];
};

type ParentsNotificationFormProps = {
  mode: 'add' | 'edit';
  initialValues?: Partial<ParentsNotificationFormValues>;
  onCancel?: () => void;
  onSubmit?: (values: ParentsNotificationFormValues) => void | Promise<void>;
};

type ParentsNotificationFormErrors = Partial<
  Record<'sentTo' | 'date' | 'subjectAr' | 'subjectEn', string>
>;

export default function ParentsNotificationForm({
  mode,
  initialValues,
  onCancel,
  onSubmit,
}: ParentsNotificationFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const parentOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: 'all', label: t('notifications.selectAll') },
      { value: 'ahmed-moataz', label: t('notifications.mock.parentName') },
      { value: 'mohamed-essam', label: t('notifications.mock.parentNameTwo') },
      { value: 'ahmed-zahrani', label: t('notifications.mock.parentNameThree') },
      { value: 'saleh-ali', label: t('notifications.mock.parentNameFour') },
    ],
    [t]
  );

  const [values, setValues] = useState<ParentsNotificationFormValues>({
    sentTo: initialValues?.sentTo ?? 'parents',
    parentNames: initialValues?.parentNames ?? ['all'],
    date: initialValues?.date ?? '2025-02-22',
    subjectAr: initialValues?.subjectAr ?? '',
    subjectEn: initialValues?.subjectEn ?? '',
    attachments: initialValues?.attachments ?? [],
  });

  const errors = useMemo<ParentsNotificationFormErrors>(() => {
    if (!submitAttempted) return {};

    return {
      sentTo: values.sentTo ? '' : t('notifications.validation.sentToRequired'),
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

  const patch = (partial: Partial<ParentsNotificationFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitAttempted(true);

    const nextErrors = {
      sentTo: values.sentTo ? '' : t('notifications.validation.sentToRequired'),
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
            options={[{ value: 'parents', label: t('notifications.tabs.parents') }]}
            placeholder={t('notifications.selectRecipient')}
            showSearch={false}
            error={Boolean(errors.sentTo)}
          />
        </FormField>

        <FormField label={t('notifications.parentNames')}>
          <CustomSelect
            isMulti
            value={values.parentNames}
            onChange={(value) => patch({ parentNames: Array.isArray(value) ? value : [value] })}
            options={parentOptions}
            placeholder={t('notifications.chooseNames')}
            showSearch={false}
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
