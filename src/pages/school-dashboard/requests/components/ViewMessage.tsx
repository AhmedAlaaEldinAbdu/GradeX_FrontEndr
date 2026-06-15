import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import TextArea from '@/shared/components/TextArea';
import CustomImage from '@/shared/components/CustomImage';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';

import { MOCK_MESSAGE_REQUESTS } from '../requests.mock';

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

const EyeBadge: React.FC<{ label: string }> = ({ label }) => (
  <span
    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#117BD71A]"
    aria-label={label}
  >
    <CustomImage src={EyeStyledIcon} alt={label} className="h-6 w-6" />
  </span>
);

const ViewMessage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [reply, setReply] = useState('');

  const request = MOCK_MESSAGE_REQUESTS.find((item) => item.id === id) ?? null;

  if (!request) {
    return <NotFoundMessage message="common.noData" />;
  }

  const handleSubmit = () => {
    navigate('/requests');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Message details */}
      <Card className="rounded-2xl border border-[#DDE0E0]" padding="md">
        <div className="flex flex-col items-start gap-6">
          <h3 className="text-base font-normal text-[#0E1F1F]">
            {t('requests.viewMessage.messageTitle')} 1
          </h3>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <DetailRow label={t('requests.filters.sentFrom')}>
              <span className="text-sm font-normal text-[#646969]">{request.senderName}</span>
              {request.senderAvatarPath ? (
                <CustomImage
                  src={request.senderAvatarPath}
                  alt={request.senderName}
                  className="h-[45px] w-[45px] rounded-lg border border-[#DDE0E0] object-cover"
                />
              ) : null}
              <EyeBadge label={t('requests.requestPreview')} />
            </DetailRow>

            <DetailRow label={t('requests.filters.sentTo')}>
              <span className="text-sm font-normal text-[#646969]">{request.recipientName}</span>
            </DetailRow>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <DetailRow label={t('requests.messageContent')}>
              <span className="text-sm font-normal text-[#646969]">{request.messageContent}</span>
            </DetailRow>

            <DetailRow label={t('requests.viewMessage.sendDate')}>
              <span className="text-sm font-normal text-[#646969]">
                {formatRequestDate(request.created)}
              </span>
            </DetailRow>
          </div>

          {request.educationalStage ? (
            <DetailRow label={t('requests.popup.grade')}>
              <span className="text-sm font-normal text-[#646969]">{request.educationalStage}</span>
            </DetailRow>
          ) : null}

          {request.classrooms && request.classrooms.length > 0 ? (
            <DetailRow label={t('requests.viewMessage.classroom')}>
              <div className="flex flex-wrap items-center gap-2">
                {request.classrooms.map((classroom) => (
                  <span
                    key={classroom}
                    className="rounded-lg bg-[#DFF8ED] px-3 py-1.5 text-sm font-normal text-[#646969]"
                  >
                    {classroom}
                  </span>
                ))}
              </div>
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
              <span className="text-[#DD0417]">*</span>
            </label>
            <TextArea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder={t('requests.viewMessage.replyPlaceholder')}
            />
          </div>

          <div className="flex w-full items-center justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/requests')}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!reply.trim()}>
              {t('requests.viewMessage.submit')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ViewMessage;
