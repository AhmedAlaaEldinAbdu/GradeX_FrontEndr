import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchDashboardMetrics } from '@/redux/features/control-panel/controlPanelSlice';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import RegistrationRequestsTable from './components/RegistrationRequestsTable';
import PersonalInterviewsTable from './components/PersonalInterviewsTable';
import FilesFillGreenIcon from '@gradex/assets/icons/FilesFillGreen.svg';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import DocumentEditIcon from '@gradex/assets/icons/DocumentEdit.svg';

const StudentApplicationsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const dashboardMetrics = useAppSelector((state) => state.controlPanel.dashboardMetrics);
  const applicationsPagination = useAppSelector((state) => state.studentApplications.pagination);
  const interviewsPagination = useAppSelector((state) => state.studentInterviews.pagination);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
  }, [dispatch]);

  const breadcrumbItems = [
    { label: t('sidebar.studentManagement') },
    { label: t('studentApplications.title') },
  ];

  const stats = {
    total: applicationsPagination.totalItems,
    accepted: dashboardMetrics?.totalStudentApplications.totalAcceptance ?? 0,
    notPassed: dashboardMetrics?.totalStudentApplications.totalRejection ?? 0,
    underEdit: dashboardMetrics?.totalStudentApplications.totalMissingData ?? 0,
    interviews: interviewsPagination.totalItems,
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="studentApplications.title" />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('studentApplications.applicationsCount')}
          value={stats.total}
          icon={<CustomImage src={FilesFillGreenIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E8F4EE]"
        />
        <MetricCard
          title={t('studentApplications.acceptedCount')}
          value={stats.accepted}
          icon={<CustomImage src={CheckCircleIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E8F4EE]"
        />
        <MetricCard
          title={t('studentApplications.notPassedCount')}
          value={stats.notPassed}
          icon={<CustomImage src={XmarkCircleRedIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#FCE8E8]"
        />
        <MetricCard
          title={t('studentApplications.underEditCount')}
          value={stats.underEdit}
          icon={<CustomImage src={DocumentEditIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E7F2FB]"
        />
      </div>

      <PageHeader title="studentApplications.applicationsTitle" />
      <div className="mb-8">
        <RegistrationRequestsTable />
      </div>

      <PageHeader
        title="studentApplications.interviewsTitle"
        statistics={{
          value: stats.interviews,
          label: 'studentApplications.interviewsCount',
        }}
      />
      <div>
        <PersonalInterviewsTable />
      </div>
    </div>
  );
};

export default StudentApplicationsPage;
