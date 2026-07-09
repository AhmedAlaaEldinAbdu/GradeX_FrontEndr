import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import FileUpload from '@/shared/components/FileUpload';
import Input from '@/shared/components/Input';
import Loading from '@/shared/components/Loading';
import TextArea from '@/shared/components/TextArea';
import PopupMessage from '@/shared/popups/PopupMessage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import {
  clearCurrentStudentEarlyLeaveRequest,
  fetchStudentEarlyLeaveRequestById,
  updateStudentEarlyLeaveRequest,
} from '@/redux/features/studentRequestEarlyLeaveSlice';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

type FormErrors = Partial<Record<'date' | 'fromTime' | 'toTime' | 'reason' | 'form', string>>;

const toDateInputValue = (value?: string | null) => {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const [day, month, year] = value.split('/');
  if (day && month && year) {
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return '';
};

const toTimeInputValue = (value?: string | null) => {
  if (!value) return '';

  const match = value.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
  if (!match) return '';

  return `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}:${(match[3] ?? '00').padStart(
    2,
    '0'
  )}`;
};

const toUpdateDateValue = (value: string) => (value ? `${value}T00:00:00` : '');

const getAttachmentFileName = (value?: string | null) => {
  if (!value) return 'file';
  return value.split(/[\\/]/).pop() || value;
};

const EditEarlyLeaveRequestForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { currentRequest, isDetailsLoading, isUpdating } = useAppSelector(
    (state) => state.studentRequestEarlyLeave
  );

  const [date, setDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    if (id) {
      dispatch(fetchStudentEarlyLeaveRequestById(id));
    }

    return () => {
      dispatch(clearCurrentStudentEarlyLeaveRequest());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!currentRequest || currentRequest.id !== id) return;

    setDate(toDateInputValue(currentRequest.rawDate ?? currentRequest.date));
    setFromTime(toTimeInputValue(currentRequest.fromTime ?? currentRequest.time));
    setToTime(toTimeInputValue(currentRequest.toTime));
    setReason(currentRequest.reason ?? '');
    setAttachment(null);
    setErrors({});
  }, [currentRequest, id]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!date) nextErrors.date = t('requests.earlyLeave.validation.dateRequired');
    if (!fromTime) nextErrors.fromTime = t('requests.earlyLeave.validation.fromTimeRequired');
    if (!toTime) nextErrors.toTime = t('requests.earlyLeave.validation.toTimeRequired');
    if (!reason.trim()) nextErrors.reason = t('requests.earlyLeave.validation.reasonRequired');

    const schoolBranchId = currentRequest?.schoolBranchId || getCurrentSchoolBranchId();
    if (!id || !currentRequest?.studentId || !schoolBranchId) {
      nextErrors.form = t('requests.earlyLeave.validation.missingUpdateData');
    }

    setErrors(nextErrors);
    if (
      Object.keys(nextErrors).length > 0 ||
      !id ||
      !currentRequest?.studentId ||
      !schoolBranchId
    ) {
      return;
    }

    try {
      await dispatch(
        updateStudentEarlyLeaveRequest({
          Id: id,
          StudentId: currentRequest.studentId,
          SchoolBranchId: schoolBranchId,
          Date: toUpdateDateValue(date),
          FromTime: fromTime,
          ToTime: toTime,
          Reason: reason.trim(),
          Attachment: attachment,
        })
      ).unwrap();

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t('requests.earlyLeave.updatedSuccess'),
      });
    } catch (error) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: typeof error === 'string' ? error : t('common.errorOccurred'),
      });
    }
  };

  const isLoading = isDetailsLoading || !currentRequest || currentRequest.id !== id;
  const existingAttachments = currentRequest?.attachments
    ?.map((item) => {
      const filePath = item.filePath || item.url || item.file;
      if (!filePath) return null;

      return {
        fileName: item.name || getAttachmentFileName(filePath),
        filePath,
      };
    })
    .filter((item): item is { fileName: string; filePath: string } => Boolean(item));

  if (isLoading) {
    return (
      <Card className="rounded-2xl" padding="lg">
        <div className="flex justify-center py-10">
          <Loading />
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl" padding="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errors.form && <p className="text-center text-sm text-red-600">{errors.form}</p>}

        <Input
          type="date"
          label={t('requests.earlyLeave.date')}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          error={errors.date}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            type="time"
            step={1}
            label={t('requests.earlyLeave.fromTime')}
            value={fromTime}
            onChange={(event) => setFromTime(event.target.value)}
            error={errors.fromTime}
          />
          <Input
            type="time"
            step={1}
            label={t('requests.earlyLeave.toTime')}
            value={toTime}
            onChange={(event) => setToTime(event.target.value)}
            error={errors.toTime}
          />
        </div>

        <TextArea
          label={t('requests.earlyLeave.reason')}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={errors.reason}
        />

        <FileUpload
          label={t('requests.earlyLeave.attachment')}
          accept="application/pdf,image/*"
          onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
          onDelete={() => setAttachment(null)}
          fileName={attachment?.name}
          uploadText={t('requests.earlyLeave.uploadAttachment')}
          formatHints={['PDF', 'JPG', 'PNG']}
          id="earlyLeaveAttachment"
          attachments={!attachment && existingAttachments?.length ? existingAttachments : undefined}
        />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isUpdating}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isUpdating}>
            {isUpdating ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>

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

export default EditEarlyLeaveRequestForm;
