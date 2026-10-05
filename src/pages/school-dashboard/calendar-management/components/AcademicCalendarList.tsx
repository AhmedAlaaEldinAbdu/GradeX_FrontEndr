import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import EmptyState from '@/shared/components/EmptyState';
import IconButton from '@/shared/components/IconButton';
import SearchInput from '@/shared/components/SearchInput';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import CalendarEmptyIcon from '@/assets/icons/calendar.svg';
import Calendar11GreenIcon from '@/assets/icons/Calendar11Green.svg';
import LayersGreenIcon from '@/assets/icons/LayersGreen.svg';
import DotsVerticalGreenSmIcon from '@/assets/icons/DotsVerticalGreenSm.svg';
import PlusWhiteSmIcon from '@/assets/icons/PlusWhiteSm.svg';
import SearchGraySmIcon from '@/assets/icons/SearchGraySm.svg';
import FilterGrayIcon from '@/assets/icons/FilterGray.svg';
import ChevronDownGraySmIcon from '@/assets/icons/ChevronDownGraySm.svg';
import PencilGreenIcon from '@/assets/icons/PencilGreen.svg';
import TrashRoseIcon from '@/assets/icons/TrashRose.svg';
import RefreshGrayIcon from '@/assets/icons/RefreshGray.svg';
import PrinterBlackIcon from '@/assets/icons/PrinterBlack.svg';
import ExcelFileBlackIcon from '@/assets/icons/ExcelFileBlack.svg';
import MaterialPdfBlackIcon from '@/assets/icons/MaterialPdfBlack.svg';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import {
  deleteAcademicCalendar,
  fetchAcademicCalendars,
} from '@/redux/features/academic-calendar/academicCalendarSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { getSchoolAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import {
  AcademicCalendarStatus,
  type AcademicCalendarStatusType,
} from '@/services/api/types/academic-calendar.types';
import {
  FILTER_SEARCH_ICON_CLASS,
  FILTER_SEARCH_INPUT_CLASS,
  FilterDateInput,
  FilterSelect,
} from './AcademicCalendarFilterControls';
import AcademicCalendarPagination from './AcademicCalendarPagination';
import AcademicCalendarFormPopup from './AcademicCalendarFormPopup';

const PAGE_SIZE = 10;
const PANEL_SURFACE = 'rounded-2xl border border-[#E2E8F0] bg-white';

type AcademicCalendarRow = {
  id: string;
  gradeNameAr: string;
  gradeNameEn: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  weeksCount: number;
  status: AcademicCalendarStatusType;
};

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB');
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const resolveStatus = (
  status: AcademicCalendarStatusType | null | undefined,
  startDate: string,
  endDate: string
): AcademicCalendarStatusType => {
  if (status) return status;
  const today = todayIso();
  return startDate <= today && today <= endDate
    ? AcademicCalendarStatus.ACTIVE
    : AcademicCalendarStatus.INACTIVE;
};

const getNearestDate = (dates: string[]) => {
  const now = Date.now();
  let nearest = '';
  let nearestDistance = Infinity;
  dates.forEach((value) => {
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return;
    const distance = Math.abs(time - now);
    if (distance < nearestDistance) {
      nearest = value;
      nearestDistance = distance;
    }
  });
  return nearest;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  valueClassName: string;
};

