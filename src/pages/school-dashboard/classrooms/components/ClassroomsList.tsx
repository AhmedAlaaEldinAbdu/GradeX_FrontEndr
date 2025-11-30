import { useTranslation } from 'react-i18next';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import DeletePopup from '@/shared/components/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import MathIcon from '@gradex/assets/icons/Math.svg';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import {
  fetchClassrooms,
  deleteClassroom as deleteClassroomAction,
} from '@/redux/features/classrooms/classroomsSlice';
import { getAcademicSystems } from '@/redux/features/academic-system/academicSystemSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';

export default function ClassroomsList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [selectedAcademicSystemId, setSelectedAcademicSystemId] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');

  const { showToast } = useToast();

  // Access state directly
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const pagination = useAppSelector((state) => state.classrooms.pagination);
  const isLoading = useAppSelector((state) => state.classrooms.isLoading);
  const isDeleting = useAppSelector((state) => state.classrooms.isDeleting);

  // AcademicSystems
  const academicSystems = useAppSelector((state) => state.academicSystems.academicSystems);
  const isLoadingAcademicSystems = useAppSelector((state) => state.academicSystems.isLoading);

  // EducationalStages
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const isLoadingEducationalStages = useAppSelector((state) => state.educationalStages.isLoading);

  useEffect(() => {
    dispatch(
      getAcademicSystems({
        pageIndex: 1,
        pageSize: 10000,
      })
    );
    dispatch(
      getEducationalStages({
        pageIndex: 1,
        pageSize: 10000,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchClassrooms({
        page: pagination.page,
        limit: pagination.limit,
        filters: {
          name: searchTerm || undefined,
          academicSystemId: selectedAcademicSystemId || undefined,
          gradeId: selectedGradeId || undefined,
        },
      })
    );
  }, [
    dispatch,
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedAcademicSystemId,
    selectedGradeId,
  ]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchClassrooms({
        page,
        limit: pagination.limit,
        filters: {
          name: searchTerm || undefined,
          academicSystemId: selectedAcademicSystemId || undefined,
          gradeId: selectedGradeId || undefined,
        },
      })
    );
  };

  const hasActiveFilters = searchTerm || selectedAcademicSystemId || selectedGradeId;
  const shouldShowEmptyState = !isLoading && classrooms.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || classrooms.length > 0 || hasActiveFilters;

  const columns: DataTableColumn<any>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = classrooms?.findIndex((g) => g?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + (index + 1);
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'grades.gradeName',
      accessor: (row) => <span>{currentLang === 'ar' ? row.nameAr : row.nameEn}</span>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'grades.classImages',
      accessor: (row) => (
        <div className="flex items-center justify-center">
          {row.imagePath ? (
            <img
              src={row.imagePath}
              alt={currentLang === 'ar' ? row.nameAr : row.nameEn}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
      headerClassName: 'w-[150px]',
      className: 'text-center',
    },
    {
      header: 'grades.academicSystem',
      accessor: (row) => (
        <div>
          <span className="text-sm">{row.academicSystemName}</span>
        </div>
      ),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'grades.educationalStage',
      accessor: (row) => (
        <div>
          <span className="text-sm">{row.gradeName}</span>
        </div>
      ),
      headerClassName: 'min-w-[250px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/classrooms/edit/${row.id}`)}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedClassroomId(row.id);
              setShowDeletePopup(true);
            }}
            className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
            disabled={isDeleting}
          >
            <img src={TrashIcon} alt="Delete" className="h-4 w-4" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchGrade',
      placeholder: t('grades.searchGrade'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '40%',
    },
    {
      type: 'custom',
      name: 'academic-system-filter',
      placeholder: '',
      value: selectedAcademicSystemId,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedAcademicSystemId}
          onChange={(value) =>
            setSelectedAcademicSystemId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={
            Array.isArray(academicSystems)
              ? academicSystems.map((system) => ({
                  value: system?.id || '',
                  label: currentLang === 'ar' ? system?.nameAr || '' : system?.nameEn || '',
                }))
              : []
          }
          placeholder={isLoadingAcademicSystems ? t('common.loading') : t('grades.academicSystem')}
          disabled={isLoadingAcademicSystems}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'grade-filter',
      placeholder: '',
      value: selectedGradeId,
      onChange: () => {},
      width: '30%',
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
            isLoadingEducationalStages ? t('common.loading') : t('grades.educationalStageName')
          }
          disabled={isLoadingEducationalStages}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAcademicSystemId('');
    setSelectedGradeId('');
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClassroomId) return;

    try {
      await dispatch(deleteClassroomAction(selectedClassroomId)).unwrap();
      setShowDeletePopup(false);
      showToast({
        message: 'grades.gradeDeletedSuccessfully',
        type: 'success',
      });
    } catch (error) {
      showToast({
        message: 'common.errorOccurred',
        type: 'error',
      });
    }
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState imgSrc={MathIcon} description={t('grades.noGradesMessage')} blend={true} />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={classrooms}
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
            message="grades.confirmDeleteGrade"
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
