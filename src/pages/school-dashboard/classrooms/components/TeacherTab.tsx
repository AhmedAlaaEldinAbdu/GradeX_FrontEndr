import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchTeacherAssignmentList } from '@/redux/features/teachers';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable from '@/shared/components/DataTable';
import EditGreenIcon from '@gradex/assets/icons/EditGreen.svg';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import ProfileImage from '@gradex/assets/images/profile.png';

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
  currentPage: number;
  searchTerm: string;
  selectedSubject: string;
  itemsPerPage: number;
  onSearchChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
};

export default function TeacherTab({
  currentPage,
  searchTerm,
  selectedSubject,
  itemsPerPage,
  onSearchChange,
  onSubjectChange,
  onPageChange,
  onResetFilters,
}: TeacherTabProps) {
  const { t } = useTranslation();
  const { guardMutation } = useRoleAccess();
  const { id: classId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const schoolBranchesId = getCurrentSchoolBranchId();
  const teacherAssignmentList = useAppSelector((state) => state.teachers.teacherAssignmentList);
  const isLoadingAssignmentList = useAppSelector((state) => state.teachers.isLoadingAssignmentList);

  useEffect(() => {
    if (!schoolBranchesId || !classId) {
      return;
    }

    void dispatch(
      fetchTeacherAssignmentList({
        schoolBranchesId,
        classId,
      })
    );
  }, [classId, dispatch, schoolBranchesId]);

  const rows = useMemo<TeacherRow[]>(
    () =>
      teacherAssignmentList.map((teacherAssignment) => ({
        id: teacherAssignment.teacherId,
        name: teacherAssignment.teacherName,
        subject: teacherAssignment.materialNameEN || teacherAssignment.materialNameAR,
        imageSrc: ProfileImage,
      })),
    [teacherAssignmentList]
  );

  const subjectOptions = useMemo<SubjectOption[]>(
    () =>
      [
        { value: '', label: t('teachers.selectSubject') },
        ...rows.map((row) => ({ value: row.subject, label: row.subject })),
      ].filter(
        (option, index, array) => array.findIndex((item) => item.value === option.value) === index
      ),
    [rows, t]
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesName = row.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
        const matchesSubject = selectedSubject ? row.subject === selectedSubject : true;
        return matchesName && matchesSubject;
      }),
    [rows, searchTerm, selectedSubject]
  );

  const paginatedRows = useMemo(
    () => filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [currentPage, filteredRows, itemsPerPage]
  );

  const totalCount = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const renderPersonCell = (name: string, imageSrc: string) => (
    <UserAvatarName name={name} avatarSrc={imageSrc} align="between" onView={() => {}} />
  );

  const renderIconButton = (
    icon: string,
    backgroundClassName: string,
    alt: string,
    onClick?: () => void
  ) => (
    <button
      type="button"
      className={`flex h-12 w-12 items-center justify-center rounded-full ${backgroundClassName}`}
      aria-label={alt}
      onClick={() => guardMutation(onClick ?? (() => {}))}
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
      headerClassName: 'min-w-[250px] text-start',
      className: 'min-w-[250px]',
    },
    {
      header: 'teachers.subjectName',
      accessor: (row: TeacherRow) => row.subject,
      headerClassName: 'min-w-[250px]',
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
      data={paginatedRows}
      columns={teacherColumns}
      keyExtractor={(row) => row.id}
      isLoading={isLoadingAssignmentList}
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
