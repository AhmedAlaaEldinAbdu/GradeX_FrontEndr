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
import { acceptSchoolApplication, rejectSchoolApplication } from '@gradex/redux/features/schools';
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

  const handleConfirmEditRequest = (message: string) => {
    console.log('Edit request message:', message);
    setShowEditRequestPopup(false);
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
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: () => setShowEditRequestPopup(true),
    },
    {
      id: 'accept',
      visible: [2, 3],
      label: t('actions.accept'),
      icon: CheckmarkCircleIcon,
      color: 'text-green-600 hover:bg-green-50',
      onClick: handleAcceptSchool,
      disabled: isProcessing,
    },
    {
      id: 'reject',
      visible: [1, 2],
      label: t('actions.reject'),
      icon: XMarkDangerIcon,
      color: 'text-red-600 hover:bg-red-50',
      onClick: () => setShowRejectPopup(true),
      disabled: isProcessing,
    },
  ];

  return (
    <div className="relative inline-block text-left">
      <ActionsDropdown
        actions={actions.filter((action) => action?.visible?.includes(selectedTab))}
        dropdownClassName="absolute left-0 z-10 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
      />
      {showEditRequestPopup && (
        <EditRequestPopup
          onCancel={() => setShowEditRequestPopup(false)}
          onConfirm={handleConfirmEditRequest}
        />
      )}
      {showRejectPopup && (
        <RejectSchoolPopup
          onCancel={() => setShowRejectPopup(false)}
          onConfirm={handleRejectSchool}
        />
      )}
    </div>
  );
}
