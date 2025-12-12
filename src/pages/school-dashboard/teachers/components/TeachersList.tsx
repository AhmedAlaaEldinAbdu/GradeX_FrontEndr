import { useTranslation } from 'react-i18next';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import PeopleRegularIcon from '@gradex/assets/icons/PeopleRegular.svg';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import { fetchTeachers, deleteTeacher as deleteTeacherAction } from '@/redux/features/teachers';
import type { Teacher } from '@/types/teachers';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';

export default function TeachersList() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedEducationalStage, setSelectedEducationalStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  const { showToast } = useToast();

  const teachers = useAppSelector((state) => state.teachers.teachers);
  const pagination = useAppSelector((state) => state.teachers.pagination);
  const isLoading = useAppSelector((state) => state.teachers.isLoading);
  const isDeleting = useAppSelector((state) => state.teachers.isDeleting);

  // Get subjects and classrooms from other slices for filter options
  const subjects = useAppSelector((state) => state.subjects.subjects);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);

  useEffect(() => {
    dispatch(
      fetchTeachers({
        page: pagination.page,
        limit: pagination.limit,
        filters: {
          searchName: searchTerm || undefined,
          subjectId: selectedSubject || undefined,
          educationalStageId: selectedEducationalStage || undefined,
          classroomId: selectedClassroom || undefined,
        },
      })
    );
  }, [
    dispatch,
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedSubject,
    selectedEducationalStage,
    selectedClassroom,
  ]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchTeachers({
        page,
        limit: pagination.limit,
        filters: {
          searchName: searchTerm || undefined,
          subjectId: selectedSubject || undefined,
          educationalStageId: selectedEducationalStage || undefined,
          classroomId: selectedClassroom || undefined,
        },
      })
    );
  };

  const hasActiveFilters =
    searchTerm || selectedSubject || selectedEducationalStage || selectedClassroom;
  const shouldShowEmptyState = !isLoading && teachers.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || teachers.length > 0 || hasActiveFilters;

  const columns: DataTableColumn<Teacher>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = teachers?.findIndex((t) => t?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + (index + 1);
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'teachers.teacherName',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <CustomImage
              src={row.pictureProfilePath || DefaultAvatar}
              alt={row.fullName}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-medium">{row.fullName}</span>
        </div>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'teachers.subjectName',
      accessor: (row) => {
        // Display subject name if available from API
        if (row.subjectName || row.subjectNameAr || row.subjectNameEn) {
          return (
            <span>
              {currentLang === 'ar'
                ? row.subjectNameAr || row.subjectName
                : row.subjectNameEn || row.subjectName}
            </span>
          );
        }
        // Display subjects array if available
        if (row.subjects && row.subjects.length > 0) {
          return (
            <span>
              {row.subjects.map((s) => (currentLang === 'ar' ? s.nameAr : s.nameEn)).join(', ')}
            </span>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
      headerClassName: 'min-w-[120px]',
    },
    {
      header: 'teachers.educationalStages',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.educationalStages && row.educationalStages.length > 0 ? (
            row.educationalStages.map((stage) => (
              <span
                key={stage.id}
                className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
              >
                {currentLang === 'ar' ? stage.nameAr : stage.nameEn}
              </span>
            ))
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
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
                {currentLang === 'ar' ? classroom.nameAr : classroom.nameEn}
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
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedTeacherId(row.id);
              setShowDeletePopup(true);
            }}
            disabled={isDeleting}
            ariaLabel="Delete"
          />
        </div>
      ),
      headerClassName: 'min-w-[100px]',
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
          placeholder={t('teachers.selectSubject')}
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
          placeholder={t('teachers.selectClassroom')}
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
          options={[]}
          placeholder={t('teachers.selectEducationalStage')}
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
            data={teachers}
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
