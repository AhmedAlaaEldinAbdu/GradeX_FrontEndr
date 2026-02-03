import { useState } from 'react';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@/assets/icons/Plus.svg';
import TuitionFees, { TUITION_TAB, type TuitionFeesTabId } from './components/TuitionFees';

export default function TuitionFeesPage() {
  const [selectedTab, setSelectedTab] = useState<TuitionFeesTabId>(TUITION_TAB);

  // TODO: Remove this temporary DEV check when the page is ready
  if (!import.meta.env.DEV) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">الرسوم الدراسية</h2>
        <p className="mt-4 text-gray-600">قريباً...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="sidebar.fees"
        actions={
          selectedTab === TUITION_TAB
            ? [
                {
                  label: 'fees.tuition.addAction',
                  to: '/fees/add-tuition-fee',
                  variant: 'primary',
                  imgSrc: PlusIcon,
                  imgClassName: 'h-5 w-5',
                },
              ]
            : [
                {
                  label: 'fees.discounts.addAction',
                  to: '/fees/add-discount-offer',
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
