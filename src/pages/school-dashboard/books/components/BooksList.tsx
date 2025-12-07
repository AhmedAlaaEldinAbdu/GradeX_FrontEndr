import { useTranslation } from 'react-i18next';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import BookIcon from '@gradex/assets/icons/Book.svg';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import { fetchBooks, deleteBook as deleteBookAction } from '@/redux/features/books/booksSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchSchoolStages } from '@/redux/features/lookups/lookupsSlice';
import type { FlattenedBook, BookStatus } from '@/types/books';

const BOOK_STATUS_OPTIONS = [
  { value: '1', labelKey: 'books.available' },
  { value: '0', labelKey: 'books.unavailable' },
];

export default function BooksList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedSchoolStageId, setSelectedSchoolStageId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const { showToast } = useToast();

  const flattenedBooks = useAppSelector((state) => state.books.flattenedBooks);
  const pagination = useAppSelector((state) => state.books.pagination);
  const isLoading = useAppSelector((state) => state.books.isLoading);
  const isDeleting = useAppSelector((state) => state.books.isDeleting);

  const subjects = useAppSelector((state) => state.subjects.subjects);
  const schoolStages = useAppSelector((state) => state.lookups.schoolStages);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);
  const isLoadingSchoolStages = useAppSelector((state) => state.lookups.isLoadingSchoolStages);

  useEffect(() => {
    dispatch(fetchSubjects({ page: 1, limit: 100 }));
    dispatch(fetchSchoolStages());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchBooks({
        page: pagination.page,
        limit: pagination.limit,
        filters: {
          searchName: searchTerm || undefined,
          materialId: selectedMaterialId || undefined,
          gradeId: selectedSchoolStageId || undefined,
          status: selectedStatus ? (Number(selectedStatus) as BookStatus) : undefined,
        },
      })
    );
  }, [
    dispatch,
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedMaterialId,
    selectedSchoolStageId,
    selectedStatus,
  ]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchBooks({
        page,
        limit: pagination.limit,
        filters: {
          searchName: searchTerm || undefined,
          materialId: selectedMaterialId || undefined,
          gradeId: selectedSchoolStageId || undefined,
          status: selectedStatus ? (Number(selectedStatus) as BookStatus) : undefined,
        },
      })
    );
  };

  const hasActiveFilters =
    searchTerm || selectedMaterialId || selectedSchoolStageId || selectedStatus;
  const shouldShowEmptyState = !isLoading && flattenedBooks.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || flattenedBooks.length > 0 || hasActiveFilters;

  const getStatusLabel = (status: BookStatus) => {
    switch (status) {
      case 1:
        return t('books.available');
      case 0:
        return t('books.unavailable');
      default:
        return '-';
    }
  };

  const getStatusBadgeColor = (status: BookStatus) => {
    switch (status) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 0:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: DataTableColumn<FlattenedBook>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = flattenedBooks?.findIndex((b) => b?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + (index + 1);
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'books.bookName',
      accessor: (row) => <span>{row.name}</span>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'books.subjectName',
      accessor: (row) => <span>{row.materialName}</span>,
      headerClassName: 'min-w-[120px]',
    },
    {
      header: 'books.educationalStage',
      accessor: (row) => <span>{currentLang === 'ar' ? row.gradeNameAr : row.gradeNameEn}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'books.bookCode',
      accessor: (row) => <span>{row.code || '-'}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'books.bookImage',
      accessor: (row) => (
        <div className="flex justify-center">
          {row.filePath ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/${row.filePath}`}
              alt={row.name}
              className="h-12 w-12 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = BookIcon;
              }}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
              <img src={BookIcon} alt="No image" className="h-6 w-6 opacity-50" />
            </div>
          )}
        </div>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'books.status',
      accessor: (row) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(row.status)}`}
        >
          {getStatusLabel(row.status)}
        </span>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'books.totalQuantity',
      accessor: (row) => <span>{row.totalQuantity ?? 0}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'books.remainingQuantity',
      accessor: (row) => <span>{row.remainingQuantity ?? 0}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'books.soldQuantity',
      accessor: (row) => <span>{row.soldQuantity ?? 0}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'books.price',
      accessor: (row) => (
        <span>
          {row.price ?? 0} {t('books.currency')}
        </span>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/books/edit/${row.id}`)}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedBookId(row.id);
              setShowDeletePopup(true);
            }}
            className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
            disabled={isDeleting}
          >
            <img src={TrashIcon} alt="Delete" className="h-4 w-4" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchBook',
      placeholder: t('books.searchBook'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '30%',
    },
    {
      type: 'custom',
      name: 'material-filter',
      placeholder: '',
      value: selectedMaterialId,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedMaterialId}
          onChange={(value) =>
            setSelectedMaterialId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={subjects.map((subject) => ({
            value: subject.id,
            label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
          }))}
          placeholder={isLoadingSubjects ? t('common.loading') : t('books.selectSubject')}
          disabled={isLoadingSubjects}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'schoolStage-filter',
      placeholder: '',
      value: selectedSchoolStageId,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedSchoolStageId}
          onChange={(value) =>
            setSelectedSchoolStageId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={schoolStages.map((stage) => ({
            value: stage.id,
            label: currentLang === 'ar' ? stage.nameAR : stage.nameEN,
          }))}
          placeholder={isLoadingSchoolStages ? t('common.loading') : t('books.educationalStage')}
          disabled={isLoadingSchoolStages}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'status-filter',
      placeholder: '',
      value: selectedStatus,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={BOOK_STATUS_OPTIONS.map((status) => ({
            value: status.value,
            label: t(status.labelKey),
          }))}
          placeholder={t('books.selectStatus')}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMaterialId('');
    setSelectedSchoolStageId('');
    setSelectedStatus('');
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBookId) return;

    try {
      await dispatch(deleteBookAction(selectedBookId)).unwrap();
      setShowDeletePopup(false);
      showToast({
        message: 'books.bookDeletedSuccessfully',
        type: 'success',
      });
    } catch {
      showToast({
        message: 'common.errorOccurred',
        type: 'error',
      });
    }
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState imgSrc={BookIcon} description={t('books.noBooksMessage')} blend={true} />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={flattenedBooks}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              totalPages: pagination.totalPages,
            }}
            onPageChange={handlePageChange}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            isLoading={isLoading}
            emptyMessage={t('common.noResults')}
            t={t}
          />

          {/* Popups */}
          <DeletePopup
            open={showDeletePopup}
            message="books.confirmDeleteBook"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isProcessing={isDeleting}
          />
        </div>
      ) : null}
    </Card>
  );
}
