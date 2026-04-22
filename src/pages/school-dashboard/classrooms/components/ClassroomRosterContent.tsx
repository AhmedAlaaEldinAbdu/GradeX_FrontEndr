import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import ProfileImage from '@gradex/assets/images/profile.png';
import StudentsTab, { type StudentRow } from './StudentsTab';
import TeacherTab, { type TeacherRow } from './TeacherTab';

type ClassroomRosterContentProps = {
  currentLang: 'ar' | 'en';
};

export default function ClassroomRosterContent({ currentLang }: ClassroomRosterContentProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('students');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const itemsPerPage = 6;

  const studentRows = useMemo<StudentRow[]>(
    () => [
      {
        id: 'student-1',
        name: currentLang === 'ar' ? 'أحمد معتز حسن' : 'Ahmed Moataz Hassan',
        imageSrc: ProfileImage,
      },
      {
        id: 'student-2',
        name: currentLang === 'ar' ? 'محمد سامي علي' : 'Mohamed Sami Ali',
        imageSrc: ProfileImage,
      },
      {
        id: 'student-3',
        name: currentLang === 'ar' ? 'عبدالله خالد سالم' : 'Abdullah Khaled Salem',
        imageSrc: ProfileImage,
      },
      {
        id: 'student-4',
        name: currentLang === 'ar' ? 'يوسف محمود طارق' : 'Youssef Mahmoud Tarek',
        imageSrc: ProfileImage,
      },
      {
        id: 'student-5',
        name: currentLang === 'ar' ? 'عمر ناصر فهد' : 'Omar Nasser Fahad',
        imageSrc: ProfileImage,
      },
      {
        id: 'student-6',
        name: currentLang === 'ar' ? 'سالم عادل حسن' : 'Salem Adel Hassan',
        imageSrc: ProfileImage,
      },
      {
        id: 'student-7',
        name: currentLang === 'ar' ? 'حسن إبراهيم جابر' : 'Hassan Ibrahim Jaber',
        imageSrc: ProfileImage,
      },
    ],
    [currentLang]
  );

  const teacherRows = useMemo<TeacherRow[]>(
    () => [
      {
        id: 'teacher-1',
        name: currentLang === 'ar' ? 'أحمد معتز حسن' : 'Ahmed Moataz Hassan',
        subject: currentLang === 'ar' ? 'مادة اللغة العربية' : 'Arabic Language',
        imageSrc: ProfileImage,
      },
      {
        id: 'teacher-2',
        name: currentLang === 'ar' ? 'محمد سامي علي' : 'Mohamed Sami Ali',
        subject: currentLang === 'ar' ? 'مادة الرياضيات' : 'Mathematics',
        imageSrc: ProfileImage,
      },
      {
        id: 'teacher-3',
        name: currentLang === 'ar' ? 'عبدالله خالد سالم' : 'Abdullah Khaled Salem',
        subject: currentLang === 'ar' ? 'مادة العلوم' : 'Science',
        imageSrc: ProfileImage,
      },
      {
        id: 'teacher-4',
        name: currentLang === 'ar' ? 'يوسف محمود طارق' : 'Youssef Mahmoud Tarek',
        subject: currentLang === 'ar' ? 'مادة اللغة الإنجليزية' : 'English Language',
        imageSrc: ProfileImage,
      },
      {
        id: 'teacher-5',
        name: currentLang === 'ar' ? 'عمر ناصر فهد' : 'Omar Nasser Fahad',
        subject: currentLang === 'ar' ? 'مادة الدراسات الاجتماعية' : 'Social Studies',
        imageSrc: ProfileImage,
      },
      {
        id: 'teacher-6',
        name: currentLang === 'ar' ? 'سالم عادل حسن' : 'Salem Adel Hassan',
        subject: currentLang === 'ar' ? 'مادة التربية الإسلامية' : 'Islamic Studies',
        imageSrc: ProfileImage,
      },
      {
        id: 'teacher-7',
        name: currentLang === 'ar' ? 'حسن إبراهيم جابر' : 'Hassan Ibrahim Jaber',
        subject: currentLang === 'ar' ? 'مادة الحاسب الآلي' : 'Computer Studies',
        imageSrc: ProfileImage,
      },
    ],
    [currentLang]
  );

  const subjectOptions = useMemo(
    () =>
      [
        { value: '', label: t('teachers.selectSubject') },
        ...teacherRows.map((teacher) => ({ value: teacher.subject, label: teacher.subject })),
      ].filter(
        (option, index, array) => array.findIndex((item) => item.value === option.value) === index
      ),
    [t, teacherRows]
  );

  const filteredStudents = useMemo(
    () =>
      studentRows.filter((student) =>
        student.name.toLowerCase().includes(studentSearchTerm.trim().toLowerCase())
      ),
    [studentRows, studentSearchTerm]
  );

  const filteredTeachers = useMemo(
    () =>
      teacherRows.filter((teacher) => {
        const matchesName = teacher.name
          .toLowerCase()
          .includes(teacherSearchTerm.trim().toLowerCase());
        const matchesSubject = selectedSubject ? teacher.subject === selectedSubject : true;
        return matchesName && matchesSubject;
      }),
    [selectedSubject, teacherRows, teacherSearchTerm]
  );

  const paginatedStudents = useMemo(
    () => filteredStudents.slice((studentPage - 1) * itemsPerPage, studentPage * itemsPerPage),
    [filteredStudents, studentPage]
  );

  const paginatedTeachers = useMemo(
    () => filteredTeachers.slice((teacherPage - 1) * itemsPerPage, teacherPage * itemsPerPage),
    [filteredTeachers, teacherPage]
  );

  const studentsTotalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const teachersTotalPages = Math.max(1, Math.ceil(filteredTeachers.length / itemsPerPage));

  const tabItems: TabItem[] = [
    {
      id: 'students',
      label: t('sidebar.students'),
      content: (
        <StudentsTab
          rows={paginatedStudents}
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
          rows={paginatedTeachers}
          currentPage={teacherPage}
          totalPages={teachersTotalPages}
          totalCount={filteredTeachers.length}
          searchTerm={teacherSearchTerm}
          selectedSubject={selectedSubject}
          itemsPerPage={itemsPerPage}
          subjectOptions={subjectOptions}
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
      <div className="text-start text-base font-medium text-[#3A3A3A]">
        {t('sidebar.teachingStaff')}
      </div>
      <Card className="rounded-3xl border border-[#E6E6E6] p-6">
        <Tabs
          items={tabItems}
          value={activeTab}
          onChange={setActiveTab}
          listClassName="mb-6 flex w-full xl:w-[25%] lg:w-[40%] md:w-[60%] items-center justify-end gap-8"
        />
      </Card>
    </div>
  );
}
