import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@/assets/icons/Plus.svg';
import EditGreenIcon from '@gradex/assets/icons/EditGreen.svg';
import ContractsList from './components/ContractsList';

export default function ContractsPage() {
  const { t } = useTranslation();
  const [hasContracts, setHasContracts] = useState(false);

  const breadcrumbItems = [
    { label: t('sidebar.financialAffairs') },
    { label: t('sidebar.financialManagement') },
    { label: t('contracts.title') },
  ];

  // Swap the header action: first-time setup → "Add", existing setup → "Edit".
  const headerAction = hasContracts
    ? {
        label: 'contracts.editAction',
        to: '/financial-management/contracts/edit-contract',
        variant: 'outline' as const,
        imgSrc: EditGreenIcon,
        imgClassName: 'w-10 h-10',
        circle: true,
      }
    : {
        label: 'contracts.addAction',
        to: '/financial-management/contracts/add-contract',
        variant: 'primary' as const,
        imgSrc: PlusIcon,
        imgClassName: 'w-10 h-10',
        circle: true,
      };

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="contracts.title" actions={[headerAction]} hasHeaderControls={true} />

      <ContractsList onContractsCountChange={(count) => setHasContracts(count > 0)} />
    </div>
  );
}
