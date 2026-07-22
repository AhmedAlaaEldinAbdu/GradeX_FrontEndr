import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import Modal from '@/shared/popups/Modal';
import CalendarInputIcon from '@gradex/assets/icons/CalendarInput.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import PeopleOutlineIcon from '@gradex/assets/icons/PeopleOutline.svg';
import UserIcon from '@gradex/assets/icons/User.svg';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';
import type { LiveClassRow } from '../components/live-classes-data';

type StartLiveClassPopupProps = {
  isOpen: boolean;
  liveClass: LiveClassRow | null;
  onClose: () => void;
  onStart: (meetingLink: string) => Promise<void> | void;
  isStarting?: boolean;
};

function DetailItem({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-start gap-2 text-right text-base font-normal text-[#646969]">
      <span
        aria-hidden
        className="h-4 w-4 shrink-0 bg-[#646969]"
        style={{
          maskImage: `url("${icon}")`,
          WebkitMaskImage: `url("${icon}")`,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
        }}
      />
      <span className="truncate">{value}</span>
    </div>
  );
}

export default function StartLiveClassPopup({
  isOpen,
  liveClass,
  onClose,
  onStart,
  isStarting = false,
}: StartLiveClassPopupProps) {
  const { t } = useTranslation();
  const [classLink, setClassLink] = useState('');
  const [linkError, setLinkError] = useState('');

  const handleClose = () => {
    setClassLink('');
    setLinkError('');
    onClose();
  };

  const handleStart = async () => {
    const meetingLink = classLink.trim();
    if (!meetingLink) {
      setLinkError(t('eLearning.liveClasses.popup.linkRequired'));
      return;
    }

    try {
      await onStart(meetingLink);
      handleClose();
    } catch {
      // Keep the popup open so the user can correct the link or retry.
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showHeader={false}
      size="md"
      contentClassName="p-8"
    >
      <div className="flex flex-col gap-12">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('common.close')}
            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-xl border border-[#CCCCCC] transition-opacity hover:opacity-80"
          >
            <CustomImage src={XmarkCircleGrayIcon} alt="" className="h-6 w-6" />
          </button>
          <h2 className="text-base font-medium text-[#0E1F1F]">
            {t('eLearning.liveClasses.popup.title')}
          </h2>
        </div>

        {liveClass && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-4">
              <h3 className="text-start text-lg font-medium leading-8 text-[#0E1F1F]">
                {t('eLearning.liveClasses.popup.subjectTitle', {
                  subject: liveClass.subject,
                })}
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem
                  icon={PeopleOutlineIcon}
                  value={`${liveClass.stage} - ${liveClass.classroom}`}
                />
                <DetailItem
                  icon={UserIcon}
                  value={t('eLearning.liveClasses.popup.teacherName', {
                    teacher: liveClass.teacherName,
                  })}
                />
                <DetailItem icon={CalendarInputIcon} value={liveClass.date} />
                <DetailItem
                  icon={ClockIcon}
                  value={`${liveClass.startsAt} - ${liveClass.endsAt}`}
                />
              </div>
            </div>

            <label className="flex flex-col items-start gap-2">
              <span className="flex items-center gap-1 text-sm font-normal text-[#3A3A3A]">
                <span className="text-red-500">*</span>
                {t('eLearning.liveClasses.popup.linkLabel')}
              </span>
              <input
                type="url"
                value={classLink}
                onChange={(event) => {
                  setClassLink(event.target.value);
                  setLinkError('');
                }}
                placeholder={t('eLearning.liveClasses.popup.linkPlaceholder')}
                disabled={isStarting}
                className={`h-12 w-full rounded-2xl border bg-white px-4 text-right text-sm font-normal text-[#3A3A3A] placeholder:text-[#646969] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                  linkError ? 'border-red-500' : 'border-[#DDE0E0]'
                }`}
              />
              {linkError && <span className="text-sm font-normal text-red-500">{linkError}</span>}
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isStarting}
            className="h-11 rounded-2xl border border-green-500 bg-white px-8 text-sm font-medium text-green-500 transition-colors hover:bg-green-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={isStarting}
            className="h-11 rounded-2xl bg-green-500 px-8 text-base font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStarting
              ? t('eLearning.liveClasses.popup.starting')
              : t('eLearning.liveClasses.startNow')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
