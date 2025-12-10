import { useTranslation } from 'react-i18next';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import BookIcon from '@gradex/assets/icons/Book.svg';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import {
  fetchSubjects,
  deleteSubject as deleteSubjectAction,
} from '@/redux/features/subjects/subjectsSlice';

import type { Subject } from '@/types/subjects';
import { MATERIAL_LEVELS } from '@/constants';

export default function SubjectsList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const { showToast } = useToast();

  const subjects = useAppSelector((state) => state.subjects.subjects);
  const pagination = useAppSelector((state) => state.subjects.pagination);
  const isLoading = useAppSelector((state) => state.subjects.isLoading);
  const isDeleting = useAppSelector((state) => state.subjects.isDeleting);

  useEffect(() => {
    dispatch(
      fetchSubjects({
        page: pagination.page,
        limit: pagination.limit,
        filters: {
          searchName: searchTerm || undefined,
          level: selectedLevel ? Number(selectedLevel) : undefined,
        },
      })
    );
  }, [dispatch, pagination.page, pagination.limit, searchTerm, selectedLevel]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchSubjects({
        page,
        limit: pagination.limit,
        filters: {
          searchName: searchTerm || undefined,
          level: selectedLevel ? Number(selectedLevel) : undefined,
        },
      })
    );
  };

  const hasActiveFilters = searchTerm || selectedLevel;
  const shouldShowEmptyState = !isLoading && subjects.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || subjects.length > 0 || hasActiveFilters;

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return t('subjects.levelEasy');
      case 2:
        return t('subjects.levelMedium');
      case 3:
        return t('subjects.levelDifficult');
      default:
        return '-';
    }
  };

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: DataTableColumn<Subject>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = subjects?.findIndex((s) => s?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + (index + 1);
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'subjects.subjectName',
      accessor: (row) => <span>{currentLang === 'ar' ? row.name : row.nameEn || row.name}</span>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'subjects.level',
      accessor: (row) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(row.materialLevel)}`}
        >
          {getLevelLabel(row.materialLevel)}
        </span>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'subjects.schoolStages',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.schoolStages && row.schoolStages.length > 0 ? (
            row.schoolStages.map((stage) => (
              <span
                key={stage.id}
                className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
              >
                {currentLang === 'ar' ? stage.nameAr : stage.nameEn}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
      headerClassName: 'min-w-[250px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            onClick={() => navigate(`/subjects/edit/${row.id}`)}
            ariaLabel="Edit"
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedSubjectId(row.id);
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

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchSubject',
      placeholder: t('subjects.searchSubject'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '60%',
    },
    {
      type: 'custom',
      name: 'level-filter',
      placeholder: '',
      value: selectedLevel,
      onChange: () => {},
      width: '40%',
      customComponent: (
        <CustomSelect
          value={selectedLevel}
          onChange={(value) => setSelectedLevel(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={MATERIAL_LEVELS.map((level) => ({
            value: level.value,
            label: t(level.labelKey),
          }))}
          placeholder={t('subjects.selectLevel')}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLevel('');
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubjectId) return;

    try {
      await dispatch(deleteSubjectAction(selectedSubjectId)).unwrap();
      setShowDeletePopup(false);
      showToast({
        message: 'subjects.subjectDeletedSuccessfully',
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
        <EmptyState imgSrc={BookIcon} description={t('subjects.noSubjectsMessage')} blend={true} />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={subjects}
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
            message="subjects.confirmDeleteSubject"
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
