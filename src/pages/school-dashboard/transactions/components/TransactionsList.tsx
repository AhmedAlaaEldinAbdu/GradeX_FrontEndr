import { useTranslation } from 'react-i18next';
import EmptyState from '@/shared/components/EmptyState';

export default function TransactionsList() {
  const { t } = useTranslation();

  return (
    <div className="py-12">
      <EmptyState title={t('common.noDataFound')} description={t('common.comingSoon')} />
    </div>
  );
}
