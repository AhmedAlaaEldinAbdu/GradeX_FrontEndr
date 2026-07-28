import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PreparationForm from './components/PreparationForm';

export default function EditPreparationPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('preparations.title'), path: '/calendar/preparations' },
    { label: t('preparations.form.editTitle') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="preparations.form.editTitle" hasHeaderControls={false} />
      <PreparationForm isEditMode={true} />
    </div>
  );
}
