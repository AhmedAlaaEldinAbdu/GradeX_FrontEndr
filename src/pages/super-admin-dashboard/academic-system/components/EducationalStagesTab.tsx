import { useTranslation } from 'react-i18next';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import DeletePopup from '@/shared/popups/DeletePopup';
import PopupMessage from '@/shared/components/PopupMessage';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import AcademicIcon from '@gradex/assets/icons/Academic.svg';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  deleteEducationalStage,
  getEducationalStages,
} from '@/redux/features/educational-stages/educationalStagesSlice';
import { getAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import { fetchCountries } from '@/redux/features/lookups';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

export default function EducationalStagesTab() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedSubSystemId, setSelectedSubSystemId] = useState('');
  const [selectedAcademicSystemId, setSelectedAcademicSystemId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Redux state
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const pagination = useAppSelector((state) => state.educationalStages.pagination);
  const isLoading = useAppSelector((state) => state.educationalStages.isLoading);
  const isDeleting = useAppSelector((state) => state.educationalStages.isDeleting);
  const { showToast } = useToast();

  const academicSubSystems = useAppSelector((state) => state.academicSubSystems.academicSubSystems);
  const isLoadingSubSystems = useAppSelector((state) => state.academicSubSystems.isLoading);

  const academicSystems = useAppSelector((state) => state.academicSystems.academicSystems);
  const isLoadingAcademicSystems = useAppSelector((state) => state.academicSystems.isLoading);

  useEffect(() => {
    dispatch(getAcademicSubSystems({ pageIndex: 1, pageSize: 1000 }));
    dispatch(fetchCountries());
  }, [dispatch]);

  useEffect(() => {
    fetchEducationalStages();
  }, [currentPage, searchTerm, selectedSubSystemId, selectedAcademicSystemId]);

  const fetchEducationalStages = () => {
    dispatch(
      getEducationalStages({
        pageIndex: currentPage,
        pageSize,
        ...(currentLang === 'ar'
          ? { nameAr: searchTerm || undefined }
          : { nameEn: searchTerm || undefined }),
        acdemicSubsystemId: selectedSubSystemId || undefined,
        acdemicsystemId: selectedAcademicSystemId || undefined,
      })
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Check if we have any filters or search active
  const hasActiveFilters = searchTerm || selectedSubSystemId || selectedAcademicSystemId;

  // Show empty state only when: not loading AND no data AND no active filters
  const shouldShowEmptyState = !isLoading && educationalStages.length === 0 && !hasActiveFilters;

  // Show content when: loading OR has data OR has active filters
  const shouldShowContent = isLoading || educationalStages.length > 0 || hasActiveFilters;

  const columns: DataTableColumn<EducationalStageResponse>[] = [
    {
      header: '#',
      accessor: (_row) => {
        if (!_row || !Array.isArray(educationalStages) || !pagination) return '-';
        const index = educationalStages?.findIndex((s) => s?.id === _row?.id);
        return (pagination.pageIndex - 1) * pagination.pageSize + (index + 1);
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'academicSystem.educationalStageName',
      accessor: (row) => <div>{currentLang === 'ar' ? row.nameAr : row.nameEn}</div>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'academicSystem.title',
      accessor: (row) => {
        const academicSystemNames = row.academicSystemsDto?.map((academicSys) =>
          currentLang === 'ar' ? academicSys.nameAr : academicSys.nameEn
        );
        return (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm">{academicSystemNames?.join(' - ')}</span>
          </div>
        );
      },
      headerClassName: 'w-[250px]',
    },
    {
      header: 'academicSystem.systemType',
      accessor: (row) => {
        return (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm">
              {currentLang === 'ar'
                ? row.academicSubSystemGradeDto?.nameAr
                : row.academicSubSystemGradeDto?.nameEn || '-'}
            </span>
          </div>
        );
      },
      headerClassName: 'w-[250px]',
    },
    {
      header: 'academicSystem.addedDate',
      accessor: (row) => (
        <div>{row.createdDate ? new Date(row.createdDate).toLocaleDateString() : '-'}</div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/academic-system/edit-educational-stages/${row.id}`)}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedStageId(row.id);
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
      name: 'searchEducationalStage',
      placeholder: t('academicSystem.searchEducationalStage'),
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
          placeholder={isLoadingAcademicSystems ? t('common.loading') : t('academicSystem.title')}
          disabled={isLoadingAcademicSystems}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'subsystem-filter',
      placeholder: '',
      value: selectedSubSystemId,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedSubSystemId}
          onChange={(value) =>
            setSelectedSubSystemId(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={
            Array.isArray(academicSubSystems)
              ? academicSubSystems.map((subSystem) => ({
                  value: subSystem?.id || '',
                  label: currentLang === 'ar' ? subSystem?.nameAr || '' : subSystem?.nameEn || '',
                }))
              : []
          }
          placeholder={isLoadingSubSystems ? t('common.loading') : t('academicSystem.systemType')}
          disabled={isLoadingSubSystems}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubSystemId('');
    setSelectedAcademicSystemId('');
  };

  const handleDeleteConfirm = () => {
    if (!selectedStageId) return;
    dispatch(deleteEducationalStage(selectedStageId))
      .unwrap()
      .then((res) => {
        if (res?.isSuccess) {
          setShowDeletePopup(false);
          showToast({
            message: 'academicSystem.systemDeletedSuccessfully',
            type: 'success',
          });
          dispatch(getEducationalStages({ pageIndex: currentPage, pageSize }));
        } else {
          showToast({
            message: res?.errors?.[0] || t('common.errorOccurred'),
            type: 'error',
          });
          setShowDeletePopup(false);
        }
      })
      .catch(() => {
        showToast({
          message: 'common.errorOccurred',
          type: 'error',
        });
        setShowDeletePopup(false);
      });
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={AcademicIcon}
          description={t('academicSystem.noEducationalStages')}
          blend={true}
        />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={educationalStages}
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
            message="academicSystem.confirmDeleteSystem"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isProcessing={isDeleting}
          />
          <PopupMessage
            open={showPopupMessage.show}
            type={showPopupMessage.type}
            message={showPopupMessage.message}
            iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
            autoClose={true}
            onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
          />
        </div>
      ) : null}
    </Card>
  );
}
