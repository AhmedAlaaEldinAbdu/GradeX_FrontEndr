import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import SearchInput from '@/shared/components/SearchInput';
import CustomImage from '@/shared/components/CustomImage';
import Loading from '@/shared/components/Loading';
import MetricCard from '@/shared/components/MetricCard';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import XmarkCircleIcon from '@gradex/assets/icons/XmarkCircle.svg';
import TimeSyncIcon from '@gradex/assets/icons/TimeSync.svg';
import EducationIcon from '@gradex/assets/icons/Education.svg';
import BookIcon from '@gradex/assets/icons/Book.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchTeacherAssignment,
  clearTeacherAssignment,
} from '@/redux/features/teachers/teachersSlice';

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

  // Redux state
  const { teacherAssignment, isLoadingAssignment, assignmentError, teacherAttendanceSummary } =
    useAppSelector((state) => state.teachers);

  // Fetch data when tab becomes active
  useEffect(() => {
    if (teacherId && isActive) {
      dispatch(fetchTeacherAssignment(teacherId));
    }

    return () => {
      dispatch(clearTeacherAssignment());
    };
  }, [dispatch, teacherId, isActive]);

  // Summary data: blend attendance + assignment counts (matches design)
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
          iconClassName="bg-green-100 text-green-600"
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
          iconClassName="bg-yellow-100 text-yellow-600"
        />
        <MetricCard
          title={t('teachers.details.totalAbsent')}
          value={summary.totalAbsent}
          icon={
            <CustomImage
              src={XmarkCircleIcon}
              alt={t('teachers.details.totalAbsent')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-red-100 text-red-600"
        />
      </div>

      {/* Summary Cards - Second Row (assignment) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title={t('teachers.details.totalSubjects')}
          value={summary.totalSubjects}
          icon={
            <CustomImage
              src={EducationIcon}
              alt={t('teachers.details.totalSubjects')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-purple-100 text-purple-600"
        />
        <MetricCard
          title={t('teachers.details.totalBooks')}
          value={summary.totalBooks}
          icon={
            <CustomImage
              src={BookIcon}
              alt={t('teachers.details.totalBooks')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Search and Table */}
      <Card className="p-6">
        {/* Search Input */}
        <div className="mb-4 w-[40%]">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('teachers.details.searchStageOrClassroom')}
          />
        </div>

        {/* Educational Stages Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-50">
                <th className="w-16 border border-gray-200 px-6 py-3 text-center text-sm font-medium text-gray-700">
                  #
                </th>
                <th className="border border-gray-200 px-6 py-3 text-center text-sm font-medium text-gray-700">
                  {t('teachers.details.educationalStage')}
                </th>
                <th className="border border-gray-200 px-6 py-3 text-center text-sm font-medium text-gray-700">
                  {t('teachers.details.classrooms')}
                </th>
                <th className="w-24 border border-gray-200 px-6 py-3 text-center text-sm font-medium text-gray-700">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredStages.map((stage, index) => (
                <tr key={stage.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-6 py-4 text-center text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="border border-gray-200 px-6 py-4 text-center text-sm font-medium text-gray-900">
                    {currentLang === 'ar' ? stage.name : stage.nameEN}
                  </td>
                  <td className="border border-gray-200 px-6 py-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {stage.classRooms.map((classroom) => (
                        <span
                          key={classroom.id}
                          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                        >
                          <CustomImage
                            src={EyeStyledIcon}
                            alt="classroom"
                            className="me-1.5 h-4 w-4"
                          />
                          {currentLang === 'ar' ? classroom.name : classroom.nameEN}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center"
                      title={t('common.edit')}
                    >
                      <CustomImage src={EditIcon} alt="edit" className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStages.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-gray-200 px-6 py-8 text-center text-sm text-gray-500"
                  >
                    {t('common.noResults')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
