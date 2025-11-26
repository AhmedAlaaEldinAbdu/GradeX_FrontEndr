import { useTranslation } from 'react-i18next';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import DeletePopup from '@/shared/components/DeletePopup';
import PopupMessage from '@/shared/components/PopupMessage';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import MathIcon from '@gradex/assets/icons/Math.svg';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

export default function GradesList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedAcademicSystemId, setSelectedAcademicSystemId] = useState('');
  const [selectedEducationalStageId, setSelectedEducationalStageId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { showToast } = useToast();

  // TODO: Replace with actual Redux selectors when slice is created
  const grades: any[] = [
    {
      id: '1',
      nameAr: 'الصف الثاني الإعدادي',
      nameEn: '2/ع',
      classImage: 'https://picsum.photos/seed/grade1/100/100',
      academicSystem: { nameAr: 'العالمي', nameEn: 'International' },
      educationalStage: { nameAr: 'المرحلة الإعدادية', nameEn: 'Middle School' },
    },
    {
      id: '2',
      nameAr: 'الصف الأول الثانوي',
      nameEn: '1/ث',
      classImage: 'https://picsum.photos/seed/grade2/100/100',
      academicSystem: { nameAr: 'الأمريكي', nameEn: 'American' },
      educationalStage: { nameAr: 'المرحلة الثانوية', nameEn: 'High School' },
    },
    {
      id: '3',
      nameAr: 'الصف الثالث الابتدائي',
      nameEn: '3/ب',
      classImage: null,
      academicSystem: { nameAr: 'البريطاني', nameEn: 'British' },
      educationalStage: { nameAr: 'المرحلة الابتدائية', nameEn: 'Primary School' },
    },
    {
      id: '4',
      nameAr: 'الصف الخامس الابتدائي',
      nameEn: '5/ب',
      classImage: 'https://picsum.photos/seed/grade4/100/100',
      academicSystem: { nameAr: 'العالمي', nameEn: 'International' },
      educationalStage: { nameAr: 'المرحلة الابتدائية', nameEn: 'Primary School' },
    },
    {
      id: '5',
      nameAr: 'الصف السادس الابتدائي',
      nameEn: '6/ب',
      classImage: 'https://picsum.photos/seed/grade5/100/100',
      academicSystem: { nameAr: 'الأمريكي', nameEn: 'American' },
      educationalStage: { nameAr: 'المرحلة الابتدائية', nameEn: 'Primary School' },
    },
  ];
  const pagination = {
    pageIndex: 1,
    pageSize: 10,
    totalItems: 5,
    totalPages: 1,
  };
  const isLoading = false;
  const isDeleting = false;

  const academicSystems: any[] = [
    { id: 'sys1', nameAr: 'العالمي', nameEn: 'International' },
    { id: 'sys2', nameAr: 'الأمريكي', nameEn: 'American' },
    { id: 'sys3', nameAr: 'البريطاني', nameEn: 'British' },
  ];
  const isLoadingAcademicSystems = false;

  const educationalStages: any[] = [
    { id: 'stage1', nameAr: 'المرحلة الابتدائية', nameEn: 'Primary School' },
    { id: 'stage2', nameAr: 'المرحلة الإعدادية', nameEn: 'Middle School' },
    { id: 'stage3', nameAr: 'المرحلة الثانوية', nameEn: 'High School' },
  ];
  const isLoadingEducationalStages = false;

  useEffect(() => {
    // TODO: Fetch grades when Redux is ready
    // dispatch(getGrades({ pageIndex: currentPage, pageSize, nameAr: searchTerm, academicSystemId: selectedAcademicSystemId, educationalStageId: selectedEducationalStageId }));
  }, [currentPage, searchTerm, selectedAcademicSystemId, selectedEducationalStageId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasActiveFilters = searchTerm || selectedAcademicSystemId || selectedEducationalStageId;
  const shouldShowEmptyState = !isLoading && grades.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || grades.length > 0 || hasActiveFilters;

  const columns: DataTableColumn<any>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = grades?.findIndex((g) => g?.id === _row?.id);
        return (pagination.pageIndex - 1) * pagination.pageSize + (index + 1);
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
          {row.classImage ? (
            <img
              src={row.classImage}
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
          <span className="text-sm">
            {currentLang === 'ar' ? row.academicSystem?.nameAr : row.academicSystem?.nameEn}
          </span>
        </div>
      ),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'grades.educationalStage',
      accessor: (row) => (
        <div>
          <span className="text-sm">
            {currentLang === 'ar' ? row.educationalStage?.nameAr : row.educationalStage?.nameEn}
          </span>
        </div>
      ),
      headerClassName: 'min-w-[250px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/grades/edit-grade/${row.id}`)}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedGradeId(row.id);
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
      name: 'educational-stage-filter',
      placeholder: '',
      value: selectedEducationalStageId,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedEducationalStageId}
          onChange={(value) =>
            setSelectedEducationalStageId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
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
    setSelectedEducationalStageId('');
  };

  const handleDeleteConfirm = () => {
    if (!selectedGradeId) return;
    // TODO: Implement delete when Redux is ready
    // dispatch(deleteGrade(selectedGradeId))
    setShowDeletePopup(false);
    showToast({
      message: 'grades.gradeDeletedSuccessfully',
      type: 'success',
    });
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState imgSrc={MathIcon} description={t('grades.noGradesMessage')} blend={true} />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={grades}
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
