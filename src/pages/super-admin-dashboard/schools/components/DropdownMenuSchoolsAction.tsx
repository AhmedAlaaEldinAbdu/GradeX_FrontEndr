import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import FilesIcon from '@gradex/assets/icons/Files.svg';
import CheckmarkCircleIcon from '@gradex/assets/icons/CheckmarkCircle.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { useTranslation } from 'react-i18next';
import EditRequestPopup from '../popups/EditRequestPopup';
import RejectSchoolPopup from '../popups/RejectSchoolPopup';
import { ActionsDropdown } from '@/shared/components/components';
import {
  acceptSchoolApplication,
  rejectSchoolApplication,
  sendSchoolEditRequest,
} from '@gradex/redux/features/schools';
import { useToast } from '@/shared/context/ToastContext';

interface ActionProps {
  id: string;
  selectedTab: number;
  onActionComplete?: () => void;
}

export default function DropdownMenuSchoolsAction({
  id,
  selectedTab,
  onActionComplete,
}: ActionProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const [showEditRequestPopup, setShowEditRequestPopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmEditRequest = async (message: string) => {
    if (!message.trim()) {
      showToast({
        message: t('schools.editRequestMessageRequired'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setIsProcessing(true);
      await dispatch(sendSchoolEditRequest({ id, message })).unwrap();
      setShowEditRequestPopup(false);

      showToast({
        message: t('schools.editRequestSentSuccessfully'),
        type: 'success',
        duration: 3000,
      });

      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error('Failed to send edit request:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptSchool = async () => {
    try {
      setIsProcessing(true);
      await dispatch(acceptSchoolApplication(id)).unwrap();

      showToast({
        message: t('schools.schoolAcceptedSuccessfully'),
        type: 'success',
        duration: 3000,
      });

      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error('Failed to accept school:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSchool = async (rejectionReason: string) => {
    if (!rejectionReason.trim()) {
      showToast({
        message: t('schools.rejectionReasonRequired'),
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setIsProcessing(true);
      await dispatch(rejectSchoolApplication({ id, rejectionReason })).unwrap();
      setShowRejectPopup(false);

      showToast({
        message: t('schools.schoolRejectedSuccessfully'),
        type: 'success',
        duration: 3000,
      });

      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error('Failed to reject school:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const actions = [
    {
      id: 'edit',
      visible: [2, 3],
      label: t('schools.sendEditRequest'),
      icon: FilesIcon,
      color: 'text-blue-500 hover:bg-blue-100',
      onClick: () => setShowEditRequestPopup(true),
    },
    {
      id: 'accept',
      visible: [2, 3],
      label: t('actions.accept'),
      icon: CheckmarkCircleIcon,
      color: 'text-green-500 hover:bg-green-100',
      onClick: handleAcceptSchool,
      disabled: isProcessing,
    },
    {
      id: 'reject',
      visible: [1, 2],
      label: t('actions.reject'),
      icon: XMarkDangerIcon,
      color: 'text-red-500 hover:bg-red-100',
      onClick: () => setShowRejectPopup(true),
      disabled: isProcessing,
    },
  ];

  return (
    <div className="relative inline-block text-left">
      <ActionsDropdown
        actions={actions.filter((action) => action?.visible?.includes(selectedTab))}
        dropdownClassName="absolute z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
      />
      <EditRequestPopup
        open={showEditRequestPopup}
        onCancel={() => setShowEditRequestPopup(false)}
        onConfirm={handleConfirmEditRequest}
        isProcessing={isProcessing}
      />
      <RejectSchoolPopup
        open={showRejectPopup}
        onCancel={() => setShowRejectPopup(false)}
        onConfirm={handleRejectSchool}
        isProcessing={isProcessing}
      />
    </div>
  );
}
