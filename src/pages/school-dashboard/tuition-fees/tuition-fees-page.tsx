import { useState } from 'react';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@/assets/icons/Plus.svg';
import TuitionFees, { TUITION_TAB, type TuitionFeesTabId } from './components/TuitionFees';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { useTranslation } from 'react-i18next';

export default function TuitionFeesPage() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<TuitionFeesTabId>(TUITION_TAB);

  const breadcrumbItems = [
    { label: t('sidebar.financialAffairs') },
    { label: t('sidebar.financialManagement') },
    { label: t('sidebar.fees') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="sidebar.fees"
        actions={
          selectedTab === TUITION_TAB
            ? [
                {
                  label: 'fees.tuition.addAction',
                  to: '/financial-management/fees/add-tuition-fee',
                  variant: 'primary',
                  imgSrc: PlusIcon,
                  imgClassName: 'w-10 h-10',
                  circle: true,
                },
              ]
            : [
                {
                  label: 'fees.discounts.addAction',
                  to: '/financial-management/fees/add-discount-offer',
                  variant: 'primary',
                  imgSrc: PlusIcon,
                  imgClassName: 'w-10 h-10',
                  circle: true,
                },
              ]
        }
      />

      <TuitionFees setSelectedTab={setSelectedTab} />
    </div>
  );
}
