import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import Input from '@/shared/components/Input';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import EmptyState from '@/shared/components/EmptyState';
import FilesGreenIcon from '@gradex/assets/icons/FilesGreen.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';

interface PreparationMock {
  id: string;
  preparationNumber: string;
  topicName: string;
  teacherName: string;
  teacherAvatar: string;
  subjectName: string;
  educationalStage: string;
  grade: string;
}

const mockData: PreparationMock[] = Array.from({ length: 6 }).map((_, index) => ({
  id: `prep-${index + 1}`,
  preparationNumber: '121',
  topicName: 'موضوع 1',
  teacherName: 'أحمد معتز حسن',
  teacherAvatar: 'https://i.pravatar.cc/150?u=' + index, // Mock avatar
  subjectName: 'لغة عربية',
  educationalStage: 'المرحلة الابتدائية',
  grade: 'الأول الابتدائي',
}));

export default function PreparationsList() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedPrepId, setSelectedPrepId] = useState('');
  const [data, setData] = useState<PreparationMock[]>(mockData);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setSelectedGrade('');
    setSelectedDate('');
  };

  const columns: DataTableColumn<PreparationMock>[] = [
    {
      header: '#',
      accessor: (_, index) => ((currentPage - 1) * limit + ((index || 0) + 1)).toString(),
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'preparations.preparationNumber',
      accessor: (row) => row.preparationNumber,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'preparations.topicName',
      accessor: (row) => <span>{row.topicName}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'preparations.subjectName',
      accessor: (row) => <span>{row.subjectName}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'preparations.teacherName',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <span>{row.teacherName}</span>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200">
            <CustomImage
              src={row.teacherAvatar}
              alt={row.teacherName}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ),
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'preparations.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <IconButton variant="blue" onClick={() => {}} ariaLabel="View" className="h-8 w-8">
            <CustomImage src={EyeStyledIcon} alt="View" className="h-4 w-4" />
          </IconButton>
          <IconButton
            status="edit"
            variant="success"
            onClick={() => {}}
            ariaLabel={t('common.edit')}
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedPrepId(row.id);
              setShowDeletePopup(true);
            }}
            ariaLabel={t('common.delete')}
          />
        </div>
      ),
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'prep-search',
      placeholder: t('preparations.searchTopicName'),
      value: searchTerm,
      onChange: (value) => setSearchTerm((value as string) ?? ''),
      width: '25%',
    },
    {
      type: 'custom',
      name: 'prep-stage',
      placeholder: '',
      value: selectedStage,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(val) =>
            setSelectedStage(Array.isArray(val) ? (val[0] as string) : (val as string))
          }
          options={[]}
          placeholder={t('preparations.educationalStage')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'prep-grade',
      placeholder: '',
      value: selectedGrade,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedGrade}
          onChange={(val) =>
            setSelectedGrade(Array.isArray(val) ? (val[0] as string) : (val as string))
          }
          options={[]}
          placeholder={t('preparations.grade')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'prep-date',
      value: selectedDate,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-[40px] w-full"
        />
      ),
    },
  ];

  const handleDeleteConfirm = () => {
    setData((prev) => prev.filter((item) => item.id !== selectedPrepId));
    setShowDeletePopup(false);
  };

  const hasActiveFilters = Boolean(searchTerm || selectedStage || selectedGrade || selectedDate);
  const shouldShowEmptyState = data.length === 0 && !hasActiveFilters;

  const tablePagination = {
    page: currentPage,
    limit: limit,
    total: data.length,
    totalPages: Math.ceil(data.length / limit),
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={FilesGreenIcon}
          description={t('preparations.noPreparations')}
          blend={true}
        />
      ) : (
        <>
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={tablePagination}
            onPageChange={handlePageChange}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            emptyMessage={t('common.noResults')}
            t={t}
          />

          <DeletePopup
            open={showDeletePopup}
            message="preparations.confirmDelete"
            itemName={data.find((d) => d.id === selectedPrepId)?.topicName || ''}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isProcessing={false}
          />
        </>
      )}
    </Card>
  );
}
