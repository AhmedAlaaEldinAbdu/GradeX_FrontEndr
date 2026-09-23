import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAppSelector } from '@/hooks/useRedux';
import { EarlyLeaveStatus, MessageStatus } from '@/services/api/requests/requests.types';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import WhitePlusIcon from '@gradex/assets/icons/WhitePlus.svg';
import ClockYellowBoldIcon from '@gradex/assets/icons/ClockYellowBold.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import TaskBlueIcon from '@gradex/assets/icons/TaskBlue.svg';

import MessageRequestsTab from './components/MessageRequestsTab';
import EarlyLeaveRequestsTab from './components/EarlyLeaveRequestsTab';
import ReminderRequestsTab from './components/ReminderRequestsTab';
// import AddDelegateRequestsTab from './components/AddDelegateRequestsTab';
// import ContractAuthRequestsTab from './components/ContractAuthRequestsTab';
import ApplicationsTab from './components/ApplicationsTab';
import { useRoleAccess } from '@/hooks/useRoleAccess';

type RequestMetricCard = {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClassName: string;
};

const RequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { guardMutation } = useRoleAccess();
  const [searchParams] = useSearchParams();
  const { stats: applicationStats } = useAppSelector((state) => state.studentApplications);
  const { stats: earlyLeaveStats } = useAppSelector((state) => state.studentRequestEarlyLeave);
  const { stats: messageStats } = useAppSelector((state) => state.schoolMessages);
  const reminderTotal = useAppSelector((state) => state.requestAppointments.pagination.totalItems);

  // Get current tab from URL, default to 'applications'
  const currentTab = searchParams.get('tab') || 'applications';

  const getApplicationStatusCount = (status: StudentApplicationStatus) =>
    applicationStats.statusCounts.find((item) => Number(item.status) === status)?.count ?? 0;

  const getEarlyLeaveStatusCount = (status: EarlyLeaveStatus) =>
    earlyLeaveStats.statusCounts.find((item) => Number(item.status) === status)?.count ?? 0;

  const getMessageStatusCount = (status: MessageStatus) =>
    messageStats.statusCounts.reduce((total, item) => {
      const itemStatus = Number(item.status);
      const normalizedStatus = itemStatus === 0 ? MessageStatus.Pending : itemStatus;

      return normalizedStatus === status ? total + item.count : total;
    }, 0);

  const totalMetricCard = (value: number, title = t('requests.totalCount')): RequestMetricCard => ({
    title,
    value,
    icon: <CustomImage src={TaskBlueIcon} alt="" className="h-5 w-5" />,
    iconClassName: 'bg-[#E7F2FB]',
  });

  const rejectedMetricCard = (value: number): RequestMetricCard => ({
    title: t('requests.rejectedCount'),
    value,
    icon: <CustomImage src={XmarkCircleRedIcon} alt="" className="h-5 w-5" />,
    iconClassName: 'bg-[#FCE8E8]',
  });

  const acceptedMetricCard = (value: number): RequestMetricCard => ({
    title: t('requests.acceptedCount'),
    value,
    icon: <CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />,
    iconClassName: 'bg-[#E8F4EE]',
  });

  const pendingMetricCard = (value: number): RequestMetricCard => ({
    title: t('requests.pendingCount'),
    value,
    icon: <CustomImage src={ClockYellowBoldIcon} alt="" className="h-5 w-5" />,
    iconClassName: 'bg-[#FDF6E0]',
  });

  const metricCardsByTab: Record<string, RequestMetricCard[]> = {
    applications: [
      totalMetricCard(applicationStats.totalApplications),
      rejectedMetricCard(getApplicationStatusCount(StudentApplicationStatus.Reject)),
      acceptedMetricCard(getApplicationStatusCount(StudentApplicationStatus.Accept)),
      pendingMetricCard(getApplicationStatusCount(StudentApplicationStatus.Pending)),
    ],
    'early-leave': [
      totalMetricCard(earlyLeaveStats.totalRequests),
      rejectedMetricCard(getEarlyLeaveStatusCount(EarlyLeaveStatus.Rejected)),
      acceptedMetricCard(getEarlyLeaveStatusCount(EarlyLeaveStatus.Accepted)),
      pendingMetricCard(getEarlyLeaveStatusCount(EarlyLeaveStatus.Pending)),
    ],
    messages: [
      totalMetricCard(messageStats.totalMessages, t('requests.tabs.messages')),
      {
        title: t('requests.status.pending'),
        value: getMessageStatusCount(MessageStatus.Pending),
        icon: <CustomImage src={ClockYellowBoldIcon} alt="" className="h-5 w-5" />,
        iconClassName: 'bg-[#FDF6E0]',
      },
      {
        title: t('requests.status.sent'),
        value: getMessageStatusCount(MessageStatus.Sent),
        icon: <CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />,
        iconClassName: 'bg-[#E8F4EE]',
      },
      {
        title: t('requests.status.viewed'),
        value: getMessageStatusCount(MessageStatus.Viewed),
        icon: <CustomImage src={TaskBlueIcon} alt="" className="h-5 w-5" />,
        iconClassName: 'bg-[#E7F2FB]',
      },
      {
        title: t('requests.status.replied'),
        value: getMessageStatusCount(MessageStatus.Replied),
        icon: <CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />,
        iconClassName: 'bg-[#E8F4EE]',
      },
    ],
    reminder: [totalMetricCard(reminderTotal)],
  };

  const metricCards = metricCardsByTab[currentTab] ?? [
    totalMetricCard(0),
    rejectedMetricCard(0),
    acceptedMetricCard(0),
    pendingMetricCard(0),
  ];

  const breadcrumbItems = [{ label: t('sidebar.studentAffairs') }, { label: t('requests.title') }];

  const tabs: TabItem[] = [
    { id: 'applications', label: t('requests.tabs.applications'), content: <ApplicationsTab /> },
    {
      id: 'early-leave',
      label: t('requests.tabs.earlyLeave'),
      content: <EarlyLeaveRequestsTab />,
    },
    { id: 'messages', label: t('requests.tabs.messages'), content: <MessageRequestsTab /> },
    { id: 'reminder', label: t('requests.tabs.reminder'), content: <ReminderRequestsTab /> },
    // {
    //   id: 'add-delegate',
    //   label: t('requests.tabs.addDelegate'),
    //   content: <AddDelegateRequestsTab />,
    // },
    // {
    //   id: 'contract-authentication',
    //   label: t('requests.tabs.contractAuthentication'),
    //   content: <ContractAuthRequestsTab />,
    // },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="requests.title" hasHeaderControls={true} />

      <div
        className={`mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 ${
          currentTab === 'messages' ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-4'
        }`}
      >
        {metricCards.map((metricCard) => (
          <MetricCard
            key={metricCard.title}
            title={metricCard.title}
            value={metricCard.value}
            icon={metricCard.icon}
            iconClassName={metricCard.iconClassName}
          />
        ))}
      </div>

      <div className="relative mb-4">
        <Tabs
          items={tabs}
          defaultValue="applications"
          lazy={true}
          searchParamKey="tab"
          listClassName="flex w-full mb-5"
        />

        {currentTab === 'messages' && (
          <button
            type="button"
            aria-label={t('common.add')}
            title={t('common.add')}
            onClick={() => guardMutation(() => navigate('/requests/add-message'))}
            className="absolute inset-e-0 top-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-500/90"
          >
            <CustomImage src={WhitePlusIcon} alt={t('common.add')} className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
