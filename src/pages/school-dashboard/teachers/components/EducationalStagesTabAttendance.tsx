import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import SearchInput from '@/shared/components/SearchInput';
import CustomImage from '@/shared/components/CustomImage';
import Loading from '@/shared/components/Loading';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchTeacherAssignment,
  clearTeacherAssignment,
} from '@/redux/features/teachers/teachersSlice';

interface EducationalStagesTabAttendanceProps {
  teacherId: string;
  isActive?: boolean;
}

export default function EducationalStagesTabAttendance({
  teacherId,
  isActive = true,
}: EducationalStagesTabAttendanceProps) {
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
        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalPresent')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.totalPresent}</p>
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalLate')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.totalLate}</p>
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalAbsent')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.totalAbsent}</p>
          </div>
        </Card>
      </div>

      {/* Summary Cards - Second Row (assignment) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalSubjects')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.totalSubjects}</p>
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
                <svg
                  className="h-6 w-6 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalBooks')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.totalBooks}</p>
          </div>
        </Card>
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
