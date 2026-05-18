import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import Input from '@/shared/components/Input';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchDailyReports } from '@/redux/features/daily-report/dailyReportSlice';
import type { DailyReport } from '@/services/api/types/daily-report.types';
import ReportDetailsPopup, {
  type ReportDetails,
  type EvaluationStatus,
} from '@/pages/school-dashboard/student-management/popups/ReportDetailsPopup';

interface PerformanceTabProps {
  studentId: string;
}

const pageSize = 10;

// The daily report only exposes numeric levels (0-5); derive a status badge from it.
const levelToStatus = (level: number): EvaluationStatus => {
  if (level >= 5) return 'excellent';
  if (level === 4) return 'veryGood';
  if (level >= 2) return 'good';
  return 'unsatisfactory';
};

export default function PerformanceTab({ studentId }: PerformanceTabProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const reports = useAppSelector((state) => state.dailyReport.reports);
  const pagination = useAppSelector((state) => state.dailyReport.pagination);
  const isLoading = useAppSelector((state) => state.dailyReport.isLoading);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReport, setActiveReport] = useState<ReportDetails | null>(null);

  // Search is by report number (no subject/note exist on the daily report).
  useEffect(() => {
    if (!studentId) return;
    dispatch(
      fetchDailyReports({
        StudentId: studentId,
        PageIndex: currentPage,
        PageSize: pageSize,
        Search: search || undefined,
      })
    );
  }, [dispatch, studentId, currentPage, search]);

  const handleViewReport = (report: DailyReport) => {
    setActiveReport({
      reportName: report.reportNumber,
      reportNameEn: report.reportNumber,
      evaluations: [
        {
          kind: 'academic',
          rating: report.academicLevel,
          status: levelToStatus(report.academicLevel),
          notes: '',
          notesEn: '',
        },
        {
          kind: 'behavioral',
          rating: report.behaviorLevel,
          status: levelToStatus(report.behaviorLevel),
          notes: '',
          notesEn: '',
        },
        {
          kind: 'healthHygiene',
          rating: report.healthLevel,
          status: levelToStatus(report.healthLevel),
          notes: '',
          notesEn: '',
        },
      ],
    });
  };

  const ViewIconButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <IconButton variant="blue" ariaLabel={label} onClick={onClick} className="h-8 w-8">
      <CustomImage src={EyeStyledIcon} alt={label} className="h-4 w-4" />
    </IconButton>
  );

  const columns: DataTableColumn<DailyReport>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index ?? 0) + 1,
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: t('performance.reportNumber'),
      accessor: (row) => <span>{row.reportNumber}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('performance.class'),
      accessor: (row) => <span>{row.classroomName}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: t('performance.grade'),
      accessor: (row) => <span>{row.gradeName}</span>,
      headerClassName: 'min-w-[180px]',
      className: 'text-center',
    },
    {
      header: t('common.actions'),
      accessor: (row) => (
        <div className="flex justify-center">
          <ViewIconButton onClick={() => handleViewReport(row)} label={t('common.view')} />
        </div>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'custom',
      name: 'search',
      placeholder: '',
      value: search,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <Input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('performance.searchByNumber')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearch('');
    setCurrentPage(1);
  };

  const tablePagination = useMemo(
    () => ({
      page: pagination.page || currentPage,
      limit: pagination.limit || pageSize,
      total: pagination.total,
      totalPages: Math.max(1, pagination.totalPages || 1),
    }),
    [pagination, currentPage]
  );

  return (
    <Card>
      <DataTable
        data={reports}
        columns={columns}
        keyExtractor={(row) => row.id}
        pagination={tablePagination}
        onPageChange={setCurrentPage}
        filters={filterConfigs}
        showFilters={true}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        emptyMessage={t('performance.noRecords')}
        t={t}
      />

      <ReportDetailsPopup
        isOpen={!!activeReport}
        onClose={() => setActiveReport(null)}
        report={activeReport}
      />
    </Card>
  );
}
