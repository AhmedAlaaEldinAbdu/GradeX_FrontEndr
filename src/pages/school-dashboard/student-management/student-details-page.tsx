import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import PersonalDataTab from '@/pages/school-dashboard/student-management/components/details/PersonalDataTab';
import DelegationTab from '@/pages/school-dashboard/student-management/components/details/DelegationTab';
import AttendanceTab from '@/pages/school-dashboard/student-management/components/details/AttendanceTab';
import FeesTab from '@/pages/school-dashboard/student-management/components/details/FeesTab';
import HomeworkTab from '@/pages/school-dashboard/student-management/components/details/HomeworkTab';
import PerformanceTab from '@/pages/school-dashboard/student-management/components/details/PerformanceTab';
import MedicalRecordTab from '@/pages/school-dashboard/student-management/components/details/MedicalRecordTab';
import ExamsTab from '@/pages/school-dashboard/student-management/components/details/ExamsTab';
import PageHeader from '@/shared/components/PageHeader';
import Loading from '@/shared/components/Loading';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchStudentByIdSilent } from '@/redux/features/students/studentsSlice';
import { getStudentFullName, type StudentDto } from '@/services/api/types/students.types';

export default function StudentDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [student, setStudent] = useState<StudentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dispatch(fetchStudentByIdSilent(id)).unwrap();
        setStudent(data);
      } catch (err) {
        console.error('Failed to fetch student:', err);
        setError((err as { message?: string })?.message || t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [dispatch, id, t]);

  const studentName = student ? getStudentFullName(student) : '';

  const isFromAttendance = location.state?.from === 'attendance';
  const isFromStudentsRecord = location.state?.from === 'studentsRecord';

  const breadcrumbItems = isFromAttendance
    ? [
        { label: t('sidebar.studentAffairs') },
        { label: t('sidebar.studentManagement') },
        { label: t('sidebar.attendance'), path: '/students/attendance' },
        { label: studentName },
      ]
    : isFromStudentsRecord
      ? [
          { label: t('sidebar.studentAffairs') },
          { label: t('sidebar.studentManagement') },
          { label: t('studentManagement.studentsRecord'), path: '/students-record' },
          { label: studentName },
        ]
      : [
          { label: t('sidebar.studentManagement') },
          { label: t('students.title'), path: '/students-record' },
          { label: studentName },
        ];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-red-500">{error || t('common.noDataFound')}</div>
      </div>
    );
  }

  const tabItems: TabItem[] = [
    {
      id: 'personal-data',
      label: t('students.details.personalData'),
      content: <PersonalDataTab student={student} />,
    },
    {
      id: 'delegation',
      label: t('students.details.delegation'),
      content: <DelegationTab studentId={id || ''} />,
    },
    {
      id: 'attendance',
      label: t('students.details.attendance'),
      content: <AttendanceTab studentId={id || ''} />,
    },
    {
      id: 'performance',
      label: t('students.details.performance'),
      content: <PerformanceTab studentId={id || ''} />,
    },
    {
      id: 'exams',
      label: t('students.details.exams'),
      content: <ExamsTab studentId={id || ''} />,
    },
    {
      id: 'homework',
      label: t('students.details.homework'),
      content: <HomeworkTab studentId={id || ''} />,
    },
    {
      id: 'fees',
      label: t('students.details.fees'),
      content: (
        <FeesTab
          studentId={id || ''}
          gradeId={student?.gradeId}
          schoolBranchId={student?.schoolBrancheId}
        />
      ),
    },
    {
      id: 'medical-record',
      label: t('students.details.medicalRecord'),
      content: <MedicalRecordTab studentId={id || ''} />,
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Student Name Title */}
      <PageHeader title={studentName} />

      {/* Tabs */}
      <Tabs
        items={tabItems}
        defaultValue="personal-data"
        searchParamKey="tab"
        listClassName="mb-6 flex w-full items-center gap-6"
      />
    </div>
  );
}