function StatCard({ label, value, icon, valueClassName }: StatCardProps) {
  return (
    <div
      className={`flex h-[105px] items-center justify-between px-[25px] py-[17px] ${PANEL_SURFACE}`}
    >
      <div className="flex flex-col items-start gap-2">
        <span className="text-base leading-[22.4px] font-medium text-[#9D9D9D]">{label}</span>
        <span className={`font-bold text-[black] ${valueClassName}`}>{value}</span>
      </div>
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#ECFDF5] shadow-sm">
        <CustomImage src={icon} alt="" className="h-6 w-6" />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AcademicCalendarStatusType }) {
  const { t } = useTranslation();
  const isActive = status === AcademicCalendarStatus.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-[13px] py-[5px] text-xs leading-4 font-semibold ${
        isActive
          ? 'border-[#1E7A52]/10 bg-[#ECFDF5] text-[#1E7A52]'
          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#9D9D9D]'
      }`}
    >
      {t(isActive ? 'common.active' : 'common.inactive')}
      <span className={`size-1.5 rounded-full ${isActive ? 'bg-[#1E7A52]' : 'bg-[#9D9D9D]'}`} />
    </span>
  );
}

export default function AcademicCalendarList() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const schoolBranchId = getCurrentSchoolBranchId() ?? undefined;

  const isArabic = i18n.language === 'ar';

  const { calendars, pagination, isLoading, isDeleting } = useAppSelector(
    (state) => state.academicCalendar
  );
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const schoolAcademicSubSystems = useAppSelector(
    (state) => state.academicSubSystems.schoolAcademicSubSystems
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [academicSubSystemId, setAcademicSubSystemId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [formPopup, setFormPopup] = useState<{ open: boolean; calendarId?: string }>({
    open: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  const hasActiveFilters = Boolean(
    searchTerm || startDate || endDate || academicSubSystemId || status
  );

  useEffect(() => {
    if (educationalStages.length > 0) return;
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
  }, [dispatch, educationalStages.length, schoolBranchId]);

  useEffect(() => {
    dispatch(getSchoolAcademicSubSystems({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    dispatch(
      fetchAcademicCalendars({
        page,
        limit: PAGE_SIZE,
        filters: {
          schoolBranchId,
          searchTerm: searchTerm.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          academicSubSystemId: academicSubSystemId || undefined,
          status: status ? (Number(status) as AcademicCalendarStatusType) : undefined,
        },
      })
    );
  }, [
    dispatch,
    page,
    schoolBranchId,
    searchTerm,
    startDate,
    endDate,
    academicSubSystemId,
    status,
    refreshKey,
  ]);

  const gradeNameById = useMemo(() => {
    const map = new Map<string, { ar: string; en: string }>();
    educationalStages.forEach((stage) => {
      map.set(stage.id, { ar: stage.nameAr, en: stage.nameEn || stage.nameAr });
    });
    return map;
  }, [educationalStages]);

  const tableRows = useMemo<AcademicCalendarRow[]>(() => {
    return (calendars || []).map((calendar) => {
      const grade = gradeNameById.get(calendar.gradeId);
      const startDate = calendar.studyStartDate?.slice(0, 10) || '';
      const endDate = calendar.studyEndDate?.slice(0, 10) || '';

      return {
        id: calendar.id,
        gradeNameAr: calendar.gradeNameAr || grade?.ar || '-',
        gradeNameEn: calendar.gradeNameEn || grade?.en || '-',
        startDate,
        endDate,
        weeksCount: calendar.weeksCount || 0,
        status: resolveStatus(calendar.status, startDate, endDate),
      };
    });
  }, [calendars, gradeNameById]);

  const nearestStart = useMemo(
    () => getNearestDate(tableRows.map((row) => row.startDate)),
    [tableRows]
  );
  const nearestEnd = useMemo(
    () => getNearestDate(tableRows.map((row) => row.endDate)),
    [tableRows]
  );

  const academicSubSystemOptions = useMemo(
    () =>
      schoolAcademicSubSystems.map((subSystem) => ({
        value: subSystem.id,
        label: subSystem.name,
      })),
    [schoolAcademicSubSystems]
  );

  const statusOptions = [
    { value: String(AcademicCalendarStatus.ACTIVE), label: t('common.active') },
    { value: String(AcademicCalendarStatus.INACTIVE), label: t('common.inactive') },
  ];

  const shouldShowEmptyState = tableRows.length === 0 && !hasActiveFilters && !isLoading;

  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setAcademicSubSystemId('');
    setStatus('');
    setPage(1);
  };

  const cloneTableWithoutActions = () => {
    const tableEl = document.querySelector('#academic-calendar-table');
    if (!tableEl) return null;
    const clone = tableEl.cloneNode(true) as HTMLTableElement;
    clone.querySelectorAll('tr').forEach((tr) => {
      const lastCell = tr.lastElementChild;
      if (lastCell) lastCell.remove();
    });
    return clone;
  };

  const handlePrint = () => {
    const clone = cloneTableWithoutActions();
    if (!clone) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(
      `<!doctype html><html dir="${isArabic ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${t('academicCalendar.annualCalendar')}</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 12px;text-align:${isArabic ? 'right' : 'left'}}th{background:#f8fafc}</style></head><body>${clone.outerHTML}</body></html>`
    );
    win.document.close();
    win.print();
  };

  const buildCsvContent = () => {
    const headers = [
      '#',
      t('academicCalendar.table.educationalStages'),
      t('academicCalendar.table.startDate'),
      t('academicCalendar.table.endDate'),
      t('academicCalendar.table.weeksCount'),
      t('academicCalendar.table.status'),
    ];
    const rows = tableRows.map((row, i) => [
      String((pagination.page - 1) * pagination.limit + i + 1),
      getGradeName(row),
      formatDate(row.startDate),
      formatDate(row.endDate),
      String(row.weeksCount),
      row.status === AcademicCalendarStatus.ACTIVE ? t('common.active') : t('common.inactive'),
    ]);
    const escape = (v: string) =>
      v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
    return [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const bom = '﻿';
    const blob = new Blob([bom + buildCsvContent()], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `academic-calendar.csv`);
  };

  const handleExportPdf = () => {
    const clone = cloneTableWithoutActions();
    if (!clone) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(
      `<!doctype html><html dir="${isArabic ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${t('academicCalendar.annualCalendar')}</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 12px;text-align:${isArabic ? 'right' : 'left'}}th{background:#f8fafc}@page{size:landscape}</style></head><body>${clone.outerHTML}</body></html>`
    );
    win.document.close();
    win.onload = () => win.print();
  };

  const moreActions: Action[] = [
    {
      id: 'reset-filters',
      label: t('actions.clearFilter'),
      icon: RefreshGrayIcon,
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: handleResetFilters,
      disabled: !hasActiveFilters,
    },
    {
      id: 'print',
      label: t('actions.print'),
      icon: PrinterBlackIcon,
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: handlePrint,
    },
    {
      id: 'export-excel',
      label: t('actions.exportExcel'),
      icon: ExcelFileBlackIcon,
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: handleExportExcel,
    },
    {
      id: 'export-pdf',
      label: t('actions.exportPdf'),
      icon: MaterialPdfBlackIcon,
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: handleExportPdf,
    },
  ];

  const getGradeName = (row: AcademicCalendarRow) => (isArabic ? row.gradeNameAr : row.gradeNameEn);

  const selectedRow = tableRows.find((row) => row.id === selectedId);

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;

    try {
      await dispatch(deleteAcademicCalendar(selectedId)).unwrap();
      setShowDeletePopup(false);
      setSelectedId('');
      showToast({ message: 'academicCalendar.toast.deleteSuccess', type: 'success' });
    } catch {
      showToast({ message: 'common.errorOccurred', type: 'error' });
    }
  };

  const tableHeaderCell = 'px-6 py-4 text-sm leading-[19.6px] font-bold text-[#9D9D9D]';

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label={t('academicCalendar.stats.stagesCount')}
          value={pagination.total.toLocaleString('en-US')}
          icon={LayersGreenIcon}
          valueClassName="text-[28px] leading-[39.2px]"
        />
        <StatCard
          label={t('academicCalendar.stats.nearestStart')}
          value={formatDate(nearestStart)}
          icon={Calendar11GreenIcon}
          valueClassName="text-[22px] leading-[30.8px] tracking-[-0.5px]"
        />
        <StatCard
          label={t('academicCalendar.stats.nearestEnd')}
          value={formatDate(nearestEnd)}
          icon={Calendar11GreenIcon}
          valueClassName="text-[22px] leading-[30.8px] tracking-[-0.5px]"
        />
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-4 p-[17px] ${PANEL_SURFACE}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5 md:justify-start">
          <FilterSelect
            value={status}
            onChange={updateFilter(setStatus)}
            options={statusOptions}
            placeholder={t('academicCalendar.allStatuses')}
            iconSrc={ChevronDownGraySmIcon}
            className="w-[48%] md:w-36"
          />
          <FilterDateInput
            value={endDate}
            onChange={updateFilter(setEndDate)}
            placeholder={t('academicCalendar.endDatePlaceholder')}
            className="w-[48%] md:w-[140px]"
          />
          <FilterDateInput
            value={startDate}
            onChange={updateFilter(setStartDate)}
            placeholder={t('academicCalendar.startDatePlaceholder')}
            className="w-[48%] md:w-[140px]"
          />
          <FilterSelect
            value={academicSubSystemId}
            onChange={updateFilter(setAcademicSubSystemId)}
            options={academicSubSystemOptions}
            placeholder={t('academicCalendar.academicSystemPlaceholder')}
            iconSrc={FilterGrayIcon}
            className="w-[48%] md:w-[180px]"
          />
          <SearchInput
            name="academic-calendar-search"
            value={searchTerm}
            onChange={updateFilter(setSearchTerm)}
            placeholder={t('academicCalendar.searchPlaceholder')}
            iconSrc={SearchGraySmIcon}
            iconClass={FILTER_SEARCH_ICON_CLASS}
            wrapperClassName="md:w-[250px] w-full"
            className={FILTER_SEARCH_INPUT_CLASS}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            actionKey="add"
            onClick={() => setFormPopup({ open: true })}
            icon={<CustomImage src={PlusWhiteSmIcon} alt="" className="h-3.5 w-3.5" />}
            className="h-10 rounded-lg! border-0! bg-[#1E7A52]! px-4! py-2.5! text-sm! leading-[19.6px] font-semibold! shadow-none! hover:bg-[#1E7A52]/90!"
          >
            {t('academicCalendar.addAnnualCalendarButton')}
          </Button>
          <ActionsDropdown
            actions={moreActions}
            triggerIcon={DotsVerticalGreenSmIcon}
            triggerClassName="flex size-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9]"
            iconClassName="h-4 w-4"
          />
        </div>
      </div>

      {shouldShowEmptyState ? (
        <div className={`p-6 ${PANEL_SURFACE}`}>
          <EmptyState
            imgSrc={CalendarEmptyIcon}
            title={t('academicCalendar.emptyStateTitle')}
            description={t('academicCalendar.emptyStateDescription')}
            blend={true}
          />
        </div>
      ) : (
        <div className={`overflow-hidden ${PANEL_SURFACE}`}>
          <div className="overflow-x-auto">
            <table id="academic-calendar-table" className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]/80 bg-[#F8FAFC]/70">
                  <th className={`w-14 text-center ${tableHeaderCell}`}>#</th>
                  <th className={`text-start ${tableHeaderCell}`}>
                    {t('academicCalendar.table.educationalStages')}
                  </th>
                  <th className={`w-40 text-center ${tableHeaderCell}`}>
                    {t('academicCalendar.table.startDate')}
                  </th>
                  <th className={`w-40 text-center ${tableHeaderCell}`}>
                    {t('academicCalendar.table.endDate')}
                  </th>
                  <th className={`w-40 text-center ${tableHeaderCell}`}>
                    {t('academicCalendar.table.weeksCount')}
                  </th>
                  <th className={`w-40 text-center ${tableHeaderCell}`}>
                    {t('academicCalendar.table.status')}
                  </th>
                  <th className={`w-40 text-center ${tableHeaderCell}`}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#9D9D9D]">
                      {t('common.loading')}
                    </td>
                  </tr>
                ) : tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#9D9D9D]">
                      {t('common.noResults')}
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row, index) => (
                    <tr key={row.id} className="border-t border-[#F1F5F9] first:border-t-0">
                      <td className="px-6 py-[21px] text-center text-base leading-[22.4px] font-semibold text-[#1E7A52]">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-6 py-[21px] text-start text-sm leading-5 font-semibold text-wrap text-[black]">
                        {getGradeName(row)}
                      </td>
                      <td className="px-6 py-[21px] text-center text-sm leading-5 text-[black]">
                        {formatDate(row.startDate)}
                      </td>
                      <td className="px-6 py-[21px] text-center text-sm leading-5 text-[black]">
                        {formatDate(row.endDate)}
                      </td>
                      <td className="px-6 py-[21px] text-center text-sm leading-5 font-semibold text-[#1E293B]">
                        {row.weeksCount}
                      </td>
                      <td className="px-6 py-[18.5px] text-center">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-6 py-[18.5px]">
                        <div className="flex items-center justify-center gap-2">
                          <IconButton
                            actionKey="edit"
                            ariaLabel={t('actions.edit')}
                            onClick={() => setFormPopup({ open: true, calendarId: row.id })}
                            className="size-8 rounded-lg! border border-[#1E7A52]/10 bg-[#F0FDF4]! p-[7px]! shadow-none! hover:bg-[#DCFCE7]!"
                          >
                            <CustomImage src={PencilGreenIcon} alt="" className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            actionKey="delete"
                            ariaLabel={t('actions.delete')}
                            onClick={() => {
                              setSelectedId(row.id);
                              setShowDeletePopup(true);
                            }}
                            className="size-8 rounded-lg! border border-[#FECDD3]/60 bg-[#FFF1F2]! p-[7px]! shadow-none! hover:bg-[#FFE4E6]!"
                          >
                            <CustomImage src={TrashRoseIcon} alt="" className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AcademicCalendarPagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <DeletePopup
        open={showDeletePopup}
        message="academicCalendar.confirmDelete"
        itemName={selectedRow ? getGradeName(selectedRow) : ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeletePopup(false)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />

      <AcademicCalendarFormPopup
        open={formPopup.open}
        calendarId={formPopup.calendarId}
        onClose={() => setFormPopup({ open: false })}
        onSuccess={() => {
          if (!formPopup.calendarId) setPage(1);
          setRefreshKey((key) => key + 1);
        }}
      />
    </div>
  );
}
