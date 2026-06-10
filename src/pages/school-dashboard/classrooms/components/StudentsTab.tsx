import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import DataTable from '@/shared/components/DataTable';
import EditGreenIcon from '@gradex/assets/icons/EditGreen.svg';

export type StudentRow = {
  id: string;
  name: string;
  imageSrc: string;
};

type StudentsTabProps = {
  rows: StudentRow[];
  isLoading?: boolean;
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
  isLoading = false,
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
    <UserAvatarName name={name} avatarSrc={imageSrc} align="between" onView={() => {}} />
  );

  const renderIconButton = (icon: string, backgroundClassName: string, alt: string) => (
    <button
      type="button"
      className={`flex h-10 w-10 items-center justify-center rounded-full ${backgroundClassName}`}
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
      headerClassName: 'min-w-[250px] text-start',
      className: 'min-w-[250px]',
    },

    {
      header: 'actions.actions',
      accessor: () => renderIconButton(EditGreenIcon, 'bg-[#30B97E1A]', t('actions.edit')),
      headerClassName: 'min-w-[180px]',
      className: 'min-w-[180px]',
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={studentColumns}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
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
