import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import Badge from '@/shared/components/Badge';
import CustomImage from '@/shared/components/CustomImage';
import DataTable, {
  type DataTableColumn,
  type FilterConfig,
  type PaginationData,
} from '@/shared/components/DataTable';
import ErrorMessage from '@/shared/components/ErrorMessage';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import type { ExamStudentItem, StudentGrade } from './examDetailsData';

const GRADE_VARIANT: Record<StudentGrade, 'success' | 'info' | 'warning' | 'danger'> = {
  'A+': 'success',
  B: 'info',
  C: 'warning',
  D: 'danger',
};

const GRADE_COLOR: Record<StudentGrade, string> = {
  'A+': '#1A9F58',
  B: '#117BD7',
  C: '#F8951B',
  D: '#DD0417',
};

const isStudentGrade = (value: string): value is StudentGrade =>
  value === 'A+' || value === 'B' || value === 'C' || value === 'D';

const getGradeVariant = (grade: string): 'success' | 'info' | 'warning' | 'danger' | 'default' =>
  isStudentGrade(grade) ? GRADE_VARIANT[grade] : 'default';

const getGradeColor = (grade: string): string =>
  isStudentGrade(grade) ? GRADE_COLOR[grade] : '#646969';

/** Tints the monochrome eye icon to a dynamic colour via a CSS mask (keeps the SVG file untouched). */
function EyeButton({
  color,
  bgClass,
  onClick,
}: {
  color: string;
  bgClass: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="View"
      onClick={onClick}
      className={`mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgClass}`}
    >
      <span
        aria-hidden
        className="h-5 w-5"
        style={{
          backgroundColor: color,
          maskImage: `url("${EyeStyledIcon}")`,
          WebkitMaskImage: `url("${EyeStyledIcon}")`,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
        }}
      />
    </button>
  );
}

type ExamStudentsListProps = {
  students: ExamStudentItem[];
  isLoading?: boolean;
  error?: string | null;
  search: string;
  rating: string;
  pagination?: PaginationData;
  onSearchChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onRetry?: () => void;
};

export default function ExamStudentsList({
  students,
  isLoading = false,
  error,
  search,
  rating,
  pagination,
  onSearchChange,
  onRatingChange,
  onPageChange,
  onResetFilters,
  onRetry,
}: ExamStudentsListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const openReview = (studentId: string) => navigate(`/lms/online-exams/${id}/review/${studentId}`);

  const columns: DataTableColumn<ExamStudentItem>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-[#646969]">{(index ?? 0) + 1}</span>
      ),
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'eLearning.onlineExams.details.studentsTable.reviewCorrection',
      accessor: (row) => (
        <EyeButton
          color="#0909B1"
          bgClass="bg-darkBlue-500/10"
          onClick={() => openReview(row.id)}
        />
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.onlineExams.details.studentsTable.studentName',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#DDE0E0]">
            <CustomImage src={DefaultAvatar} alt="" className="h-full w-full object-cover" />
          </div>
          <span className="font-normal text-[#646969]" title={row.name}>
            {row.name}
          </span>
          <EyeButton color="#117BD7" bgClass="bg-blue-500/10" onClick={() => openReview(row.id)} />
        </div>
      ),
      headerClassName: 'min-w-[280px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.onlineExams.details.studentsTable.grade',
      accessor: (row) =>
        row.score == null ? (
          <span className="font-medium text-[#646969]">--</span>
        ) : (
          <span
            className="font-medium"
            style={{ color: row.grade ? getGradeColor(row.grade) : '#646969' }}
          >
            {row.score}
            <span className="text-[#646969]">/100</span>
          </span>
        ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.onlineExams.details.studentsTable.rating',
      accessor: (row) =>
        row.grade == null ? (
          <span className="font-medium text-[#646969]">--</span>
        ) : (
          <Badge variant={getGradeVariant(row.grade)} size="sm">
            {row.grade}
          </Badge>
        ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.onlineExams.details.studentsTable.timeTaken',
      accessor: (row) => (
        <span className="font-normal text-[#646969]">
          {row.timeMinutes} {t('eLearning.onlineExams.details.minuteUnit')}
        </span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'student-search',
      placeholder: t('eLearning.onlineExams.details.studentsTable.searchPlaceholder'),
      value: search,
      onChange: (value) => onSearchChange(value as string),
      width: '40%',
    },
    {
      type: 'select',
      name: 'student-rating',
      placeholder: t('eLearning.onlineExams.details.studentsTable.rating'),
      value: rating,
      onChange: (value) => onRatingChange(value as string),
      options: [
        { value: 'A+', label: 'A+' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
      ],
      width: '20%',
    },
  ];

  return (
    <Card className="overflow-hidden rounded-3xl border border-[#DDE0E0]" padding="md">
      {error && !isLoading ? (
        <ErrorMessage message="common.errorOccurred" details={error} onRetry={onRetry} />
      ) : (
        <DataTable
          data={students}
          columns={columns}
          keyExtractor={(row) => row.id}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={onResetFilters}
          pagination={pagination}
          onPageChange={onPageChange}
          isLoading={isLoading}
          floatingActions={false}
          emptyMessage="common.noDataFound"
          t={t}
        />
      )}
    </Card>
  );
}
