import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PopupMessage from '@/shared/popups/PopupMessage';
import EmployeesNotificationForm from './components/EmployeesNotificationForm';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { schoolNotificationApiService } from '@/services/api/school-notification/school-notification.service';
import { SchoolNotificationTarget } from '@/services/api/types/school-notification.types';
import {
  getNotificationRequestErrorMessage,
  getNotificationResponseErrorMessage,
} from './utils/notification-error-message';

export default function AddEmployeesNotificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    { label: t('sidebar.notifications'), path: '/settings/notifications?tab=employees' },
    { label: t('notifications.sendNotification') },
  ];

  return (
    <>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader title="notifications.sendNotification" />
        <EmployeesNotificationForm
          mode="add"
          schoolBranchId={schoolBranchId}
          onCancel={() => navigate('/settings/notifications?tab=employees')}
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
              const response = await schoolNotificationApiService.sendSchoolNotification({
                schoolBranchId,
                targets: SchoolNotificationTarget.Employees,
                titleAr: values.subjectAr.trim(),
                titleEn: values.subjectEn.trim(),
                bodyAr: values.bodyAr.trim(),
                bodyEn: values.bodyEn.trim(),
                teacherUserIds: values.employeeNames,
                attachments: values.attachments,
              });

              if (response?.isSuccess === false) {
                setShowPopupMessage({
                  show: true,
                  type: 'error',
                  message: getNotificationResponseErrorMessage(response, t('common.errorOccurred')),
                  isRaw: true,
                });
                return;
              }

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
                message: getNotificationRequestErrorMessage(error, t('common.errorOccurred')),
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
            navigate('/settings/notifications?tab=employees');
          }
        }}
      />
    </>
  );
}
