import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import PeopleRegularIcon from '@gradex/assets/icons/PeopleRegular.svg';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import {
  fetchTeacherAssignmentList,
  deleteTeacher as deleteTeacherAction,
} from '@/redux/features/teachers';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchSchoolStages } from '@/redux/features/lookups';
import type { TeacherAssignmentListItem } from '@/types/teacherAssignment';

// Static school branch ID
const SCHOOL_BRANCH_ID = 'D18C45EA-EEEE-4A41-D35E-08DE1D686083';

export default function TeachersList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedEducationalStage, setSelectedEducationalStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  const { showToast } = useToast();

  const teacherAssignmentList = useAppSelector((state) => state.teachers.teacherAssignmentList);
  const pagination = useAppSelector((state) => state.teachers.pagination);
  const isLoading = useAppSelector((state) => state.teachers.isLoadingAssignmentList);
  const isDeleting = useAppSelector((state) => state.teachers.isDeleting);

  // Get subjects and classrooms from other slices for filter options
  const subjects = useAppSelector((state) => state.subjects.subjects);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const schoolStages = useAppSelector((state) => state.lookups.schoolStages);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);
  const isLoadingClassrooms = useAppSelector((state) => state.classrooms.isLoading);
  const isLoadingSchoolStages = useAppSelector((state) => state.lookups.isLoadingSchoolStages);

  // Fetch filter data on mount
  useEffect(() => {
    dispatch(fetchSubjects({ page: 1, limit: 100 }));
    dispatch(fetchClassrooms({ page: 1, limit: 100 }));
    dispatch(fetchSchoolStages());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchTeacherAssignmentList({
        schoolBranchesId: SCHOOL_BRANCH_ID,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  }, [dispatch, pagination.page, pagination.limit]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchTeacherAssignmentList({
        schoolBranchesId: SCHOOL_BRANCH_ID,
        page,
        limit: pagination.limit,
      })
    );
  };

  // Filter locally since the API doesn't support these filters
  const filteredTeachers = teacherAssignmentList.filter((teacher) => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        teacher.teacherName.toLowerCase().includes(searchLower) ||
        teacher.email.toLowerCase().includes(searchLower) ||
        teacher.phone.includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Subject filter
    if (selectedSubject && teacher.materialId !== selectedSubject) {
      return false;
    }

    // Educational stage filter
    if (selectedEducationalStage && teacher.gradeId !== selectedEducationalStage) {
      return false;
    }

    // Classroom filter
    if (selectedClassroom) {
      const hasClassroom = teacher.classrooms?.some((c) => c.id === selectedClassroom);
      if (!hasClassroom) return false;
    }

    return true;
  });

  const hasActiveFilters =
    searchTerm || selectedSubject || selectedEducationalStage || selectedClassroom;
  const shouldShowEmptyState =
    !isLoading && teacherAssignmentList.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || teacherAssignmentList.length > 0 || hasActiveFilters;

  const columns: DataTableColumn<TeacherAssignmentListItem>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = filteredTeachers?.findIndex((t) => t?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + (index + 1);
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'teachers.teacherName',
      accessor: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/teachers/${row.teacherId}`);
          }}
          className="flex items-center gap-3 transition-colors hover:text-primary-600"
        >
          <span className="font-medium hover:underline">{row.teacherName}</span>
        </button>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'teachers.subjectName',
      accessor: (row) => {
        const materialName = currentLang === 'ar' ? row.materialNameAR : row.materialNameEN;
        return materialName ? (
          <span>{materialName}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
      headerClassName: 'min-w-[120px]',
    },
    {
      header: 'teachers.educationalStages',
      accessor: (row) => {
        const gradeName = currentLang === 'ar' ? row.gradeNameAR : row.gradeNameEN;
        return gradeName ? (
          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            {gradeName}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
      headerClassName: 'min-w-[250px]',
    },
    {
      header: 'teachers.classrooms',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.classrooms && row.classrooms.length > 0 ? (
            row.classrooms.map((classroom) => (
              <span
                key={classroom.id}
                className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
              >
                {currentLang === 'ar' ? classroom.nameAR : classroom.nameEN || classroom.nameAR}
              </span>
            ))
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            variant="success"
            onClick={() => {
              navigate(`/teachers/${row.teacherId}/placement`);
            }}
            ariaLabel={t('teachers.placement.action')}
          >
            <img src={CheckIcon} alt="" className="h-4 w-4" />
          </IconButton>
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedTeacherId(row.teacherId);
              setShowDeletePopup(true);
            }}
            disabled={isDeleting}
            ariaLabel="Delete"
          />
        </div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
  ];

  // Build subject options from the subjects in store
  const subjectOptions = subjects.map((subject) => ({
    value: subject.id,
    label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
  }));

  // Build classroom options from the classrooms in store
  const classroomOptions = classrooms.map((classroom) => ({
    value: classroom.id,
    label: currentLang === 'ar' ? classroom.name : classroom.nameEn || classroom.name,
  }));

  const schoolStageOptions = schoolStages.map((stage) => ({
    value: stage.id,
    label: currentLang === 'ar' ? stage.nameAR : stage.nameEN,
  }));

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchTeacher',
      placeholder: t('teachers.searchTeacher'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '30%',
    },
    {
      type: 'custom',
      name: 'subject-filter',
      placeholder: '',
      value: selectedSubject,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedSubject}
          onChange={(value) => setSelectedSubject(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={subjectOptions}
          placeholder={isLoadingSubjects ? t('common.loading') : t('teachers.selectSubject')}
          disabled={isLoadingSubjects}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'stage-filter',
      placeholder: '',
      value: selectedEducationalStage,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedEducationalStage}
          onChange={(value) =>
            setSelectedEducationalStage(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={schoolStageOptions}
          placeholder={
            isLoadingSchoolStages ? t('common.loading') : t('teachers.selectEducationalStage')
          }
          disabled={isLoadingSchoolStages}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'classroom-filter',
      placeholder: '',
      value: selectedClassroom,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedClassroom}
          onChange={(value) =>
            setSelectedClassroom(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={classroomOptions}
          placeholder={isLoadingClassrooms ? t('common.loading') : t('teachers.selectClassroom')}
          disabled={isLoadingClassrooms}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedEducationalStage('');
    setSelectedClassroom('');
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacherId) return;

    try {
      await dispatch(deleteTeacherAction(selectedTeacherId)).unwrap();
      setShowDeletePopup(false);
      showToast({
        message: 'teachers.teacherDeletedSuccessfully',
        type: 'success',
      });
      // Refresh the list after deletion
      dispatch(
        fetchTeacherAssignmentList({
          schoolBranchesId: SCHOOL_BRANCH_ID,
          page: pagination.page,
          limit: pagination.limit,
        })
      );
    } catch (error) {
      setShowDeletePopup(false);
      const errorMessage = typeof error === 'string' ? error : 'common.errorOccurred';
      const isApiError = typeof error === 'string' && error !== 'common.errorOccurred';
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: isApiError,
      });
    }
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={PeopleRegularIcon}
          description={t('teachers.noTeachersMessage')}
          blend={true}
        />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={filteredTeachers}
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
            message="teachers.confirmDeleteTeacher"
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
