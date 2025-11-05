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
// Removed local delete popup handling; actions moved into DropdownMenuAcademicSystemAction
import { useNavigate } from 'react-router-dom';
import AcademicDetailsPopup from '../popups/AcademicSystemDetailsPopup';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  deleteEducationalStage,
  getEducationalStages,
} from '@/redux/features/educational-stages/educationalStagesSlice';
import { getAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import { fetchCountries } from '@/redux/features/lookups';
import type { AcademicSubSystemResponse } from '@/services/api/types/academic-system.types';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import CustomSelect from '@/shared/components/CustomSelect';

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
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [showAcademicDetails, setShowAcademicDetails] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<AcademicSubSystemResponse | null>(null);
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

  const countries = useAppSelector((state) => state.lookups.countries);
  const isLoadingCountries = useAppSelector((state) => state.lookups.isLoadingCountries);

  useEffect(() => {
    dispatch(getAcademicSubSystems());
    dispatch(fetchCountries());
  }, [dispatch]);

  useEffect(() => {
    fetchEducationalStages();
  }, [currentPage, searchTerm, selectedSubSystemId]);

  const fetchEducationalStages = () => {
    dispatch(
      getEducationalStages({
        pageIndex: currentPage,
        pageSize,
        name: searchTerm || undefined,
        academicSubSystemId: selectedSubSystemId || undefined,
      })
    );
  };

  // Delete action handled in DropdownMenuAcademicSystemAction

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSystemClick = (system: EducationalStageResponse) => {
    setSelectedSystem(system as unknown as AcademicSubSystemResponse);
    setShowAcademicDetails(true);
  };

  // Check if we have any filters or search active
  const hasActiveFilters = searchTerm || selectedSubSystemId || selectedCountryId;

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
        <div onClick={() => handleSystemClick(row)} className="cursor-pointer hover:text-green-600">
          {currentLang === 'ar' ? row.nameAr : row.nameEn}
        </div>
      ),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'academicSystem.title',
      accessor: (row: EducationalStageResponse) => (
        <div className="flex flex-wrap gap-1">
          <span className="text-sm">{row.age ?? '-'}</span>
        </div>
      ),

      headerClassName: 'w-[250px]',
    },
    {
      header: 'academicSystem.systemType',
      accessor: (row: EducationalStageResponse) => {
        const subSystem = academicSubSystems.find(
          (subSystem: any) => subSystem?.id === row.academicSubSystemId
        );

        return (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm">
              {currentLang === 'ar' ? subSystem?.nameAr : subSystem?.nameEn || '-'}
            </span>
          </div>
        );
      },
      headerClassName: 'w-[250px]',
    },
    {
      header: 'academicSystem.addedDate',
      accessor: (row: EducationalStageResponse) => (
        <div>{row.created ? new Date(row.created).toLocaleDateString() : '-'}</div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row: EducationalStageResponse) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/academic-system/edit-educational-stage/${row.id}`)}
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
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg xl:w-[40%]">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('academicSystem.searchEducationalStage')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[40px] w-full rounded-lg border border-gray-300 pl-4 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                >
                  <path
                    d="M11 1.25C5.61522 1.25 1.25 5.61522 1.25 11C1.25 16.3848 5.61522 20.75 11 20.75C13.4226 20.75 15.6366 19.8638 17.3418 18.4014L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L18.4023 17.3408C19.8643 15.6358 20.75 13.4221 20.75 11C20.75 5.61522 16.3848 1.25 11 1.25ZM11 2.75C15.5563 2.75 19.25 6.44365 19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75Z"
                    fill="#878F8F"
                  />
                </svg>
              </div>
            </div>
            <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg sm:grid-cols-2 xl:grid-cols-3">
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

              <div>
                <CustomSelect
                  value={selectedCountryId}
                  onChange={(value) =>
                    setSelectedCountryId(Array.isArray(value) ? (value[0] ?? '') : value)
                  }
                  options={
                    Array.isArray(countries)
                      ? countries.map((country) => ({
                          value: country?.id || '',
                          label:
                            currentLang === 'ar'
                              ? country?.arabicName || ''
                              : country?.englishName || '',
                        }))
                      : []
                  }
                  placeholder={
                    isLoadingCountries ? t('common.loading') : t('academicSystem.country')
                  }
                  disabled={isLoadingCountries}
                  maxHeight="200px"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              </div>
            ) : educationalStages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-lg text-gray-500">{t('common.noResults')}</p>
              </div>
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
              from={(pagination.pageIndex - 1) * pagination.pageSize + 1}
              onPageChange={handlePageChange}
            />
          )}

          {/* Popups */}
          {showDelete && (
            <DeletePopup
              message="academicSystem.confirmDeleteSystem"
              onConfirm={() => {
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
                        duration: 3000,
                        position: 'bottom-left',
                      });
                      fetchEducationalStages();
                    }
                  })
                  .catch(() => {
                    showToast({
                      message: 'common.errorOccurred',
                      type: 'error',
                      duration: 3000,
                      position: 'bottom-left',
                    });
                  });
              }}
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
              duration={2000}
              onClose={() => setShowPopupMessage(false)}
            />
          )}

          {showAcademicDetails && selectedSystem && (
            <AcademicDetailsPopup
              system={selectedSystem}
              onClose={() => setShowAcademicDetails(false)}
            />
          )}
        </div>
      ) : null}
    </Card>
  );
}
