import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable from '@/shared/components/DataTable';
import NoteEditGreenIcon from '@gradex/assets/icons/NoteEditGreen.svg';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';

export type TeacherRow = {
  id: string;
  name: string;
  subject: string;
  imageSrc: string;
};

type SubjectOption = {
  value: string;
  label: string;
};

type TeacherTabProps = {
  rows: TeacherRow[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchTerm: string;
  selectedSubject: string;
  itemsPerPage: number;
  subjectOptions: SubjectOption[];
  onSearchChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
};

export default function TeacherTab({
  rows,
  currentPage,
  totalPages,
  totalCount,
  searchTerm,
  selectedSubject,
  itemsPerPage,
  subjectOptions,
  onSearchChange,
  onSubjectChange,
  onPageChange,
  onResetFilters,
}: TeacherTabProps) {
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

  const teacherColumns = [
    {
      header: '#',
      accessor: (_row: TeacherRow, index?: number) =>
        (currentPage - 1) * itemsPerPage + (index || 0) + 1,
      headerClassName: 'w-16',
      className: 'w-16',
    },
    {
      header: 'teachers.teacherName',
      accessor: (row: TeacherRow) => renderPersonCell(row.name, row.imageSrc),
      headerClassName: 'min-w-[320px]',
      className: 'min-w-[320px]',
    },
    {
      header: 'teachers.subjectName',
      accessor: (row: TeacherRow) => row.subject,
      headerClassName: 'min-w-[220px]',
      className: 'min-w-[220px]',
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
      columns={teacherColumns}
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
          name: 'teacherSearch',
          placeholder: t('teachers.searchTeacher'),
          value: searchTerm,
          onChange: (value) => onSearchChange(Array.isArray(value) ? value[0] || '' : value),
          width: '30%',
        },
        {
          type: 'custom',
          name: 'teacherSubject',
          placeholder: t('teachers.selectSubject'),
          value: selectedSubject,
          onChange: () => {},
          width: '20%',
          customComponent: (
            <CustomSelect
              value={selectedSubject}
              onChange={(value) => onSubjectChange(Array.isArray(value) ? value[0] || '' : value)}
              options={subjectOptions}
              placeholder={t('teachers.selectSubject')}
              showSearch={false}
            />
          ),
        },
      ]}
      onResetFilters={onResetFilters}
      t={t}
      floatingActions={false}
    />
  );
}