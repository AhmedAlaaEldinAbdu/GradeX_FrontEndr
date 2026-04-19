import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import CustomerDetails from './components/CustomerDetails';

import PrintIcon from '@gradex/assets/icons/Print.svg';

export default function CustomerDetailsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('customers.title'), path: '/financial-management/customers' },
    { label: t('customers.viewClient') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title={t('customers.viewClient')}
        hasHeaderControls={false}
        actions={[
          {
            label: '',
            onClick: () => window.print(),
            variant: 'ghost',
            className:
              'flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors shrink-0',
            imgSrc: PrintIcon,
            imgClassName: 'w-8 h-8',
          },
        ]}
      />
      <CustomerDetails />
    </div>
  );
}
