import PageHeader from '@/shared/components/PageHeader';
import StudentsAttendanceTab from './components/StudentsAttendanceTab';

export default function StudentsAttendancePage() {
  return (
    <div>
      <PageHeader title="attendance.studentsTitle" />
      <StudentsAttendanceTab isActive={true} />
    </div>
  );
}
