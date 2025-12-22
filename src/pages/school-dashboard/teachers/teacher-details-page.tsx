import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import { mockTeacherDetails } from './data/mockTeacherData';
import PersonalDataTab from './components/PersonalDataTab';
import AttendanceTab from './components/AttendanceTab';
import EducationalStagesTab from './components/EducationalStagesTab';

export default function TeacherDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const teacher = mockTeacherDetails;

  const breadcrumbItems = [
    { label: t('sidebar.teachingStaff') },
    { label: t('teachers.title'), path: '/teachers' },
    { label: teacher.fullName },
  ];

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'personal-data');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const tabItems: TabItem[] = [
    {
      id: 'personal-data',
      label: t('teachers.details.personalData'),
      content: <PersonalDataTab teacher={teacher} />,
    },
    {
      id: 'attendance',
      label: t('teachers.details.attendance'),
      content: <AttendanceTab teacherId={id || ''} isActive={activeTab === 'attendance'} />,
    },
    {
      id: 'educational-stages',
      label: t('teachers.details.educationalStagesAndClassrooms'),
      content: (
        <EducationalStagesTab teacherId={id || ''} isActive={activeTab === 'educational-stages'} />
      ),
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Teacher Name Title */}
      <div className="mb-6">
        <h1 className="text-start text-2xl font-bold text-gray-900">{teacher.fullName}</h1>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabItems}
        value={activeTab}
        onChange={handleTabChange}
        searchParamKey="tab"
        className="w-full"
        listClassName="flex gap-1 border-b border-gray-200"
        tabClassName="px-4 py-2 text-sm font-medium transition-colors duration-200 text-gray-500 hover:text-primary-600 focus:outline-none whitespace-nowrap"
        activeTabClassName="border-b-2 border-primary-600 text-primary-600"
        panelClassName="mt-6"
        lazy={true}
      />
    </div>
  );
}
