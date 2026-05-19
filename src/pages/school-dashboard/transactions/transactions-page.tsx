import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Tabs from '@/shared/components/Tabs';
import TransactionsOverview from './components/TransactionsOverview';
import TransactionsList from './components/TransactionsList';

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');

  if (import.meta.env.MODE !== 'development') {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {t('financialManagement.transactions')}
        </h2>
        <p className="mt-4 text-gray-600">{t('common.comingSoon')}</p>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('sidebar.financialAffairs') },
    { label: t('sidebar.transactions') },
  ];

  const tabItems = [
    {
      id: 'overview',
      label: t('financialManagement.overview'),
      content: activeTab === 'overview' ? <TransactionsOverview /> : null,
    },
    {
      id: 'transactions',
      label: t('financialManagement.transactions'),
      content: activeTab === 'transactions' ? <TransactionsList /> : null,
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="financialManagement.transactions" />

      {/* Tabs Layout */}
      <div className="mb-5 mt-6 w-full px-1">
        <Tabs
          items={tabItems}
          value={activeTab}
          onChange={handleTabChange}
          variant="underline"
          listClassName="flex w-[100%] md:w-[75%] lg:w-[40%] gap-2 mb-5 px-1 flex-wrap"
          lazy={true}
          searchParamKey="tab"
        />
      </div>
    </div>
  );
}
