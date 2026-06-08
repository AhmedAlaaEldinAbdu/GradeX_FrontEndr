import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import ProfileImage from '@gradex/assets/images/profile.png';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchClassroomById } from '@/redux/features/classrooms/classroomsSlice';
import { fetchStudentsByClassroomId } from '@/redux/features/students/studentsSlice';
import StudentsTab, { type StudentRow } from './StudentsTab';
import TeacherTab from './TeacherTab';
import { getProgressTextColorClassName } from '@/shared/components/ProgressSummaryCard';

type ClassroomRosterContentProps = {
  currentLang: 'ar' | 'en';
};

export default function ClassroomRosterContent({ currentLang }: ClassroomRosterContentProps) {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const currentClassroom = useAppSelector((state) => state.classrooms.currentClassroom);
  const classroomStudents = useAppSelector((state) => state.students.classroomStudents);
  const isLoadingClassroomStudents = useAppSelector(
    (state) => state.students.isLoadingClassroomStudents
  );
  const [activeTab, setActiveTab] = useState('students');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const itemsPerPage = 6;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  useEffect(() => {
    if (!id) {
      return;
    }

    dispatch(fetchClassroomById(id));
    dispatch(fetchStudentsByClassroomId(id));
  }, [dispatch, id]);

  const classroomImageSrc = currentClassroom?.imagePath
    ? `${baseUrl}/${currentClassroom.imagePath}`
    : undefined;
  const classroomName = currentLang === 'ar' ? currentClassroom?.name : currentClassroom?.nameEn;
  const classroomNote = currentLang === 'ar' ? currentClassroom?.note : currentClassroom?.noteEn;
  const occupancyRate = Math.max(0, Math.min(100, currentClassroom?.studentNumber || 0));
  const attendanceRate = Math.max(0, Math.min(100, occupancyRate + 5));
  const formattedCreationDate = currentClassroom?.creationDate
    ? new Intl.DateTimeFormat(currentLang === 'ar' ? 'ar-EG' : 'en-GB').format(
        new Date(currentClassroom.creationDate)
      )
    : '-';

  const classroomDetails = [
    {
      label: t('classrooms.details.academicSystem'),
      value: currentClassroom?.academicSystemName || '-',
    },
    {
      label: t('classrooms.details.educationalStage'),
      value: currentClassroom?.gradeName || '-',
    },
    {
      label: t('classrooms.details.grade'),
      value: currentClassroom?.gradeName || '-',
    },
    {
      label: t('classrooms.details.studentsCount'),
      value: currentClassroom?.studentNumber ?? 0,
    },
    {
      label: t('classrooms.details.creationDate'),
      value: formattedCreationDate,
    },
    {
      label: t('classrooms.details.classroomNotes'),
      value: classroomNote || t('classrooms.details.noNotes'),
    },
  ];

  const studentRows = useMemo<StudentRow[]>(
    () =>
      classroomStudents.map((student) => ({
        id: student.id,
        name: [student.firstName, student.secondName, student.thirdName, student.fourthName]
          .filter(Boolean)
          .join(' ') || student.name,
        imageSrc: student.profilePicture
          ? `${baseUrl}/${student.profilePicture.replace(/^\/+/, '')}`
          : ProfileImage,
      })),
    [baseUrl, classroomStudents]
  );

  const filteredStudents = useMemo(
    () =>
      studentRows.filter((student) =>
        student.name.toLowerCase().includes(studentSearchTerm.trim().toLowerCase())
      ),
    [studentRows, studentSearchTerm]
  );

  const paginatedStudents = useMemo(
    () => filteredStudents.slice((studentPage - 1) * itemsPerPage, studentPage * itemsPerPage),
    [filteredStudents, studentPage]
  );

  const studentsTotalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));

  const tabItems: TabItem[] = [
    {
      id: 'students',
      label: t('sidebar.students'),
      content: (
        <StudentsTab
          rows={paginatedStudents}
          isLoading={isLoadingClassroomStudents}
          currentPage={studentPage}
          totalPages={studentsTotalPages}
          totalCount={filteredStudents.length}
          searchTerm={studentSearchTerm}
          itemsPerPage={itemsPerPage}
          onSearchChange={(value) => {
            setStudentSearchTerm(value);
            setStudentPage(1);
          }}
          onPageChange={setStudentPage}
          onResetFilters={() => {
            setStudentSearchTerm('');
            setStudentPage(1);
          }}
        />
      ),
    },
    {
      id: 'teachers',
      label: t('sidebar.teachers'),
      content: (
        <TeacherTab
          currentPage={teacherPage}
          searchTerm={teacherSearchTerm}
          selectedSubject={selectedSubject}
          itemsPerPage={itemsPerPage}
          onSearchChange={(value) => {
            setTeacherSearchTerm(value);
            setTeacherPage(1);
          }}
          onSubjectChange={(value) => {
            setSelectedSubject(value);
            setTeacherPage(1);
          }}
          onPageChange={setTeacherPage}
          onResetFilters={() => {
            setTeacherSearchTerm('');
            setSelectedSubject('');
            setTeacherPage(1);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="app-card-shadow rounded-[2rem] border border-[#E6F5EF] bg-white p-5">
        <div className="rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-4">
          <div className="flex flex-col-reverse gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div className="app-card-shadow h-[100px] w-[100px] overflow-hidden rounded-2xl border border-white bg-white">
                {classroomImageSrc ? (
                  <CustomImage
                    src={classroomImageSrc}
                    alt={classroomName || t('classrooms.details.classroomImage')}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#DDF7EC] text-center text-xs font-medium text-[#53A785]">
                    {t('classrooms.details.classroomImage')}
                  </div>
                )}
              </div>
              <div className="space-y-2 text-start">
                <div className="text-base font-medium text-black-900">
                  {t('classrooms.details.classroomName')}
                </div>
                <div className="text-sm font-normal text-[#646969]">{classroomName || '-'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:w-auto">
              <div className="app-card-shadow rounded-3xl border border-black-100 bg-white px-8 py-4">
                <div className="text-center text-sm font-normal text-[#646969]">
                  {t('classrooms.details.attendanceRate')}
                </div>
                <div
                  className={`mt-4 text-start text-base font-medium ${getProgressTextColorClassName(
                    attendanceRate
                  )}`}
                >
                  {attendanceRate}%
                </div>
              </div>
              <div className="app-card-shadow rounded-3xl border border-black-100 bg-white px-8 py-4">
                <div className="text-center text-sm font-normal text-[#646969]">
                  {t('classrooms.details.occupancyRate')}
                </div>
                <div
                  className={`mt-4 text-start text-base font-medium ${getProgressTextColorClassName(
                    occupancyRate
                  )}`}
                >
                  {occupancyRate}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-12 gap-y-6 px-2 pt-6 md:grid-cols-2">
          {classroomDetails.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-base font-medium text-[#3A3A3A]">{item.label}:</span>
              <span className="text-sm font-normal text-[#3A3A3A]">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-start text-base font-medium text-[#3A3A3A]">
        {t('sidebar.teachingStaff')}
      </div>
      <Card className="rounded-3xl border border-[#E6E6E6] p-6">
        <Tabs
          items={tabItems}
          value={activeTab}
          onChange={setActiveTab}
          listClassName="mb-6 flex w-full xl:w-[25%] lg:w-[40%] md:w-[60%] items-center gap-8"
        />
      </Card>
    </div>
  );
}
