import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Attendance from './components/Attendance';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function AttendancePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'students');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const breadcrumbItems = [
    { label: t('sidebar.studentManagement') },
    { label: t('attendance.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="attendance.title"
        actions={
          activeTab === 'employees'
            ? [
                {
                  label: 'attendance.addAttendanceSchedule',
                  onClick: () => {},
                  imgSrc: PlusIcon,
                  imgClassName: 'w-[20px] h-[20px]',
                },
              ]
            : undefined
        }
      />

      {/* Main Content */}
      <Attendance onTabChange={setActiveTab} />
    </div>
  );
}
