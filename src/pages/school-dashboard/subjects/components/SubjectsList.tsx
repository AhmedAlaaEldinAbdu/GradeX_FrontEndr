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
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import {
  fetchSubjects,
  deleteSubject as deleteSubjectAction,
} from '@/redux/features/subjects/subjectsSlice';
import { fetchTeachers } from '@/redux/features/teachers';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import SchoolYellowIcon from '@/assets/icons/SchoolYellow.svg';
import TeachersBlueIcon from '@/assets/icons/TeachersBlue.svg';

import type { Subject } from '@/types/subjects';
import { MATERIAL_LEVELS } from '@/constants';

export default function SubjectsList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const limit = 10;
  const { showToast } = useToast();

  const subjects = useAppSelector((state) => state.subjects.subjects);
  const pagination = useAppSelector((state) => state.subjects.pagination);
  const teachersPagination = useAppSelector((state) => state.teachers.pagination);
  const isLoading = useAppSelector((state) => state.subjects.isLoading);
  const isDeleting = useAppSelector((state) => state.subjects.isDeleting);

  useEffect(() => {
    dispatch(
      fetchSubjects({
        page: pagination.page,
        limit: limit,
        filters: {
          searchName: searchTerm || undefined,
          level: selectedLevel ? Number(selectedLevel) : undefined,
        },
      })
    );
  }, [dispatch, pagination.page, limit, searchTerm, selectedLevel]);

  useEffect(() => {
    if (!schoolBranchId) return;

    dispatch(
      fetchTeachers({
        page: 1,
        limit: 1,
        filters: {
          schoolBranchesId: schoolBranchId,
        },
      })
    );
  }, [dispatch, schoolBranchId]);

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
        return 'bg-lightGreen-100 text-lightGreen-500';
      case 2:
        return 'bg-orange-100 text-orange-500';
      case 3:
        return 'bg-sky-100 text-sky-500';
      default:
        return 'bg-gray-100 text-gray-500';
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
      header: 'subjects.materialLevel',
      accessor: (row) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 ${getLevelBadgeColor(row.materialLevel)}`}
        >
          {getLevelLabel(row.materialLevel)}
        </span>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'subjects.educationalStage',
      accessor: (row) => (
        <div>
          <>{console.log(row)}</>
          {row.schoolStages && row.schoolStages.length > 0 ? (
            row.schoolStages
              .map((stage) => (currentLang === 'ar' ? stage.nameAr : stage.nameEn))
              .join(' - ')
          ) : (
            <span className="text-gray-400">-</span>
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
      placeholder: t('subjects.searchByMaterialOrStageName'),
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
          placeholder={t('subjects.materialLevel')}
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
      await dispatch(deleteSubjectAction(selectedSubjectId))
        .unwrap()
        .then((res: any) => {
          if (res.isSuccess === true || res === selectedSubjectId) {
            showToast({
              message: 'subjects.subjectDeletedSuccessfully',
              type: 'success',
            });
          } else {
            showToast({
              message: 'common.errorOccurred',
              type: 'error',
            });
          }
        });
      setShowDeletePopup(false);
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MetricCard
          title={t('subjects.totalSubjects')}
          value={pagination.total}
          icon={
            <CustomImage
              src={SchoolYellowIcon}
              alt={t('subjects.totalSubjects')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-amber-50 text-amber-600"
        />
        <MetricCard
          title={t('teachers.totalTeachers')}
          value={teachersPagination.total}
          icon={
            <CustomImage
              src={TeachersBlueIcon}
              alt={t('teachers.totalTeachers')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-blue-50 text-blue-600"
        />
      </div>
      <Card>
        {shouldShowEmptyState ? (
          <EmptyState
            imgSrc={BookIcon}
            description={t('subjects.noSubjectsMessage')}
            blend={true}
          />
        ) : shouldShowContent ? (
          <div>
            <DataTable
              data={subjects}
              columns={columns}
              keyExtractor={(row) => row.id}
              pagination={{
                page: pagination.page,
                limit: limit,
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
              itemName={(() => {
                const selected = subjects.find((s) => s.id === selectedSubjectId);
                return currentLang === 'ar'
                  ? (selected?.name ?? '')
                  : (selected?.nameEn ?? selected?.name ?? '');
              })()}
              onConfirm={handleDeleteConfirm}
              onCancel={() => setShowDeletePopup(false)}
              iconSrc={BigTrashIcon}
              isProcessing={isDeleting}
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
