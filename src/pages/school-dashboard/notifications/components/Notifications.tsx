import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CustomImage from '@/shared/components/CustomImage';
import MetricCard from '@/shared/components/MetricCard';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import PeopleSolidIcon from '@gradex/assets/icons/PeopleSolid.svg';
import TeachersYellowIcon from '@gradex/assets/icons/TeachersYellow.svg';
import EmployeesTab from './EmployeesTab';
import ParentsTab from './ParentsTab';
import type { SchoolNotificationMetrics } from '@/services/api/types/school-notification.types';

function BellIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.0005 24C13.4392 24 14.6781 23.131 15.2217 21.8906H8.7793C9.32291 23.131 10.5619 24 12.0005 24Z"
        fill="currentColor"
      />
      <path
        d="M19.2657 11.6185V10.0781C19.2657 6.80522 17.0902 4.0312 14.1094 3.12516V2.10938C14.1094 0.946266 13.1632 0 12.0001 0C10.8369 0 9.89068 0.946266 9.89068 2.10938V3.12516C6.9099 4.0312 4.73443 6.80517 4.73443 10.0781V11.6185C4.73443 14.4935 3.63859 17.2195 1.64879 19.2946C1.45379 19.4979 1.39899 19.798 1.50952 20.0571C1.62005 20.3162 1.87459 20.4844 2.1563 20.4844H21.8438C22.1255 20.4844 22.38 20.3162 22.4905 20.0571C22.6011 19.798 22.5463 19.4979 22.3513 19.2946C20.3615 17.2195 19.2657 14.4934 19.2657 11.6185ZM12.7032 2.84663C12.4718 2.82431 12.2372 2.8125 12.0001 2.8125C11.7629 2.8125 11.5284 2.82431 11.2969 2.84663V2.10938C11.2969 1.72167 11.6124 1.40625 12.0001 1.40625C12.3878 1.40625 12.7032 1.72167 12.7032 2.10938V2.84663Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Notifications() {
  const { t } = useTranslation();
  const [notificationMetrics, setNotificationMetrics] = useState<SchoolNotificationMetrics>({
    totalNotifications: 0,
    totalTeacherNotifications: 0,
    totalParentNotifications: 0,
  });

  const handleMetricsChange = useCallback((metrics: SchoolNotificationMetrics) => {
    setNotificationMetrics((previousMetrics) => {
      if (
        previousMetrics.totalNotifications === metrics.totalNotifications &&
        previousMetrics.totalTeacherNotifications === metrics.totalTeacherNotifications &&
        previousMetrics.totalParentNotifications === metrics.totalParentNotifications
      ) {
        return previousMetrics;
      }

      return metrics;
    });
  }, []);

  const metrics = [
    {
      title: t('notifications.stats.total'),
      value: notificationMetrics.totalNotifications,
      icon: <BellIcon className="h-6 w-6 text-[#0A6FC2]" />,
      iconClassName: 'bg-[#E7F2FB]',
    },
    {
      title: t('notifications.stats.employees'),
      value: notificationMetrics.totalTeacherNotifications,
      icon: <CustomImage src={TeachersYellowIcon} alt="" className="h-6 w-6" />,
      iconClassName: 'bg-[#FDF6E0]',
    },
    {
      title: t('notifications.stats.parents'),
      value: notificationMetrics.totalParentNotifications,
      icon: <CustomImage src={PeopleSolidIcon} alt="" className="h-6 w-6" />,
      iconClassName: 'bg-[#E8F4EE]',
    },
  ];

  const tabs: TabItem[] = [
    // {
    //   id: 'drivers',
    //   label: t('notifications.tabs.drivers'),
    //   content: <EmployeesTab audience="drivers" items={mockNotifications.drivers} />,
    // },
    {
      id: 'employees',
      label: t('notifications.tabs.employees'),
      content: <EmployeesTab audience="employees" onMetricsChange={handleMetricsChange} />,
    },
    {
      id: 'parents',
      label: t('notifications.tabs.parents'),
      content: <ParentsTab onMetricsChange={handleMetricsChange} />,
    },
  ];

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            iconClassName={metric.iconClassName}
            className="min-h-[6.875rem]"
          />
        ))}
      </div>

      <Tabs
        items={tabs}
        defaultValue="employees"
        variant="underline"
        lazy={true}
        searchParamKey="tab"
        listClassName="flex w-full mb-5 overflow-x-auto"
      />
    </div>
  );
}
