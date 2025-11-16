import Table from '@gradex/shared/components/Table';
import { useTranslation } from 'react-i18next';
import Pagination from '@gradex/shared/components/Pagination';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import DeletePopup from '@/shared/components/DeletePopup';
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
import SearchInput from '@/shared/components/SearchInput';
import Loading from '@/shared/components/Loading';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import ErrorMessage from '@/shared/components/ErrorMessage';

export default function EducationalStagesTab() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState(false);
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
  const error = useAppSelector((state) => state.educationalStages.error);
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

  const columns = [
    {
      header: '#',
      accessor: (_row: EducationalStageResponse) => {
        if (!_row || !Array.isArray(educationalStages) || !pagination) return '-';
        const index = educationalStages?.findIndex((s) => s?.id === _row?.id);
        return (pagination.pageIndex - 1) * pagination.pageSize + (index + 1);
      },
    },
    {
      header: 'academicSystem.educationalStageName',
      accessor: (row: EducationalStageResponse) => (
        <div>{currentLang === 'ar' ? row.nameAr : row.nameEn}</div>
      ),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'academicSystem.title',
      accessor: (row: EducationalStageResponse) => {
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
      accessor: (row: EducationalStageResponse) => {
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
      accessor: (row: EducationalStageResponse) => (
        <div>{row.createdDate ? new Date(row.createdDate).toLocaleDateString() : '-'}</div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row: EducationalStageResponse) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/academic-system/edit-educational-stages/${row.id}`)}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedStageId(row.id);
              setShowDelete(true);
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

  const handleDeleteConfirm = () => {
    if (!selectedStageId) return;
    dispatch(deleteEducationalStage(selectedStageId))
      .unwrap()
      .then((res) => {
        if (res?.isSuccess) {
          setShowDelete(false);
          setShowPopupMessage(true);
          showToast({
            message: 'academicSystem.systemDeletedSuccessfully',
            type: 'success',
          });
          dispatch(getEducationalStages({ pageIndex: currentPage, pageSize }));
        }
      })
      .catch(() => {
        showToast({
          message: 'common.errorOccurred',
          type: 'error',
        });
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
          <div className="flex justify-between">
            <div className="mb-6 flex flex-grow flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg xl:w-[40%]">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder={t('academicSystem.searchEducationalStage')}
                  name="searchEducationalStage"
                />
              </div>
              <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <CustomSelect
                    value={selectedAcademicSystemId}
                    onChange={(value) =>
                      setSelectedAcademicSystemId(Array.isArray(value) ? (value[0] ?? '') : value)
                    }
                    options={
                      Array.isArray(academicSystems)
                        ? academicSystems.map((system) => ({
                            value: system?.id || '',
                            label:
                              currentLang === 'ar' ? system?.nameAr || '' : system?.nameEn || '',
                          }))
                        : []
                    }
                    placeholder={
                      isLoadingAcademicSystems ? t('common.loading') : t('academicSystem.title')
                    }
                    disabled={isLoadingAcademicSystems}
                    maxHeight="200px"
                  />
                </div>

                <div>
                  <CustomSelect
                    value={selectedSubSystemId}
                    onChange={(value) =>
                      setSelectedSubSystemId(Array.isArray(value) ? (value[0] ?? '') : value)
                    }
                    options={
                      Array.isArray(academicSubSystems)
                        ? academicSubSystems.map((subSystem) => ({
                            value: subSystem?.id || '',
                            label:
                              currentLang === 'ar'
                                ? subSystem?.nameAr || ''
                                : subSystem?.nameEn || '',
                          }))
                        : []
                    }
                    placeholder={
                      isLoadingSubSystems ? t('common.loading') : t('academicSystem.systemType')
                    }
                    disabled={isLoadingSubSystems}
                    maxHeight="200px"
                  />
                </div>
              </div>
            </div>
            <div>
              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubSystemId('');
                  setSelectedAcademicSystemId('');
                }}
                className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                title={t('actions.clearFilter')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className=""
                  aria-hidden="true"
                >
                  <path
                    d="M21 12a9 9 0 1 0-3.46 6.54"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 3v6h-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loading />
              </div>
            ) : educationalStages?.length === 0 ? (
              <NotFoundMessage message="common.noResults" />
            ) : error ? (
              <ErrorMessage message="common.errorOccurred" />
            ) : (
              <Table columns={columns} data={educationalStages} keyExtractor={(row) => row.id} />
            )}
          </div>

          {/* Pagination */}
          {educationalStages.length > 0 && (
            <Pagination
              currentPage={pagination.pageIndex}
              totalPages={pagination.totalPages}
              to={Math.min(pagination.pageIndex * pagination.pageSize, pagination.totalItems)}
              from={pagination.totalItems}
              onPageChange={handlePageChange}
            />
          )}

          {/* Popups */}
          {showDelete && (
            <DeletePopup
              message="academicSystem.confirmDeleteSystem"
              onConfirm={handleDeleteConfirm}
              onCancel={() => setShowDelete(false)}
              iconSrc={BigTrashIcon}
            />
          )}
          {showPopupMessage && (
            <PopupMessage
              type="success"
              message="academicSystem.systemDeletedSuccessfully"
              iconSrc={BigSuccessIcon}
              autoClose={true}
              onClose={() => setShowPopupMessage(false)}
            />
          )}
        </div>
      ) : null}
    </Card>
  );
}
