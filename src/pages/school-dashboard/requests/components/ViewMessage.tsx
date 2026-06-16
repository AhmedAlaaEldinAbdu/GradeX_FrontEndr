import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import TextArea from '@/shared/components/TextArea';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';

import { schoolMessageApiService } from '@/services/api/requests/school-message.service';
import type { StudentMessageDto } from '@/services/api/requests/requests.types';

const formatRequestDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

type DetailRowProps = {
  label: string;
  children: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, children }) => (
  <div className="flex items-center gap-3">
    <span className="text-base font-normal text-[#3A3A3A]">{label}:</span>
    <div className="flex items-center gap-3">{children}</div>
  </div>
);

const ViewMessage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isArabic = i18n.language === 'ar';

  const [message, setMessage] = useState<StudentMessageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let isActive = true;
    const loadMessage = async () => {
      setIsLoading(true);
      try {
        const messages = await schoolMessageApiService.getMessageByStudentId(id);
        if (isActive) setMessage(messages[0] ?? null);
      } catch (error) {
        console.error('Failed to fetch student message:', error);
        if (isActive) setMessage(null);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    loadMessage();
    return () => {
      isActive = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loading />
      </div>
    );
  }

  if (!message) {
    return <NotFoundMessage message="common.noData" />;
  }

  const gradeName = isArabic ? message.gradeNameAr : message.gradeNameEN || message.gradeNameAr;
  const classroomName = isArabic
    ? message.classroomNameAr
    : message.classroomNameEN || message.classroomNameAr;
  const hasReply = Boolean(message.messageReply && message.messageReply.trim());

  const handleSubmit = () => {
    navigate('/requests?tab=messages');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Message details */}
      <Card className="rounded-2xl border border-[#DDE0E0]" padding="md">
        <div className="flex flex-col items-start gap-6">
          <h3 className="text-base font-normal text-[#0E1F1F]">
            {t('requests.viewMessage.messageTitle')}
          </h3>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <DetailRow label={t('requests.filters.sentFrom')}>
              <span className="text-sm font-normal text-[#646969]">{message.sender}</span>
            </DetailRow>

            <DetailRow label={t('requests.filters.sentTo')}>
              <span className="text-sm font-normal text-[#646969]">{message.reciver}</span>
            </DetailRow>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <DetailRow label={t('requests.messageContent')}>
              <span className="text-sm font-normal text-[#646969]">{message.message}</span>
            </DetailRow>

            <DetailRow label={t('requests.viewMessage.sendDate')}>
              <span className="text-sm font-normal text-[#646969]">
                {formatRequestDate(message.createdAt)}
              </span>
            </DetailRow>
          </div>

          {gradeName ? (
            <DetailRow label={t('requests.popup.grade')}>
              <span className="text-sm font-normal text-[#646969]">{gradeName}</span>
            </DetailRow>
          ) : null}

          {classroomName ? (
            <DetailRow label={t('requests.viewMessage.classroom')}>
              <span className="rounded-lg bg-[#DFF8ED] px-3 py-1.5 text-sm font-normal text-[#646969]">
                {classroomName}
              </span>
            </DetailRow>
          ) : null}
        </div>
      </Card>

      {/* Reply */}
      <Card className="rounded-2xl" padding="md">
        <div className="flex flex-col items-start gap-8">
          <div className="w-full">
            <label className="mb-2 flex items-center gap-1 text-sm font-normal text-[#3A3A3A]">
              <span className="text-[#3A3A3A]">{t('requests.viewMessage.replyLabel')}</span>
              {!hasReply ? <span className="text-[#DD0417]">*</span> : null}
            </label>

            {hasReply ? (
              <p className="w-full rounded-2xl border border-[#DDE0E0] bg-[#F6F8F9] px-4 py-3 text-sm font-normal text-[#646969]">
                {message.messageReply}
              </p>
            ) : (
              <TextArea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={t('requests.viewMessage.replyPlaceholder')}
              />
            )}
          </div>

          {!hasReply ? (
            <div className="flex w-full items-center justify-end gap-4">
              <Button variant="outline" onClick={() => navigate('/requests?tab=messages')}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={!reply.trim()}>
                {t('requests.viewMessage.submit')}
              </Button>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default ViewMessage;
