import React from 'react';
import { useTranslation } from 'react-i18next';

import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import WhitePlusIcon from '@gradex/assets/icons/WhitePlus.svg';
import ClockYellowBoldIcon from '@gradex/assets/icons/ClockYellowBold.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import TaskBlueIcon from '@gradex/assets/icons/TaskBlue.svg';

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
          title={t('requests.totalCount')}
          value={stats.total}
          icon={<CustomImage src={TaskBlueIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E7F2FB]"
        />
        <MetricCard
          title={t('requests.rejectedCount')}
          value={stats.rejected}
          icon={<CustomImage src={XmarkCircleRedIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#FCE8E8]"
        />
        <MetricCard
          title={t('requests.acceptedCount')}
          value={stats.acceptedPercentage}
          percentage
          icon={<CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#E8F4EE]"
        />
        <MetricCard
          title={t('requests.pendingCount')}
          value={stats.pending}
          icon={<CustomImage src={ClockYellowBoldIcon} alt="" className="h-5 w-5" />}
          iconClassName="bg-[#FDF6E0]"
        />
      </div>

      <div className="relative mb-4">
        <Tabs
          items={tabs}
          defaultValue="messages"
          searchParamKey="tab"
          listClassName="flex w-full mb-5"
        />

        <button
          type="button"
          aria-label={t('common.add')}
          title={t('common.add')}
          className="absolute end-0 top-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-500/90"
        >
          <CustomImage src={WhitePlusIcon} alt={t('common.add')} className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default RequestsPage;
