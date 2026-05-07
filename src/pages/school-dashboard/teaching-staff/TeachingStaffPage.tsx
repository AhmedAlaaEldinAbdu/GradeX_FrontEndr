import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import { useAppSelector } from '@/hooks/useRedux';
import TeachingStaff from './components/TeachingStaff';

export default function TeachingStaffPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'teachers');
  const teachersCount = useAppSelector((state) => state.teachers.pagination.total);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Dynamic breadcrumb based on active tab
  const breadcrumbItems = [
    { label: t('sidebar.humanResources') },
    { label: t('sidebar.teachingStaff') },
    { label: activeTab === 'teachers' ? t('sidebar.teachers') : t('sidebar.administrators') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title={activeTab === 'teachers' ? 'teachers.title' : 'sidebar.administrators'}
        statistics={
          activeTab === 'teachers' ? { value: teachersCount, label: 'teachers.teacher' } : undefined
        }
        hasHeaderControls={true}
      />

      {/* Main Content */}
      <TeachingStaff onTabChange={setActiveTab} />
    </div>
  );
}
