import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import BooksList from './components/BooksList';

export default function BooksPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [{ label: t('sidebar.educationalStages') }, { label: t('books.title') }];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="books.title"
        actions={[
          {
            label: 'books.addBook',
            to: '/books/add',
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
          },
        ]}
        hasHeaderControls={true}
      />

      {/* Main Content */}
      <BooksList />
    </div>
  );
}
