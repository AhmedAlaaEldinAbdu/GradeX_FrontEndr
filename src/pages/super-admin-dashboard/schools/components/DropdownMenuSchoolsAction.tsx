import { useState } from 'react';
import dotsIcon from '@gradex/assets/icons/Dots.svg';
import FilesIcon from '@gradex/assets/icons/Files.svg';
import CheckmarkCircleIcon from '@gradex/assets/icons/CheckmarkCircle.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { useTranslation } from 'react-i18next';
import EditRequestPopup from '../popups/EditRequestPopup';
import RejectSchoolPopup from '../popups/RejectSchoolPopup';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import PopupMessage from '@gradex/shared/components/PopupMessage';

export default function DropdownMenuSchoolsAction() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showEditRequestPopup, setShowEditRequestPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);

  const handleConfirmEditRequest = (message: string) => {
    console.log('Edit request message:', message);
    setShowEditRequestPopup(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
      >
        <img src={dotsIcon} alt="action" />
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <button
            onClick={() => setShowEditRequestPopup(true)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-gray-700 hover:bg-gray-100"
          >
            <img src={FilesIcon} alt="FilesIcon" className="" />
            <span>{t('schools.sendEditRequest')}</span>
          </button>
          <button
            onClick={() => setShowSuccessPopup(true)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-green-600 hover:bg-green-50"
          >
            <img src={CheckmarkCircleIcon} alt="CheckmarkIcon" className="" />
            <span>{t('actions.accept')}</span>
          </button>
          <button
            onClick={() => setShowRejectPopup(true)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-red-600 hover:bg-red-50"
          >
            <img src={XMarkDangerIcon} alt="XMarkIcon" className="" />
            <span>{t('actions.reject')}</span>
          </button>
        </div>
      )}
      {showEditRequestPopup && (
        <EditRequestPopup
          onCancel={() => setShowEditRequestPopup(false)}
          onConfirm={handleConfirmEditRequest}
        />
      )}{' '}
      {showRejectPopup && (
        <RejectSchoolPopup
          onCancel={() => setShowRejectPopup(false)}
          onConfirm={handleConfirmEditRequest}
        />
      )}
      {showSuccessPopup && (
        <PopupMessage
          type="success"
          message="schools.schoolAcceptedSuccessfully"
          iconSrc={BigSuccessIcon}
          autoClose={true}
          onClose={() => setShowSuccessPopup(false)}
        />
      )}
    </div>
  );
}
