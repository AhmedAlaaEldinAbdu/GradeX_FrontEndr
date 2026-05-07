import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import { useAppSelector } from '@/hooks/useRedux';
import Interviews from './components/Interviews';

export default function InterviewsPage() {
  const { t } = useTranslation();
  const interviewsCount = useAppSelector((state) => state.interviews.interviews.length);

  const breadcrumbItems = [
    { label: t('sidebar.humanResources') },
    { label: t('sidebar.teachingStaff') },
    { label: t('sidebar.interviews') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="interviews.title"
        statistics={{ value: interviewsCount, label: 'interviews.interviewCount' }}
      />

      {/* Main Content */}
      <Interviews />
    </div>
  );
}
