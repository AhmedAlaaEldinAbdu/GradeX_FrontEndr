import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import DotsBlackIcon from '@gradex/assets/icons/DotsBlack.svg';
import PreparationsList from './components/PreparationsList';

export default function PreparationsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.preparations') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="preparations.title"
        actions={[
          {
            label: 'preparations.addPreparation',
            to: '/calendar/preparations/add-preparation',
            variant: 'primary',
            imgSrc: PlusIcon,
            imgClassName: 'w-[20px] h-[20px]',
          },
          {
            label: '',
            onClick: () => {
              // More options
            },
            variant: 'ghost',
            className: '!p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100',
            imgSrc: DotsBlackIcon,
            imgClassName: 'w-[20px] h-[20px]',
          },
        ]}
      />

      <PreparationsList />
    </div>
  );
}
