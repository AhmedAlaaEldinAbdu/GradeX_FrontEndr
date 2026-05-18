import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddEditBook from './components/AddEditBook';

export default function AddBookPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.eduStages') },
    { label: t('books.title'), path: '/books' },
    { label: t('books.addBook') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="books.addBook" />
      <AddEditBook />
    </div>
  );
}
