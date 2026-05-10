import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@gradex/shared/components/Card';
import EmptyState from '@gradex/shared/components/EmptyState';
import { useTranslation } from 'react-i18next';
import StudentIcon from '@gradex/assets/icons/Student.svg';
import IconButton from '@/shared/components/IconButton';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import DeletePopup from '@/shared/popups/DeletePopup';
import ReassignStudentPopup from '../popups/ReassignStudentPopup';
import { useToast } from '@/shared/context/ToastContext';
import { getStudentFullName } from '@/services/api/types/students.types';
import type { StudentDto } from '@/services/api/types/students.types';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudents, deleteStudent } from '@/redux/features/students/studentsSlice';
import { studentsApiService } from '@/services/api/students/students.service';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import { getCurrentSchoolBranchId } from '@/lib/auth';

export default function StudentManagement() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [selectedSchoolBranchId, setSelectedSchoolBranchId] = useState('');
  const [selectedCreatedById, setSelectedCreatedById] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [showReassignPopup, setShowReassignPopup] = useState(false);
  const [reassignStudent, setReassignStudent] = useState<StudentDto | null>(null);
  const [isReassigning, setIsReassigning] = useState(false);
  const schoolBranchId = getCurrentSchoolBranchId();

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
        schoolBranchId: schoolBranchId || undefined,
      })
    );
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 1000,
        filters: {
          schoolBranchId: schoolBranchId || undefined,
          gradeId: selectedGradeId || undefined,
        },
      })
    );
  }, [dispatch, schoolBranchId, selectedGradeId]);

  useEffect(() => {
    dispatch(
      fetchStudents({
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        filters: {
          search: searchTerm || undefined,
          gradeId: selectedGradeId || undefined,
          classroomId: selectedClassroomId || undefined,
          schoolBranchId: getCurrentSchoolBranchId() || undefined,
          date: selectedDate || undefined,
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
    selectedDate,
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
          schoolBranchId: getCurrentSchoolBranchId() || undefined,
          date: selectedDate || undefined,
        },
      })
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGradeId('');
    setSelectedClassroomId('');
    setSelectedSchoolBranchId('');
    setSelectedCreatedById('');
    setSelectedDate('');
  };

  const handleDeleteClick = (id: string) => {
    setSelectedStudentId(id);
    setShowDeletePopup(true);
  };

  const handleReassignClick = (student: StudentDto) => {
    setReassignStudent(student);
    setShowReassignPopup(true);
  };

  const handleReassignClose = () => {
    setShowReassignPopup(false);
    setReassignStudent(null);
  };

  const handleReassignConfirm = async (classroomId: string) => {
    if (!reassignStudent) return;
    setIsReassigning(true);
    try {
      await studentsApiService.assignStudentToClassroom(reassignStudent.id, classroomId);
      showToast({
        message: 'studentManagement.studentReassignedSuccessfully',
        type: 'success',
      });
      handleReassignClose();
      dispatch(
        fetchStudents({
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          filters: {
            search: searchTerm || undefined,
            gradeId: selectedGradeId || undefined,
            classroomId: selectedClassroomId || undefined,
            schoolBranchId: getCurrentSchoolBranchId() || undefined,
            date: selectedDate || undefined,
          },
        })
      );
    } catch (error) {
      showToast({
        message: 'common.errorOccurred',
        type: 'error',
      });
    } finally {
      setIsReassigning(false);
    }
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
    searchTerm ||
    selectedGradeId ||
    selectedClassroomId ||
    selectedSchoolBranchId ||
    selectedCreatedById ||
    selectedDate;
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
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <CustomImage
            src={row.profilePicture || DefaultAvatar}
            fallbackSrc={DefaultAvatar}
            alt={getStudentFullName(row)}
            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
          />
          <span className="flex-1 text-sm font-normal text-[#646969]">
            {getStudentFullName(row) || '-'}
          </span>
          <IconButton
            variant="blue"
            ariaLabel={t('common.view')}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/students/${row.id}`, { state: { from: 'studentsRecord' } });
            }}
            className="h-10 w-10"
          >
            <CustomImage src={EyeStyledIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[260px]',
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
          <IconButton
            status="edit"
            variant="success"
            ariaLabel={t('common.edit')}
            onClick={() => handleReassignClick(row)}
          />
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
          onChange={(value) => {
            const next = Array.isArray(value) ? (value[0] ?? '') : value;
            setSelectedGradeId(next);
            setSelectedClassroomId('');
          }}
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
          placeholder={
            !selectedGradeId
              ? t('studentManagement.educationalStage')
              : isLoadingClassrooms
                ? t('common.loading')
                : t('studentManagement.classes')
          }
          disabled={!selectedGradeId || isLoadingClassrooms}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'created-by-filter',
      placeholder: '',
      value: selectedCreatedById,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedCreatedById}
          onChange={(value) =>
            setSelectedCreatedById(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={[]}
          placeholder={t('studentManagement.createdBy')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'date-filter',
      placeholder: '',
      value: selectedDate,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder={t('studentManagement.date')}
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

          <ReassignStudentPopup
            isOpen={showReassignPopup}
            onClose={handleReassignClose}
            onConfirm={handleReassignConfirm}
            isProcessing={isReassigning}
            gradeId={reassignStudent?.gradeId || undefined}
          />
        </div>
      ) : null}
    </Card>
  );
}
