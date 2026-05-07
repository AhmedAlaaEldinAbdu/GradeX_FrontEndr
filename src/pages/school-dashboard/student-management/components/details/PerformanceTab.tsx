import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ArrowLeftIcon from '@gradex/assets/icons/ArrowLeft.svg';
import ArrowRightIcon from '@gradex/assets/icons/ArrowRight.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import ReportDetailsPopup, {
  type ReportDetails,
} from '@/pages/school-dashboard/student-management/popups/ReportDetailsPopup';

interface PerformanceTabProps {
  studentId: string;
}

interface PerformanceReport {
  id: string;
  reportName: string;
  reportNameEn: string;
  updateDate: string;
  teacherName: string;
  teacherNameEn: string;
  teacherAvatar: string | null;
  notes: string;
  notesEn: string;
}

const mockReports: PerformanceReport[] = [
  {
    id: '1',
    reportName: 'التقرير 1',
    reportNameEn: 'Report 1',
    updateDate: '1-1-2020',
    teacherName: 'أحمد معتز حسن',
    teacherNameEn: 'Ahmed Moataz Hassan',
    teacherAvatar: null,
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '2',
    reportName: 'التقرير 1',
    reportNameEn: 'Report 1',
    updateDate: '1-1-2021',
    teacherName: 'أحمد معتز حسن',
    teacherNameEn: 'Ahmed Moataz Hassan',
    teacherAvatar: null,
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '3',
    reportName: 'التقرير 1',
    reportNameEn: 'Report 1',
    updateDate: '1-1-2021',
    teacherName: 'أحمد معتز حسن',
    teacherNameEn: 'Ahmed Moataz Hassan',
    teacherAvatar: null,
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '4',
    reportName: 'التقرير 1',
    reportNameEn: 'Report 1',
    updateDate: '1-1-2021',
    teacherName: 'أحمد معتز حسن',
    teacherNameEn: 'Ahmed Moataz Hassan',
    teacherAvatar: null,
    notes: 'لا يوجد',
    notesEn: 'None',
  },
];

export default function PerformanceTab(_props: PerformanceTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [search, setSearch] = useState('');
  const [teacher, setTeacher] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReport, setActiveReport] = useState<ReportDetails | null>(null);
  const pageSize = 10;

  const filteredReports = mockReports.filter((report) =>
    !search
      ? true
      : (currentLang === 'ar' ? report.reportName : report.reportNameEn)
          .toLowerCase()
          .includes(search.toLowerCase())
  );

  const handleViewReport = (report: PerformanceReport) => {
    setActiveReport({
      reportName: report.reportName,
      reportNameEn: report.reportNameEn,
      evaluations: [
        {
          kind: 'academic',
          rating: 5,
          status: 'excellent',
          notes: 'لا يوجد',
          notesEn: 'None',
        },
        {
          kind: 'behavioral',
          rating: 0,
          status: 'unsatisfactory',
          notes: 'لا يوجد',
          notesEn: 'None',
        },
        {
          kind: 'healthHygiene',
          rating: 2,
          status: 'good',
          notes: 'لا يوجد',
          notesEn: 'None',
        },
      ],
    });
  };

  const handleViewTeacher = (_report: PerformanceReport) => {
    // open teacher details
  };

  const handleViewNotes = (_report: PerformanceReport) => {
    // open notes details
  };

  const ViewIconButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <IconButton variant="blue" ariaLabel={label} onClick={onClick} className="h-8 w-8">
      <CustomImage src={EyeStyledIcon} alt={label} className="h-4 w-4" />
    </IconButton>
  );

  const columns: DataTableColumn<PerformanceReport>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index ?? 0) + 1,
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: t('performance.reportName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.reportName : row.reportNameEn}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('performance.updateDate'),
      accessor: (row) => <span>{row.updateDate}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: t('performance.teacherName'),
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <CustomImage
            src={row.teacherAvatar || DefaultAvatar}
            fallbackSrc={DefaultAvatar}
            alt={currentLang === 'ar' ? row.teacherName : row.teacherNameEn}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-sm text-[#646969]">
            {currentLang === 'ar' ? row.teacherName : row.teacherNameEn}
          </span>
          <ViewIconButton onClick={() => handleViewTeacher(row)} label={t('common.view')} />        </div>
      ),
      headerClassName: 'min-w-[220px]',
    },
    {
      header: t('performance.notes'),
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-[#646969]">
            {currentLang === 'ar' ? row.notes : row.notesEn}
          </span>
        </div>
      ),
      headerClassName: 'min-w-[180px]',
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('performance.searchSubject')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'teacher-filter',
      placeholder: '',
      value: teacher,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={teacher}
          onChange={(value) => setTeacher(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={[
            { value: 'samah', label: currentLang === 'ar' ? 'سماح السيد أحمد' : 'Samah El-Sayed' },
            { value: 'ahmed', label: currentLang === 'ar' ? 'أحمد حسن إبراهيم' : 'Ahmed Hassan' },
          ]}
          placeholder={t('performance.teacherName')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'status-filter',
      placeholder: '',
      value: status,
      onChange: () => {},
      width: '12%',
      customComponent: (
        <CustomSelect
          value={status}
          onChange={(value) => setStatus(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={[
            { value: 'excellent', label: t('performance.excellent') },
            { value: 'veryGood', label: t('performance.veryGood') },
            { value: 'good', label: t('performance.good') },
            { value: 'struggling', label: t('performance.struggling') },
            { value: 'weak', label: t('performance.weak') },
          ]}
          placeholder={t('performance.status')}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearch('');
    setTeacher('');
    setStatus('');
    setCurrentPage(1);
  };

  return (
    <Card>
      <Card className="border shadow-none">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex w-full items-center justify-center gap-4">
            <div className="flex items-center gap-3 text-sm text-[#0E1F1F]">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDEDED] hover:bg-gray-50"
                aria-label="previous"
              >
                <CustomImage src={ArrowRightIcon} alt="" className="h-3 w-3" />
              </button>
              <span>8 {t('performance.august')} 2025</span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#EDEDED] hover:bg-gray-50"
                aria-label="next"
              >
                <CustomImage src={ArrowLeftIcon} alt="" className="h-3 w-3" />
              </button>
            </div>
          </div>
          <button
            type="button"
            className="flex-shrink-0 px-1 text-sm font-medium text-green-500 hover:text-green-700"
          >
            {t('common.showAll')}
          </button>
        </div>

        <DataTable
          data={filteredReports}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total: filteredReports.length,
            totalPages: Math.max(1, Math.ceil(filteredReports.length / pageSize)),
          }}
          onPageChange={setCurrentPage}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          isLoading={false}
          emptyMessage={t('performance.noRecords')}
          t={t}
        />
      </Card>

      <ReportDetailsPopup
        isOpen={!!activeReport}
        onClose={() => setActiveReport(null)}
        report={activeReport}
      />
    </Card>
  );
}
