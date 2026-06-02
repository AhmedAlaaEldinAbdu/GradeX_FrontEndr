import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import Badge from '@/shared/components/Badge';
import CustomImage from '@/shared/components/CustomImage';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import { EXAM_STUDENTS, type ExamStudentItem, type StudentGrade } from './examDetailsData';

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

export default function ExamStudentsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');

  const openReview = (studentId: string) => navigate(`/lms/online-exams/${id}/review/${studentId}`);

  const filteredStudents = useMemo(
    () =>
      EXAM_STUDENTS.filter(
        (student) =>
          (!search || student.name.includes(search)) && (!rating || student.grade === rating)
      ),
    [search, rating]
  );

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
        <EyeButton color="#0909B1" bgClass="bg-[#0909B1]/10" onClick={() => openReview(row.id)} />
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
          <EyeButton color="#117BD7" bgClass="bg-[#117BD7]/10" onClick={() => openReview(row.id)} />
        </div>
      ),
      headerClassName: 'min-w-[280px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.onlineExams.details.studentsTable.grade',
      accessor: (row) =>
        row.score == null || row.grade == null ? (
          <span className="font-medium text-[#646969]">--</span>
        ) : (
          <span className="font-medium" style={{ color: GRADE_COLOR[row.grade] }}>
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
          <Badge variant={GRADE_VARIANT[row.grade]} size="sm">
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
      onChange: (value) => setSearch(value as string),
      width: '40%',
    },
    {
      type: 'select',
      name: 'student-rating',
      placeholder: t('eLearning.onlineExams.details.studentsTable.rating'),
      value: rating,
      onChange: (value) => setRating(value as string),
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
      <DataTable
        data={filteredStudents}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        onResetFilters={() => {
          setSearch('');
          setRating('');
        }}
        floatingActions={false}
        emptyMessage={t('common.noDataFound')}
        t={t}
      />
    </Card>
  );
}
