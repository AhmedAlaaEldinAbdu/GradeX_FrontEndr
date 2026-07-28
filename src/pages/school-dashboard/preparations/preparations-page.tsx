import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import PreparationsList from './components/PreparationsList';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { useTranslation } from 'react-i18next';

export default function PreparationsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('preparations.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="preparations.title"
        actions={[
          {
            label: 'preparations.addPreparation',
            to: '/calendar/preparations/add-preparation',
            variant: 'primary',
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
        hasHeaderControls={true}
      />

      <PreparationsList />
    </div>
  );
}
