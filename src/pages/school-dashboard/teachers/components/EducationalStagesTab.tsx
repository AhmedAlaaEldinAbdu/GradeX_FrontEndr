import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import Loading from '@/shared/components/Loading';
import IconButton from '@/shared/components/IconButton';
import MetricCard from '@/shared/components/MetricCard';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import CheckCircleOrangeIcon from '@gradex/assets/icons/CheckCircleOrange.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import TimeSyncIcon from '@gradex/assets/icons/TimeSync.svg';
import TimeSyncBlueIcon from '@gradex/assets/icons/TimeSyncBlue.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchTeacherAssignment,
  clearTeacherAssignment,
} from '@/redux/features/teachers/teachersSlice';
import type { TeacherAssignmentGrade } from '@/types/teacherAssignment';

interface EducationalStagesTabProps {
  teacherId: string;
  isActive?: boolean;
}

export default function EducationalStagesTab({
  teacherId,
  isActive = true,
}: EducationalStagesTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const dispatch = useAppDispatch();

  const [searchTerm, setSearchTerm] = useState('');

  const { teacherAssignment, isLoadingAssignment, assignmentError, teacherAttendanceSummary } =
    useAppSelector((state) => state.teachers);

  useEffect(() => {
    if (teacherId && isActive) {
      dispatch(fetchTeacherAssignment(teacherId));
    }
    return () => {
      dispatch(clearTeacherAssignment());
    };
  }, [dispatch, teacherId, isActive]);

  const summary = {
    totalPresent: teacherAttendanceSummary?.totalPresent ?? 0,
    totalLate: teacherAttendanceSummary?.totalLate ?? 0,
    totalAbsent: teacherAttendanceSummary?.totalAbsent ?? 0,
    totalSubjects: teacherAssignment?.materailCount ?? 0,
    totalBooks: teacherAssignment?.bookCount ?? 0,
  };

  const educationalStages = teacherAssignment?.grades || [];

  const filteredStages = educationalStages.filter((stage) => {
    const stageName = currentLang === 'ar' ? stage.name : stage.nameEN;
    const classroomNames = stage.classRooms.map((c) => (currentLang === 'ar' ? c.name : c.nameEN));
    const searchLower = searchTerm.toLowerCase();
    return (
      stageName.toLowerCase().includes(searchLower) ||
      classroomNames.some((name) => name.toLowerCase().includes(searchLower))
    );
  });

  const columns: DataTableColumn<TeacherAssignmentGrade>[] = [
    {
      header: '#',
      accessor: (_row, index) => (index !== undefined ? index + 1 : ''),
      headerClassName: 'min-w-[60px] text-center',
      className: 'text-center',
    },
    {
      header: 'teachers.details.educationalStage',
      accessor: (row) => (currentLang === 'ar' ? row.name : row.nameEN),
      headerClassName: 'min-w-[200px] text-center',
      className: 'text-center',
    },
    {
      header: 'teachers.details.classrooms',
      accessor: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          {row.classRooms.map((classroom) => (
            <span
              key={classroom.id}
              className="inline-flex items-center gap-2 rounded-lg bg-[#DFF8ED] px-2 py-1.5 text-sm font-normal text-[#3A3A3A]"
            >
              <CustomImage src={EyeStyledIcon} alt="" className="h-4 w-4" />
              {currentLang === 'ar' ? classroom.name : classroom.nameEN}
            </span>
          ))}
        </div>
      ),
      headerClassName: 'min-w-[300px] text-center',
    },
    {
      header: 'common.actions',
      accessor: () => (
        <div className="flex justify-center">
          <IconButton status="edit" variant="success" ariaLabel={t('common.edit')} />
        </div>
      ),
      headerClassName: 'min-w-[80px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchStage',
      placeholder: t('teachers.details.searchStageOrClassroom'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '25%',
    },
  ];

  if (!isActive || isLoadingAssignment) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (assignmentError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">{assignmentError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - First Row (attendance) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title={t('teachers.details.totalPresent')}
          value={summary.totalPresent}
          icon={
            <CustomImage
              src={CheckCircleIcon}
              alt={t('teachers.details.totalPresent')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-[rgba(26,159,88,0.16)]"
        />
        <MetricCard
          title={t('teachers.details.totalLate')}
          value={summary.totalLate}
          icon={
            <CustomImage
              src={TimeSyncIcon}
              alt={t('teachers.details.totalLate')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-[rgba(246,203,59,0.16)]"
        />
        <MetricCard
          title={t('teachers.details.totalAbsent')}
          value={summary.totalAbsent}
          icon={
            <CustomImage
              src={XmarkCircleRedIcon}
              alt={t('teachers.details.totalAbsent')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-[rgba(221,4,23,0.16)]"
        />
      </div>

      {/* Summary Cards - Second Row (assignment) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title={t('teachers.details.totalSubjects')}
          value={summary.totalSubjects}
          icon={
            <CustomImage
              src={CheckCircleOrangeIcon}
              alt={t('teachers.details.totalSubjects')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-[rgba(226,122,18,0.16)]"
        />
        <MetricCard
          title={t('teachers.details.totalBooks')}
          value={summary.totalBooks}
          icon={
            <CustomImage
              src={TimeSyncBlueIcon}
              alt={t('teachers.details.totalBooks')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-[rgba(29,151,212,0.16)]"
        />
      </div>

      {/* Table Card */}
      <Card>
        {/* Title bar — title on the start side (right in RTL), edit icon on the end side (left in RTL) */}
        <div className="mb-6 flex items-center gap-3">
          <span className="flex-1 text-right text-base font-medium leading-[19px] text-[#3A3A3A]">
            {t('teachers.details.educationalStagesAndClassrooms')}
          </span>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(48,185,126,0.1)] transition-colors hover:bg-[rgba(48,185,126,0.18)]"
            aria-label={t('common.edit')}
          >
            <CustomImage src={EditIcon} alt="" className="h-6 w-6" />
          </button>
        </div>

        <DataTable
          data={filteredStages}
          columns={columns}
          keyExtractor={(row) => row.id}
          filters={filterConfigs}
          showFilters={true}
          emptyMessage={t('common.noResults')}
          t={t}
        />
      </Card>
    </div>
  );
}
