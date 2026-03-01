import { useEffect, useState } from 'react';
import Card from '@gradex/shared/components/Card';
import EmptyState from '@gradex/shared/components/EmptyState';
import { useTranslation } from 'react-i18next';
import StudentIcon from '@gradex/assets/icons/Student.svg';
import IconButton from '@/shared/components/IconButton';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import { getStudentFullName } from '@/services/api/types/students.types';
import type { StudentDto } from '@/services/api/types/students.types';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudents, deleteStudent } from '@/redux/features/students/studentsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';

export default function StudentManagement() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [selectedSchoolBranchId, setSelectedSchoolBranchId] = useState('');

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const userData = localStorage.getItem('userData') || undefined;
  const schoolBranchId = userData ? JSON.parse(userData)?.schoolBranchId : undefined;

  const students = useAppSelector((state) => state.students.students);
  const pagination = useAppSelector((state) => state.students.pagination);
  const isLoading = useAppSelector((state) => state.students.isLoading);
  const isDeleting = useAppSelector((state) => state.students.isDeleting);

  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const isLoadingEducationalStages = useAppSelector((state) => state.educationalStages.isLoading);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const isLoadingClassrooms = useAppSelector((state) => state.classrooms.isLoading);

  useEffect(() => {
    dispatch(
      getEducationalStages({
        pageIndex: 1,
        pageSize: 1000,
      })
    );
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 1000,
        filters: {
          schoolBranchId: schoolBranchId || undefined,
        },
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchStudents({
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        filters: {
          search: searchTerm || undefined,
          gradeId: selectedGradeId || undefined,
          classroomId: selectedClassroomId || undefined,
          schoolBranchId: selectedSchoolBranchId || undefined,
        },
      })
    );
  }, [
    dispatch,
    pagination.pageIndex,
    pagination.pageSize,
    searchTerm,
    selectedGradeId,
    selectedClassroomId,
    selectedSchoolBranchId,
  ]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchStudents({
        page,
        limit: pagination.pageSize,
        filters: {
          search: searchTerm || undefined,
          gradeId: selectedGradeId || undefined,
          classroomId: selectedClassroomId || undefined,
          schoolBranchId: selectedSchoolBranchId || undefined,
        },
      })
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGradeId('');
    setSelectedClassroomId('');
    setSelectedSchoolBranchId('');
  };

  const handleDeleteClick = (id: string) => {
    setSelectedStudentId(id);
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudentId) return;

    try {
      await dispatch(deleteStudent(selectedStudentId)).unwrap();
      setShowDeletePopup(false);
      showToast({
        message: 'studentManagement.studentDeletedSuccessfully',
        type: 'success',
      });
    } catch (error) {
      showToast({
        message: 'common.errorOccurred',
        type: 'error',
      });
    }
  };

  const hasActiveFilters =
    searchTerm || selectedGradeId || selectedClassroomId || selectedSchoolBranchId;
  const shouldShowEmptyState = !isLoading && students.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || students.length > 0 || hasActiveFilters;

  const columns: DataTableColumn<StudentDto>[] = [
    {
      header: '#',
      accessor: (_row, index) => {
        const currentIndex = index !== undefined ? index + 1 : 1;
        return (pagination.pageIndex - 1) * pagination.pageSize + currentIndex;
      },
      headerClassName: 'w-24',
    },
    {
      header: 'studentManagement.studentName',
      accessor: (row) => getStudentFullName(row),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'studentManagement.educationalStage',
      accessor: (row) => row.grade || '-',
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'studentManagement.classes',
      accessor: (row) => row.className || '-',
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'studentManagement.date',
      accessor: (row) => (row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : '-'),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'studentManagement.contract',
      accessor: () => (
        <div className="flex cursor-pointer items-center justify-center">
          <img src={PdfIcon} alt="Contract" className="h-8 w-8" />
        </div>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <IconButton status="edit" variant="success" ariaLabel="Edit" />
          <IconButton
            status="delete"
            variant="danger"
            ariaLabel="Delete"
            onClick={() => handleDeleteClick(row.id)}
            disabled={isDeleting}
          />
        </div>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchStudent',
      placeholder: t('studentManagement.searchByStudentName'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '30%',
    },
    {
      type: 'custom',
      name: 'grade-filter',
      placeholder: '',
      value: selectedGradeId,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedGradeId}
          onChange={(value) => setSelectedGradeId(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={
            Array.isArray(educationalStages)
              ? educationalStages.map((stage) => ({
                  value: stage?.id || '',
                  label: currentLang === 'ar' ? stage?.nameAr || '' : stage?.nameEn || '',
                }))
              : []
          }
          placeholder={
            isLoadingEducationalStages
              ? t('common.loading')
              : t('studentManagement.educationalStage')
          }
          disabled={isLoadingEducationalStages}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'class-filter',
      placeholder: '',
      value: selectedClassroomId,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedClassroomId}
          onChange={(value) =>
            setSelectedClassroomId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={
            Array.isArray(classrooms)
              ? classrooms.map((c) => ({
                  value: c?.id || '',
                  label: currentLang === 'ar' ? c?.name || '' : c?.nameEn || '',
                }))
              : []
          }
          placeholder={isLoadingClassrooms ? t('common.loading') : t('studentManagement.classes')}
          disabled={isLoadingClassrooms}
          maxHeight="200px"
        />
      ),
    },
  ];

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={StudentIcon}
          description={t('studentManagement.noStudentsMessage')}
          blend={true}
        />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={students}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page: pagination.pageIndex,
              limit: pagination.pageSize,
              total: pagination.totalItems,
              totalPages: pagination.totalPages,
            }}
            onPageChange={handlePageChange}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            isLoading={isLoading}
            emptyMessage={t('studentManagement.noStudentsMessage')}
            t={t}
          />

          <DeletePopup
            open={showDeletePopup}
            message="studentManagement.confirmDeleteStudent"
            itemName={(() => {
              const selected = students.find((s) => s.id === selectedStudentId);
              return selected ? getStudentFullName(selected) : '';
            })()}
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
