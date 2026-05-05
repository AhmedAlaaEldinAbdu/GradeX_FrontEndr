import { t } from 'i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FileUpload from '@gradex/shared/components/FileUpload';
import MultiSelectTagInput from '@gradex/shared/components/MultiSelectTagInput';
import FormField from '@gradex/shared/components/FormField';
import TextArea from '@gradex/shared/components/TextArea';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import type { MultiSelectOption } from '@gradex/shared/components/MultiSelectTagInput';
import { NotificationSchema } from '@gradex/validations/notifications-validations';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';

interface NotificationFormProps {
  mode: 'add' | 'edit';
  initialData?: {
    sentTo?: string;
    recipientType?: string;
    recipientNames?: string;
    date?: string;
    content?: string;
    attachmentFile?: string;
  };
}

export default function NotificationForm({ mode, initialData }: NotificationFormProps) {
  const navigate = useNavigate();
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(NotificationSchema),
    defaultValues: {
      sentTo: initialData?.sentTo || '',
      recipientType: initialData?.recipientType || '',
      recipientNames: initialData?.recipientNames || '',
      date: initialData?.date || '',
      content: initialData?.content || '',
      attachmentFile: initialData?.attachmentFile || '',
    },
  });

  const scrollToFirstError = useScrollToFirstError();

  const sentTo = watch('sentTo');
  const attachmentFile = watch('attachmentFile');

  const sentToOptions: MultiSelectOption[] = [
    { value: 'دولة', label: 'دولة' },
    { value: 'مدينة', label: 'مدينة' },
    { value: 'موظفين', label: 'موظفين' },
  ];

  const countryOptions: MultiSelectOption[] = [
    { value: 'قطر', label: 'قطر' },
    { value: 'مصر', label: 'مصر' },
  ];

  const cityOptions: MultiSelectOption[] = [
    { value: 'الرياض', label: 'الرياض' },
    { value: 'القاهرة', label: 'القاهرة' },
  ];

  const employeeOptions: MultiSelectOption[] = [
    { value: 'الكل', label: 'الكل' },
    { value: 'موظف 1', label: 'موظف 1' },
    { value: 'موظف 2', label: 'موظف 2' },
  ];

  const selectedSentToOptions = sentTo.split(',').filter((v) => v.trim());
  const hasCountry = selectedSentToOptions.includes('دولة');
  const hasCity = selectedSentToOptions.includes('مدينة');
  const hasEmployees = selectedSentToOptions.includes('موظفين');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('attachmentFile', file.name);
    }
  };

  const handleFileDelete = () => {
    setValue('attachmentFile', '');
  };

  const onSubmit = (data: Record<string, unknown>) => {
    console.log(data);
    // TODO: Add API call here
    setShowPopupMessage({ show: true, type: 'success', message: t(successMessage) });
  };

  const handleClosePopup = () => {
    setShowPopupMessage({ show: false, type: 'success', message: '' });
    navigate('/notifications');
  };

  const successMessage =
    mode === 'add' ? 'notifications.notificationSent' : 'notifications.notificationEdited';
  const submitButtonText = mode === 'add' ? 'common.send' : 'common.edit';

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex flex-col gap-6">
          {/* مرسلة إلي */}
          <FormField
            label={t('notifications.sentTo')}
            required
            error={errors.sentTo?.message && t(errors.sentTo.message)}
          >
            <Controller
              name="sentTo"
              control={control}
              render={({ field }) => (
                <MultiSelectTagInput
                  value={field.value}
                  onChange={field.onChange}
                  options={sentToOptions}
                  placeholder={t('notifications.selectRecipient')}
                  error={!!errors.sentTo}
                />
              )}
            />
          </FormField>

          {hasCountry && (
            <FormField
              label={t('notifications.recipientType')}
              required
              error={errors.recipientType?.message && t(errors.recipientType.message)}
            >
              <Controller
                name="recipientType"
                control={control}
                render={({ field }) => (
                  <MultiSelectTagInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={countryOptions}
                    placeholder={t('notifications.selectRecipient')}
                    error={!!errors.recipientType}
                  />
                )}
              />
            </FormField>
          )}

          {hasCity && (
            <FormField
              label={t('notifications.city')}
              required
              error={errors.recipientNames?.message && t(errors.recipientNames.message)}
            >
              <Controller
                name="recipientNames"
                control={control}
                render={({ field }) => (
                  <MultiSelectTagInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={cityOptions}
                    placeholder={t('notifications.selectRecipient')}
                    error={!!errors.recipientNames}
                  />
                )}
              />
            </FormField>
          )}

          {hasEmployees && (
            <FormField
              label={t('notifications.recipientNames')}
              required
              error={errors.recipientNames?.message && t(errors.recipientNames.message)}
            >
              <Controller
                name="recipientNames"
                control={control}
                render={({ field }) => (
                  <MultiSelectTagInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={employeeOptions}
                    placeholder={t('notifications.chooseNames')}
                    error={!!errors.recipientNames}
                  />
                )}
              />
            </FormField>
          )}

          <FormField
            label={t('notifications.date')}
            required
            error={errors.date?.message && t(errors.date.message)}
          >
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  className="h-[42px] w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              )}
            />
          </FormField>

          <FormField
            label={t('notifications.notificationContent')}
            required
            error={errors.content?.message && t(errors.content.message)}
          >
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextArea
                  placeholder={t('notifications.enterContent')}
                  value={field.value}
                  onChange={field.onChange}
                  rows={4}
                />
              )}
            />
          </FormField>

          <FormField label={t('notifications.attachments')} optional>
            <FileUpload
              label=""
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.svg"
              onChange={handleFileChange}
              onDelete={handleFileDelete}
              fileName={attachmentFile || ''}
              uploadText={t('notifications.uploadAttachments')}
              formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
            />
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-green-700 px-6 py-2 text-green-700 hover:bg-green-50"
            onClick={() => navigate(-1)}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
          >
            {t(submitButtonText)}
          </button>
        </div>
      </form>

      {/* Success Popup */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        duration={1000}
        onClose={handleClosePopup}
      />
    </>
  );
}
