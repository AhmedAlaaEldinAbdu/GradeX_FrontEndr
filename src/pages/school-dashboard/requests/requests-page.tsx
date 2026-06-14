import React from 'react';
import { useTranslation } from 'react-i18next';

import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
import ClockYellowIcon from '@gradex/assets/icons/ClockYellow.svg';
import CheckmarkCircleIcon from '@gradex/assets/icons/CheckmarkCircle.svg';
import XmarkCircleIcon from '@gradex/assets/icons/XmarkCircle.svg';
import OrdersGreenIcon from '@gradex/assets/icons/OrdersGreen.svg';

import MessageRequestsTable from './components/MessageRequestsTable';
import { MOCK_REQUESTS_STATS } from './requests.mock';

const ComingSoon: React.FC = () => <NotFoundMessage message="requests.comingSoon" />;

const RequestsPage: React.FC = () => {
  const { t } = useTranslation();

  const stats = MOCK_REQUESTS_STATS;

  const breadcrumbItems = [
    { label: t('sidebar.studentManagement') },
    { label: t('requests.title') },
  ];

  const tabs: TabItem[] = [
    { id: 'applications', label: t('requests.tabs.applications'), content: <ComingSoon /> },
    { id: 'early-leave', label: t('requests.tabs.earlyLeave'), content: <ComingSoon /> },
    { id: 'messages', label: t('requests.tabs.messages'), content: <MessageRequestsTable /> },
    { id: 'reminder', label: t('requests.tabs.reminder'), content: <ComingSoon /> },
    { id: 'add-delegate', label: t('requests.tabs.addDelegate'), content: <ComingSoon /> },
    {
      id: 'contract-authentication',
      label: t('requests.tabs.contractAuthentication'),
      content: <ComingSoon />,
    },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="requests.title" />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('requests.pendingCount')}
          value={stats.pending}
          icon={<CustomImage src={ClockYellowIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#FDF6E0]"
        />
        <MetricCard
          title={t('requests.acceptedCount')}
          value={stats.acceptedPercentage}
          percentage
          icon={<CustomImage src={CheckmarkCircleIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E8F4EE]"
        />
        <MetricCard
          title={t('requests.rejectedCount')}
          value={stats.rejected}
          icon={<CustomImage src={XmarkCircleIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#FCE8E8]"
        />
        <MetricCard
          title={t('requests.totalCount')}
          value={stats.total}
          icon={<CustomImage src={OrdersGreenIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E7F2FB]"
        />
      </div>

      <div className="mb-4 flex items-start gap-3">
        <Tabs items={tabs} defaultValue="messages" searchParamKey="tab" className="flex-1" />

        <CustomImage
          src={GreenPlusCircleIcon}
          alt={t('common.add')}
          className="h-10 w-10 shrink-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default RequestsPage;
