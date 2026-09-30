import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import TuitionFeesTab from './TuitionFeesTab';
import DiscountsAndOffersTab from './DiscountsAndOffersTab';

const TUITION_TAB = 'tuition' as const;
const DISCOUNTS_TAB = 'discounts' as const;

type TuitionFeesTabId = typeof TUITION_TAB | typeof DISCOUNTS_TAB;

type TuitionFeesProps = {
  setSelectedTab: (tabId: TuitionFeesTabId) => void;
};

export default function TuitionFees({ setSelectedTab }: TuitionFeesProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TuitionFeesTabId>(TUITION_TAB);

  const tabs = useMemo<TabItem[]>(
    () => [
      {
        id: TUITION_TAB,
        label: t('fees.tuition.tabTitle'),
        content: <TuitionFeesTab />,
      },
      {
        id: DISCOUNTS_TAB,
        label: t('fees.discounts.tabTitle'),
        content: <DiscountsAndOffersTab />,
      },
    ],
    [navigate, t]
  );

  return (
    <Tabs
      items={tabs}
      value={activeTab}
      onChange={(id) => {
        const next = id as TuitionFeesTabId;
        setActiveTab(next);
        setSelectedTab(next);
      }}
      variant="underline"
      listClassName="flex w-full md:w-[75%] lg:w-[35%] gap-2 mb-5 px-1 flex-wrap"
      lazy={true}
      searchParamKey="tab"
    />
  );
}

export type { TuitionFeesTabId };
export { TUITION_TAB, DISCOUNTS_TAB };
