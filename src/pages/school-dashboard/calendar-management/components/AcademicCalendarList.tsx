import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import EmptyState from '@/shared/components/EmptyState';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import CalendarEmptyIcon from '@/assets/icons/calendar.svg';
import Input from '@/shared/components/Input';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  deleteAcademicCalendar,
  fetchAcademicCalendars,
} from '@/redux/features/academic-calendar/academicCalendarSlice';
import { fetchSchoolStages } from '@/redux/features/lookups/lookupsSlice';
import { selectSchoolStages } from '@/redux/features/lookups/lookupsSelectors';

type AcademicCalendarRow = {
  id: string;
  stageNameAr: string;
  stageNameEn: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  weeksCount: number;
};

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB');
};

export default function AcademicCalendarList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  const currentLang = i18n.language as 'ar' | 'en';

  const { calendars, pagination, isLoading, isDeleting } = useAppSelector(
    (state) => state.academicCalendar
  );
  const schoolStages = useAppSelector(selectSchoolStages);

  const DummySchoolBranchId = '41b6a93d-947c-4d58-959a-08de1c988710';

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [page, setPage] = useState(1);
  const limit = 10;

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');

  const hasActiveFilters = Boolean(searchTerm || startDate || endDate);

  useEffect(() => {
    if (schoolStages.length > 0) return;
    dispatch(fetchSchoolStages());
  }, [dispatch, schoolStages.length]);

  useEffect(() => {
    dispatch(
      fetchAcademicCalendars({
        page,
        limit,
        filters: {
          schoolBranchId: DummySchoolBranchId,
          searchTerm: searchTerm.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      })
    );
  }, [dispatch, page, limit, searchTerm, startDate, endDate]);

  const stageNameById = useMemo(() => {
    const map = new Map<string, { ar: string; en: string }>();
    schoolStages.forEach((stage) => {
      map.set(stage.id, { ar: stage.nameAR, en: stage.nameEN || stage.nameAR });
    });
    return map;
  }, [schoolStages]);

  const tableRows = useMemo<AcademicCalendarRow[]>(() => {
    return (calendars || []).map((calendar) => {
      const stage = stageNameById.get(calendar.lkSchoolStageId);
      const apiStageNameAr = calendar.lkSchoolStageNameAr || undefined;
      const apiStageNameEn = calendar.lkSchoolStageNameEn || undefined;

      return {
        id: calendar.id,
        stageNameAr: apiStageNameAr || stage?.ar || '-',
        stageNameEn: apiStageNameEn || stage?.en || '-',
        startDate: calendar.studyStartDate?.slice(0, 10) || '',
        endDate: calendar.studyEndDate?.slice(0, 10) || '',
        weeksCount: calendar.weeksCount || 0,
      };
    });
  }, [calendars, stageNameById]);

  const shouldShowEmptyState = tableRows.length === 0 && !hasActiveFilters && !isLoading;

  const columns: DataTableColumn<AcademicCalendarRow>[] = [
    {
      header: '#',
      accessor: (_row, index = 0) => (page - 1) * limit + (index + 1),
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'academicCalendar.table.educationalStages',
      accessor: (row) => (
        <span className="text-gray-700">
          {currentLang === 'ar' ? row.stageNameAr : row.stageNameEn}
        </span>
      ),
      headerClassName: 'min-w-[220px]',
    },
    {
      header: 'academicCalendar.table.startDate',
      accessor: (row) => <span>{formatDate(row.startDate)}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'academicCalendar.table.endDate',
      accessor: (row) => <span>{formatDate(row.endDate)}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'academicCalendar.table.weeksCount',
      accessor: (row) => <span>{row.weeksCount}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            onClick={() => navigate(`/calendar/academic/edit-academic-calendar/${row.id}`)}
            ariaLabel={t('actions.edit')}
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedId(row.id);
              setShowDeletePopup(true);
            }}
            ariaLabel={t('actions.delete')}
          />
        </div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'academic-calendar-search',
      placeholder: t('academicCalendar.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '40%',
    },
    {
      type: 'custom',
      name: 'academic-calendar-start',
      value: startDate,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <Input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
          placeholder={t('academicCalendar.startDatePlaceholder')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'academic-calendar-end',
      value: endDate,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <Input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          placeholder={t('academicCalendar.endDatePlaceholder')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;

    try {
      await dispatch(deleteAcademicCalendar(selectedId)).unwrap();
      setShowDeletePopup(false);
      setSelectedId('');
      showToast({
        message: 'academicCalendar.toast.deleteSuccess',
        type: 'success',
      });
    } catch {
      showToast({
        message: 'common.errorOccurred',
        type: 'error',
      });
    }
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={CalendarEmptyIcon}
          title={t('academicCalendar.emptyStateTitle')}
          description={t('academicCalendar.emptyStateDescription')}
          blend={true}
        />
      ) : (
        <div>
          <DataTable
            data={tableRows}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              totalPages: pagination.totalPages,
            }}
            onPageChange={setPage}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            isLoading={isLoading}
            emptyMessage={t('common.noResults')}
            t={t}
          />

          <DeletePopup
            open={showDeletePopup}
            message="academicCalendar.confirmDelete"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isProcessing={isDeleting}
          />
        </div>
      )}
    </Card>
  );
}
