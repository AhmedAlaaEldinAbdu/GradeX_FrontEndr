import PageHeader from '@/shared/components/PageHeader';
import StudentsAttendanceTab from './components/StudentsAttendanceTab';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';

export default function StudentsAttendancePage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('sidebar.studentAffairs') },
          { label: t('sidebar.studentManagement') },
          { label: t('attendance.title') },
        ]}
      />

      <PageHeader title="attendance.title" hasHeaderControls={true} />
      <StudentsAttendanceTab isActive={true} />
    </div>
  );
}
