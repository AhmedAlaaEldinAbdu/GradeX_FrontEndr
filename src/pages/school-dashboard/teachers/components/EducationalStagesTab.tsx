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
  const { teacherAssignment, isLoadingAssignment, assignmentError } = useAppSelector(
    (state) => state.teachers
  );

  // Fetch data when tab becomes active
  useEffect(() => {
    if (teacherId && isActive) {
      dispatch(fetchTeacherAssignment(teacherId));
    }

    return () => {
      dispatch(clearTeacherAssignment());
    };
  }, [dispatch, teacherId, isActive]);

  // Summary data from API
  const summary = teacherAssignment
    ? {
        totalStages: teacherAssignment.gradeCount,
        totalClassrooms: teacherAssignment.classRoomCount,
        totalStudents: teacherAssignment.studentCount,
        totalSubjects: teacherAssignment.materailCount,
        totalBooks: teacherAssignment.bookCount,
      }
    : {
        totalStages: 0,
        totalClassrooms: 0,
        totalStudents: 0,
        totalSubjects: 0,
        totalBooks: 0,
      };

  // Educational stages from API
  const educationalStages = teacherAssignment?.grades || [];

  // Filter stages based on search
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
      {/* Summary Cards - First Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Educational Stages */}
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                {t('teachers.details.totalEducationalStages')}
              </p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.totalStages}</p>
          </div>
        </Card>

        {/* Total Classrooms */}
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
                    d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalClassrooms')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.totalClassrooms}</p>
          </div>
        </Card>

        {/* Total Students */}
        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{t('teachers.details.totalStudents')}</p>
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{summary.totalStudents}</p>
          </div>
        </Card>
      </div>

      {/* Summary Cards - Second Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Subjects */}
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

        {/* Total Books */}
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
