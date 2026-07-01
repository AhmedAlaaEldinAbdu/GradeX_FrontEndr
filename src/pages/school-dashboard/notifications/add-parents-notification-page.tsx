import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PopupMessage from '@/shared/popups/PopupMessage';
import ParentsNotificationForm from './components/ParentsNotificationForm';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { SchoolNotificationTarget } from '@/services/api/types/school-notification.types';
import { useAppDispatch } from '@/hooks/useRedux';
import { sendSchoolNotification } from '@/redux/features/schoolNotificationsSlice';
import { getNotificationErrorMessage } from './utils/notification-error-message';

export default function AddParentsNotificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const schoolBranchId = getCurrentSchoolBranchId() || '';
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isRaw: boolean;
  }>({ show: false, type: 'success', message: '', isRaw: false });

  const breadcrumbItems = [
    { label: t('sidebar.systemSettings') },
    { label: t('sidebar.settings') },
    { label: t('sidebar.notifications'), path: '/settings/notifications?tab=parents' },
    { label: t('notifications.sendNotification') },
  ];

  return (
    <>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader title="notifications.sendNotification" />
        <ParentsNotificationForm
          mode="add"
          schoolBranchId={schoolBranchId}
          onCancel={() => navigate('/settings/notifications?tab=parents')}
          onSubmit={async (values) => {
            if (!schoolBranchId) {
              setShowPopupMessage({
                show: true,
                type: 'error',
                message: 'common.errorOccurred',
                isRaw: false,
              });
              return;
            }

            try {
              await dispatch(
                sendSchoolNotification({
                  schoolBranchId,
                  targets: SchoolNotificationTarget.Parents,
                  titleAr: values.subjectAr.trim(),
                  titleEn: values.subjectEn.trim(),
                  bodyAr: values.bodyAr.trim(),
                  bodyEn: values.bodyEn.trim(),
                  gradeIds: values.educationalStages,
                  classroomIds: values.classrooms,
                  studentIds: values.studentIds,
                  attachments: values.attachments,
                })
              ).unwrap();

              setShowPopupMessage({
                show: true,
                type: 'success',
                message: 'notifications.notificationSent',
                isRaw: false,
              });
            } catch (error) {
              setShowPopupMessage({
                show: true,
                type: 'error',
                message: getNotificationErrorMessage(error, t('common.errorOccurred')),
                isRaw: true,
              });
            }
          }}
        />
      </div>

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        message={showPopupMessage.message}
        isMessageRaw={showPopupMessage.isRaw}
        onClose={() => {
          setShowPopupMessage({ show: false, type: 'success', message: '', isRaw: false });
          if (showPopupMessage.type === 'success') {
            navigate('/settings/notifications?tab=parents');
          }
        }}
      />
    </>
  );
}
