import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import DataTable from '@/shared/components/DataTable';
import NoteEditGreenIcon from '@gradex/assets/icons/NoteEditGreen.svg';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';

export type StudentRow = {
  id: string;
  name: string;
  imageSrc: string;
};

type StudentsTabProps = {
  rows: StudentRow[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  itemsPerPage: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
};

export default function StudentsTab({
  rows,
  currentPage,
  totalPages,
  totalCount,
  searchTerm,
  itemsPerPage,
  onSearchChange,
  onPageChange,
  onResetFilters,
}: StudentsTabProps) {
  const { t } = useTranslation();

  const renderPersonCell = (name: string, imageSrc: string) => (
    <div className="flex items-center justify-end gap-3">
      <span className="text-base font-normal text-[#646969]">{name}</span>
      <CustomImage src={imageSrc} alt={name} className="h-12 w-12 rounded-xl object-cover" />
    </div>
  );

  const renderIconButton = (icon: string, backgroundClassName: string, alt: string) => (
    <button
      type="button"
      className={`flex h-12 w-12 items-center justify-center rounded-full ${backgroundClassName}`}
      aria-label={alt}
    >
      <CustomImage src={icon} alt={alt} className="h-6 w-6" />
    </button>
  );

  const studentColumns = [
    {
      header: '#',
      accessor: (_row: StudentRow, index?: number) =>
        (currentPage - 1) * itemsPerPage + (index || 0) + 1,
      headerClassName: 'w-16',
      className: 'w-16',
    },
    {
      header: 'studentManagement.studentName',
      accessor: (row: StudentRow) => renderPersonCell(row.name, row.imageSrc),
      headerClassName: 'min-w-[320px]',
      className: 'min-w-[320px]',
    },
    {
      header: '',
      accessor: () => renderIconButton(EyeDarkBlueIcon, 'bg-[#E5F1FF]', t('actions.view')),
      headerClassName: 'w-24',
      className: 'w-24',
    },
    {
      header: 'actions.actions',
      accessor: () => renderIconButton(NoteEditGreenIcon, 'bg-[#E5F7F0]', t('actions.edit')),
      headerClassName: 'min-w-[180px]',
      className: 'min-w-[180px]',
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={studentColumns}
      keyExtractor={(row) => row.id}
      pagination={{
        page: currentPage,
        limit: itemsPerPage,
        total: totalCount,
        totalPages,
      }}
      onPageChange={onPageChange}
      filters={[
        {
          type: 'search',
          name: 'studentSearch',
          placeholder: t('studentManagement.searchByStudentName'),
          value: searchTerm,
          onChange: (value) => onSearchChange(Array.isArray(value) ? value[0] || '' : value),
          width: '30%',
        },
      ]}
      onResetFilters={onResetFilters}
      t={t}
      floatingActions={false}
    />
  );
}