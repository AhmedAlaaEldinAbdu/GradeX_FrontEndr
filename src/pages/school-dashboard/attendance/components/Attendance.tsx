import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Tabs from '@/shared/components/Tabs';
import StudentsAttendanceTab from './StudentsAttendanceTab';
import EmployeesAttendanceTab from './EmployeesAttendanceTab';

interface AttendanceProps {
  onTabChange?: (tab: string) => void;
}

export default function Attendance({ onTabChange }: AttendanceProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'students');

  useEffect(() => {
    onTabChange?.(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const tabs = [
    {
      id: 'students',
      label: t('attendance.students'),
      content: <StudentsAttendanceTab isActive={activeTab === 'students'} />,
    },
    {
      id: 'employees',
      label: t('attendance.employees'),
      content: <EmployeesAttendanceTab isActive={activeTab === 'employees'} />,
    },
  ];

  return (
    <div>
      <div className="mb-5 w-full px-1">
        <div>
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={handleTabChange}
            variant="underline"
            listClassName="flex w-[100%] md:w-[75%] lg:w-[40%] gap-2 mb-5 px-1 flex-wrap"
            lazy={true}
            searchParamKey="tab"
          />
        </div>
      </div>
    </div>
  );
}
