import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PreparationForm from './components/PreparationForm';

export default function AddPreparationPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('preparations.title'), path: '/calendar/preparations' },
    { label: t('preparations.form.addTitle') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="preparations.form.addTitle" hasHeaderControls={false} />
      <PreparationForm />
    </div>
  );
}
