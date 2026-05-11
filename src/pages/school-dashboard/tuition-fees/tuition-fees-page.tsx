import { useState } from 'react';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@/assets/icons/Plus.svg';
import TuitionFees, { TUITION_TAB, type TuitionFeesTabId } from './components/TuitionFees';

export default function TuitionFeesPage() {
  const [selectedTab, setSelectedTab] = useState<TuitionFeesTabId>(TUITION_TAB);

  return (
    <div>
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
                  imgClassName: 'h-5 w-5',
                },
              ]
            : [
                {
                  label: 'fees.discounts.addAction',
                  to: '/financial-management/fees/add-discount-offer',
                  variant: 'primary',
                  imgSrc: PlusIcon,
                  imgClassName: 'h-5 w-5',
                },
              ]
        }
      />

      <TuitionFees setSelectedTab={setSelectedTab} />
    </div>
  );
}
