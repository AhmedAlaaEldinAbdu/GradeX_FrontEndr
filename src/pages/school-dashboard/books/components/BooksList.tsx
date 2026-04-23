import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import BookIcon from '@gradex/assets/icons/Book.svg';
import FileViewer from '@/shared/components/FileViewer';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import { fetchBooks, deleteBook as deleteBookAction } from '@/redux/features/books/booksSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import MetricCard from '@/shared/components/MetricCard';
import type { FlattenedBook, BookStatus } from '@/types/books';
import LibraryGreenIcon from '@/assets/icons/LibraryGreen.svg';
import BookUploadBlueIcon from '@/assets/icons/BookUploadBlue.svg';

const BOOK_STATUS_OPTIONS = [
  { value: '1', labelKey: 'books.available' },
  { value: '2', labelKey: 'books.unavailable' },
];

export default function BooksList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchesId = getCurrentSchoolBranchId() || undefined;

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedSchoolStageId, setSelectedSchoolStageId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    filePath: string | null;
    fileName: string;
  } | null>(null);

  const { showToast } = useToast();

  const flattenedBooks = useAppSelector((state) => state.books.flattenedBooks);
  const pagination = useAppSelector((state) => state.books.pagination);
  const isLoading = useAppSelector((state) => state.books.isLoading);
  const isDeleting = useAppSelector((state) => state.books.isDeleting);

  const subjects = useAppSelector((state) => state.subjects.subjects);
  const grades = useAppSelector((state) => state.educationalStages.educationalStages);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);
  const isLoadingGrades = useAppSelector((state) => state.educationalStages.isLoading);

  useEffect(() => {
    dispatch(fetchSubjects({ page: 1, limit: 100, filters: { schoolBranchesId } }));
    dispatch(
      getEducationalStages({
        pageIndex: 1,
        pageSize: 100,
        schoolBranchId: schoolBranchesId || undefined,
      })
    );
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
          schoolBranchesId,
        },
      })
    );
  }, [
    dispatch,
    pagination.page,
    pagination.limit,
    schoolBranchesId,
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
          schoolBranchesId,
        },
      })
    );
  };

  const hasActiveFilters =
    searchTerm || selectedMaterialId || selectedSchoolStageId || selectedStatus;
  const shouldShowEmptyState = !isLoading && flattenedBooks.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || flattenedBooks.length > 0 || hasActiveFilters;

  const metrics = {
    availableBooks: flattenedBooks.reduce((sum, book) => sum + (book.remainingQuantity ?? 0), 0),
    soldBooks: flattenedBooks.reduce((sum, book) => sum + (book.soldQuantity ?? 0), 0),
  };

  const getStatusLabel = (status: BookStatus) => {
    switch (status) {
      case 1:
        return t('books.available');
      case 2:
        return t('books.unavailable');
      default:
        return '-';
    }
  };

  const getStatusBadgeColor = (status: BookStatus) => {
    switch (status) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
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
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'books.subjectName',
      accessor: (row) => <span>{row.materialName}</span>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'books.educationalStage',
      accessor: (row) => <span>{currentLang === 'ar' ? row.gradeNameAr : row.gradeNameEn}</span>,
      headerClassName: 'min-w-[230px]',
      className: 'text-center',
    },
    {
      header: 'books.bookCode2',
      accessor: (row) => <span>{row.code || '-'}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'books.bookImages',
      accessor: (row) => (
        <div className="flex justify-center">
          <button
            onClick={() => {
              if (row.filePath) {
                setSelectedFile({ filePath: row.filePath, fileName: row.fileName || row.name });
                setShowFileViewer(true);
              }
            }}
            className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
              row.filePath
                ? 'bg-primary-50 hover:bg-primary-100 cursor-pointer'
                : 'cursor-not-allowed bg-gray-100'
            }`}
            disabled={!row.filePath}
            title={row.filePath ? t('books.openBook') : t('books.noBookFile')}
          >
            <CustomImage
              src={BookIcon}
              alt={row.name}
              className={`h-6 w-6 ${row.filePath ? 'opacity-100' : 'opacity-50'}`}
            />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'books.status',
      accessor: (row) => (
        <span className={`inline-flex rounded-full px-2 py-1 ${getStatusBadgeColor(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'books.totalQuantity',
      accessor: (row) => <span>{row.totalQuantity ?? 0}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'books.remainingQuantity',
      accessor: (row) => <span>{row.remainingQuantity ?? 0}</span>,
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'books.soldQuantity',
      accessor: (row) => <span>{row.soldQuantity ?? 0}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'books.price',
      accessor: (row) => <span>{row.price ?? 0}</span>,
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            onClick={() => navigate(`/books/edit/${row.gradeBookId}/${row.id}`)}
            ariaLabel="Edit"
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedBookId(row.id);
              setShowDeletePopup(true);
            }}
            disabled={isDeleting}
            ariaLabel="Delete"
          />
        </div>
      ),
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchBook',
      placeholder: t('books.searchByBookNameOrCode'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '40%',
    },
    {
      type: 'custom',
      name: 'material-filter',
      placeholder: '',
      value: selectedMaterialId,
      onChange: () => {},
      width: '25%',
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
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedSchoolStageId}
          onChange={(value) =>
            setSelectedSchoolStageId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={grades.map((grade) => ({
            value: grade.id,
            label: currentLang === 'ar' ? grade.nameAr : grade.nameEn,
          }))}
          placeholder={isLoadingGrades ? t('common.loading') : t('books.educationalStage')}
          disabled={isLoadingGrades}
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
          placeholder={t('books.status')}
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MetricCard
          title={t('books.availableBooks')}
          value={metrics.availableBooks}
          icon={
            <CustomImage
              src={LibraryGreenIcon}
              alt={t('books.availableBooks')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-green-50 text-green-600"
        />
        <MetricCard
          title={t('books.soldBooks')}
          value={metrics.soldBooks}
          icon={
            <CustomImage src={BookUploadBlueIcon} alt={t('books.soldBooks')} className="h-6 w-6" />
          }
          iconClassName="bg-blue-50 text-blue-600"
        />
      </div>

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
              itemName={flattenedBooks.find((b) => b.id === selectedBookId)?.name ?? ''}
              onConfirm={handleDeleteConfirm}
              onCancel={() => setShowDeletePopup(false)}
              iconSrc={BigTrashIcon}
              isProcessing={isDeleting}
            />

            {/* File Viewer Modal */}
            <FileViewer
              isOpen={showFileViewer}
              onClose={() => {
                setShowFileViewer(false);
                setSelectedFile(null);
              }}
              filePath={selectedFile?.filePath || null}
              fileName={selectedFile?.fileName}
              title={selectedFile?.fileName}
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
