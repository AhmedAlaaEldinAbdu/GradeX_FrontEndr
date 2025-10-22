import { t } from 'i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '@gradex/shared/components/FileUpload';
import MultiSelectTagInput from '@gradex/shared/components/MultiSelectTagInput';
import FormField from '@gradex/shared/components/FormField';
import type { MultiSelectOption } from '@gradex/shared/components/MultiSelectTagInput';

export default function AddNotification() {
  const navigate = useNavigate();
  const [sentTo, setSentTo] = useState('');
  const [recipientType, setRecipientType] = useState('');
  const [recipientNames, setRecipientNames] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<string>('');

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
      setAttachmentFile(file.name);
    }
  };

  const handleFileDelete = () => {
    setAttachmentFile('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      sentTo,
      recipientType,
      recipientNames,
      date,
      content,
      attachmentFile,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex flex-col gap-6">
        {/* مرسلة إلي */}
        <FormField label={t('notifications.sentTo')} required>
          <MultiSelectTagInput
            value={sentTo}
            onChange={setSentTo}
            options={sentToOptions}
            placeholder={t('notifications.selectRecipient')}
          />
        </FormField>

        {hasCountry && (
          <FormField label={t('notifications.recipientType')} required>
            <MultiSelectTagInput
              value={recipientType}
              onChange={setRecipientType}
              options={countryOptions}
              placeholder={t('notifications.selectRecipient')}
            />
          </FormField>
        )}

        {hasCity && (
          <FormField label={t('notifications.city')} required>
            <MultiSelectTagInput
              value={recipientNames}
              onChange={setRecipientNames}
              options={cityOptions}
              placeholder={t('notifications.selectRecipient')}
            />
          </FormField>
        )}

        {hasEmployees && (
          <FormField label={t('notifications.recipientNames')} required>
            <MultiSelectTagInput
              value={recipientNames}
              onChange={setRecipientNames}
              options={employeeOptions}
              placeholder={t('notifications.chooseNames')}
            />
          </FormField>
        )}

        <FormField label={t('notifications.date')} required>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-[42px] w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </FormField>

        <FormField label={t('notifications.notificationContent')} required>
          <textarea
            placeholder={t('notifications.enterContent')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </FormField>

        <FormField label={t('notifications.attachments')} optional>
          <FileUpload
            label=""
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.svg"
            onChange={handleFileChange}
            onDelete={handleFileDelete}
            fileName={attachmentFile}
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
          {t('common.send')}
        </button>
      </div>
    </form>
  );
}
