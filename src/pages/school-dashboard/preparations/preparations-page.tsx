import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import PreparationsList from './components/PreparationsList';

export default function PreparationsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.preparations') },
  ];

  if (import.meta.env.MODE !== 'development') {
    return <div>قريباً...</div>;
  }

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="preparations.title"
        actions={[
          {
            label: 'preparations.addPreparation',
            onClick: () => {
              // Coming soon
            },
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
          },
        ]}
      />

      <PreparationsList />
    </div>
  );
}
