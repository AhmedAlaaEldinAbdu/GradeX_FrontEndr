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

export default function AddEmployeesNotificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const schoolBranchId = getCurrentSchoolBranchId() || '';
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

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
          onSubmit={async () => {
            setShowPopupMessage({
              show: true,
              type: 'success',
              message: t('notifications.notificationSent'),
            });
          }}
        />
      </div>

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        message={showPopupMessage.message}
        onClose={() => {
          setShowPopupMessage({ show: false, type: 'success', message: '' });
          if (showPopupMessage.type === 'success') {
            navigate('/settings/notifications?tab=employees');
          }
        }}
      />
    </>
  );
}
