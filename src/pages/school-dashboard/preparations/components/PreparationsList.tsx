import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import {
  fetchPreparations,
  deletePreparation,
} from '@/redux/features/preparations/preparationsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import type { Preparation } from '@/types/preparations';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import Input from '@/shared/components/Input';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import EmptyState from '@/shared/components/EmptyState';
import FilesGreenIcon from '@gradex/assets/icons/FilesGreen.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import CustomSelect from '@/shared/components/CustomSelect';
import { tokenManager } from '@/lib/auth/token-manager';
import { useToast } from '@/shared/context/ToastContext';
// import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
// import CustomImage from '@/shared/components/CustomImage';

export default function PreparationsList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { preparations, pagination, isLoading, isDeleting } = useSelector(
    (state: RootState) => state.preparations
  );
  const { educationalStages } = useSelector((state: RootState) => state.educationalStages);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState(''); // Maps to GradeId
  const [selectedGrade, setSelectedGrade] = useState(''); // Maps to ClassRoomId
  const [selectedDate, setSelectedDate] = useState('');

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedPrepId, setSelectedPrepId] = useState('');

  const { showToast } = useToast();

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  useEffect(() => {
    dispatch(getEducationalStages({ schoolBranchId, pageIndex: 1, pageSize: 1000 }));
    dispatch(
      fetchClassrooms({ filters: { schoolBranchId: schoolBranchId || undefined }, limit: 1000 })
    );
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    dispatch(
      fetchPreparations({
        schoolBranchId,
        page: 1,
        limit: pagination.limit,
        filters: {
          searchTerm: searchTerm || undefined,
          gradeId: selectedStage || undefined,
          classRoomId: selectedGrade || undefined,
          date: selectedDate || undefined,
        },
      })
    );
  }, [dispatch, schoolBranchId, searchTerm, selectedStage, selectedGrade, selectedDate]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchPreparations({
        schoolBranchId,
        page,
        limit: pagination.limit,
        filters: {
          searchTerm: searchTerm || undefined,
          gradeId: selectedStage || undefined,
          classRoomId: selectedGrade || undefined,
          date: selectedDate || undefined,
        },
      })
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setSelectedGrade('');
    setSelectedDate('');
  };

  const columns: DataTableColumn<Preparation>[] = [
    {
      header: '#',
      accessor: (_, index) =>
        ((pagination.page - 1) * pagination.limit + ((index || 0) + 1)).toString(),
      headerClassName: 'w-16',
      className: 'text-center text-gray-500',
    },
    {
      header: 'preparations.preparationNumber',
      accessor: (row) => <span className="text-gray-500">{row.preparationNumber}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'preparations.topicName',
      accessor: (row) => <span className="text-gray-500">{row.topic}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    // {
    //   header: 'preparations.teacherName',
    //   accessor: (row) => (
    //     <div className="flex items-center justify-center gap-3">
    //       {/* Avatar omitted since it is not retrieved in the endpoint snippet currently */}
    //       <span className="font-medium text-gray-500">{row.createdName || '-'}</span>
    //       <IconButton
    //         onClick={() => navigate(`/calendar/preparations/details/${row.id}`)}
    //         ariaLabel="View"
    //         className="flex h-[32px] w-[32px] items-center justify-center rounded-full! bg-[#EAF4F4]! shadow-none! hover:bg-[#D9EBEB]"
    //       >
    //         <CustomImage src={EyeStyledIcon} alt="View" className="h-[20px] w-[20px]" />
    //       </IconButton>
    //     </div>
    //   ),
    //   headerClassName: 'min-w-[280px]',
    //   className: 'text-center',
    // },
    {
      header: 'preparations.subjectName',
      accessor: (row) => (
        <span className="text-gray-500">{row.materialNameAr || row.materialNameEn}</span>
      ),
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'preparations.teacherName',
      accessor: (row) => <span className="text-gray-500">{row.teacherName || '-'}</span>,
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'preparations.educationalStage',
      accessor: (row) => <span className="text-gray-500">{row.gradeNameAr}</span>,
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'preparations.grade',
      accessor: (row) => (
        <span className="text-gray-500">
          {row.classRooms && row.classRooms.length > 0
            ? row.classRooms
                .map((c) => `${i18n.language === 'ar' ? c.nameAr : c.nameEn}`.trim())
                .join(', ')
            : '-'}
        </span>
      ),
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
    {
      header: 'preparations.date',
      accessor: (row) => (
        <span className="text-gray-500">{new Date(row.preparationDate).toLocaleDateString()}</span>
      ),
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
    {
      header: 'preparations.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            onClick={() => navigate(`/calendar/preparations/edit-preparation/${row.id}`)}
            ariaLabel={t('common.edit')}
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedPrepId(row.id);
              setShowDeletePopup(true);
            }}
            ariaLabel={t('common.delete')}
          />
        </div>
      ),
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'prep-search',
      placeholder: t('preparations.searchTopicName'),
      value: searchTerm,
      onChange: (value) => setSearchTerm((value as string) ?? ''),
      width: '40%',
    },
    {
      type: 'custom',
      name: 'prep-stage',
      placeholder: '',
      value: selectedStage,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(val) =>
            setSelectedStage(Array.isArray(val) ? (val[0] as string) : (val as string))
          }
          options={educationalStages.map((stage) => ({
            value: stage.id,
            label: stage.nameAr || stage.nameEn || '',
          }))}
          placeholder={t('preparations.educationalStage')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'prep-grade',
      placeholder: '',
      value: selectedGrade,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedGrade}
          onChange={(val) =>
            setSelectedGrade(Array.isArray(val) ? (val[0] as string) : (val as string))
          }
          options={classrooms.map((c) => ({
            value: c.id,
            label: `${c.name || ''} ${c.nameEn || ''}`.trim(),
          }))}
          placeholder={t('preparations.grade')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'prep-date',
      value: selectedDate,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <Input
          type="text"
          placeholder={t('preparations.date')}
          value={selectedDate}
          onFocus={(e) => (e.target.type = 'date')}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-[40px] w-full"
        />
      ),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (!selectedPrepId) return;

    try {
      await dispatch(deletePreparation(selectedPrepId)).unwrap();
      setShowDeletePopup(false);
      showToast({
        message: 'preparations.deletedSuccessfully',
        type: 'success',
      });
    } catch (error: unknown) {
      const message = typeof error === 'string' ? error : t('common.errorOccurred');
      showToast({
        message,
        type: 'error',
        isRaw: typeof error === 'string',
      });
    }
  };

  const hasActiveFilters = Boolean(searchTerm || selectedStage || selectedGrade || selectedDate);
  const shouldShowEmptyState = preparations.length === 0 && !hasActiveFilters && !isLoading;

  const tablePagination = {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: pagination.totalPages,
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={FilesGreenIcon}
          description={t('preparations.noPreparations')}
          blend={true}
        />
      ) : (
        <>
          <DataTable
            data={preparations}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={tablePagination}
            onPageChange={handlePageChange}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            emptyMessage={t('common.noResults')}
            t={t}
            isLoading={isLoading}
          />

          <DeletePopup
            open={showDeletePopup}
            message="preparations.confirmDelete"
            itemName={preparations.find((d) => d.id === selectedPrepId)?.topic || ''}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isProcessing={isDeleting}
          />
        </>
      )}
    </Card>
  );
}
