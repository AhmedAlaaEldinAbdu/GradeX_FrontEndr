import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import ClockYellowBoldIcon from '@gradex/assets/icons/ClockYellowBold.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import TaskBlueIcon from '@gradex/assets/icons/TaskBlue.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchTeacherRequestsSummary } from '@/redux/features/teacher-requests/teacherRequestsSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

import JobApplicationsTab from './components/JobApplicationsTab';
import MessagesTab from './components/MessagesTab';

const AdminRequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { summary } = useAppSelector((state) => state.teacherRequests);

  const schoolBranchId = getCurrentSchoolBranchId();

  useEffect(() => {
    if (schoolBranchId) {
      dispatch(fetchTeacherRequestsSummary({ SchoolBranchId: schoolBranchId }));
    }
  }, [dispatch, schoolBranchId]);

  const acceptedPercentage = summary?.totalRequests
    ? Math.round((summary.acceptedRequests / summary.totalRequests) * 100)
    : 0;

  const stats = {
    total: summary?.totalRequests ?? 0,
    rejected: summary?.rejectedRequests ?? 0,
    acceptedPercentage,
    pending: summary?.pendingRequests ?? 0,
  };

  const breadcrumbItems = [
    { label: t('sidebar.humanResources') },
    { label: t('sidebar.adminRequests') },
  ];

  const tabs: TabItem[] = [
    {
      id: 'job-application',
      label: t('adminRequests.tabs.jobApplication'),
      content: <JobApplicationsTab />,
    },
    // {
    //   id: 'application-archive',
    //   label: t('adminRequests.tabs.applicationArchive'),
    //   content: <TabPlaceholder />,
    // },
    // {
    //   id: 'schedule-interview',
    //   label: t('adminRequests.tabs.scheduleInterview'),
    //   content: <TabPlaceholder />,
    // },
    // { id: 'early-leave', label: t('adminRequests.tabs.earlyLeave'), content: <TabPlaceholder /> },
    // { id: 'leave', label: t('adminRequests.tabs.leave'), content: <TabPlaceholder /> },
    // {
    //   id: 'contract-authentication',
    //   label: t('adminRequests.tabs.contractAuthentication'),
    //   content: <TabPlaceholder />,
    // },
    { id: 'messages', label: t('adminRequests.tabs.messages'), content: <MessagesTab /> },
    // { id: 'notes', label: t('adminRequests.tabs.notes'), content: <TabPlaceholder /> },
    // {
    //   id: 'teacher-notes',
    //   label: t('adminRequests.tabs.teacherNotes'),
    //   content: <TabPlaceholder />,
    // },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="adminRequests.title" hasHeaderControls={true} />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('adminRequests.totalCount')}
          value={stats.total}
          icon={<CustomImage src={TaskBlueIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E7F2FB]"
        />
        <MetricCard
          title={t('adminRequests.rejectedCount')}
          value={stats.rejected}
          icon={<CustomImage src={XmarkCircleRedIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#FCE8E8]"
        />
        <MetricCard
          title={t('adminRequests.acceptedCount')}
          value={stats.acceptedPercentage}
          percentage
          icon={<CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E8F4EE]"
        />
        <MetricCard
          title={t('adminRequests.pendingCount')}
          value={stats.pending}
          icon={<CustomImage src={ClockYellowBoldIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#FDF6E0]"
        />
      </div>

      <div className="relative mb-4">
        <Tabs
          items={tabs}
          defaultValue="job-application"
          searchParamKey="tab"
          listClassName="flex w-full mb-5 overflow-x-auto"
        />
      </div>
    </div>
  );
};

export default AdminRequestsPage;
