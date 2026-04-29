import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import EditBook from './components/EditBook';

export default function EditBookPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.books') },
    { label: t('books.title'), path: '/books' },
    { label: t('books.editBook') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="books.editBook" />

      {/* Main Content */}
      <EditBook />
    </div>
  );
}
