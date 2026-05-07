import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/shared/context/ToastContext';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import EmployeesAttendanceTab from './components/EmployeesAttendanceTab';
import AddAttendanceSchedulePopup, {
  type AttendanceScheduleFormData,
} from './popups/AddAttendanceSchedulePopup';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { updateWorkingHours } from '@/services/api/schools/schools.service';
import { teacherAttendanceApiService } from '@/services/api/teacher-attendance/teacher-attendance.service';
import { AttendanceStatus, type TeacherAttendance } from '@/types/teacherAttendance';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import TeachersBlueIcon from '@gradex/assets/icons/TeachersBlue.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import ClockYellowBoldIcon from '@gradex/assets/icons/ClockYellowBold.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';

type EmployeeAttendanceStatistics = {
  totalAttendance: number;
  totalAbsences: number;
  totalTardiness: number;
  attendancePercentage: number;
};

const initialStatistics: EmployeeAttendanceStatistics = {
  totalAttendance: 0,
  totalAbsences: 0,
  totalTardiness: 0,
  attendancePercentage: 0,
};

export default function EmployeesAttendancePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const schoolBranchId = getCurrentSchoolBranchId();
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statistics, setStatistics] = useState<EmployeeAttendanceStatistics>(initialStatistics);

  useEffect(() => {
    let isMounted = true;

    const loadStatistics = async () => {
      try {
        const response = await teacherAttendanceApiService.getTeacherAttendanceByBranch({
          SchoolBrancheId: schoolBranchId || '',
          PageIndex: 1,
          PageSize: 10000,
        });

        if (!isMounted) return;

        const records: TeacherAttendance[] = response.data?.teachersAttends ?? [];
        const totalAttendance = records.filter(
          (record) => record.status === AttendanceStatus.Present
        ).length;
        const totalAbsences = records.filter(
          (record) => record.status === AttendanceStatus.Absent
        ).length;
        const totalTardiness = records.filter(
          (record) => record.status === AttendanceStatus.Late
        ).length;

        const recordedTotal = totalAttendance + totalAbsences + totalTardiness;
        const attendancePercentage =
          recordedTotal > 0 ? Math.round((totalAttendance / recordedTotal) * 100) : 0;

        setStatistics({
          totalAttendance,
          totalAbsences,
          totalTardiness,
          attendancePercentage,
        });
      } catch {
        if (isMounted) {
          setStatistics(initialStatistics);
        }
      }
    };

    loadStatistics();

    return () => {
      isMounted = false;
    };
  }, [schoolBranchId]);

  const metrics = useMemo(
    () => [
      {
        title: t('attendance.statistics.totalAttendance'),
        value: statistics.totalAttendance,
        percentage: false,
        icon: (
          <CustomImage
            src={TeachersBlueIcon}
            alt={t('attendance.statistics.totalAttendance')}
            className="h-6 w-6"
          />
        ),
        iconClassName: 'bg-blue-50 text-blue-600',
      },
      {
        title: t('attendance.statistics.totalAbsences'),
        value: statistics.totalAbsences,
        percentage: false,
        icon: (
          <CustomImage
            src={XmarkCircleRedIcon}
            alt={t('attendance.statistics.totalAbsences')}
            className="h-6 w-6"
          />
        ),
        iconClassName: 'bg-red-50 text-red-600',
      },
      {
        title: t('attendance.statistics.totalTardiness'),
        value: statistics.totalTardiness,
        percentage: false,
        icon: (
          <CustomImage
            src={ClockYellowBoldIcon}
            alt={t('attendance.statistics.totalTardiness')}
            className="h-6 w-6"
          />
        ),
        iconClassName: 'bg-yellow-50 text-yellow-600',
      },
      {
        title: t('attendance.statistics.attendancePercentage'),
        value: statistics.attendancePercentage,
        percentage: true,
        icon: (
          <CustomImage
            src={CheckMarkIcon}
            alt={t('attendance.statistics.attendancePercentage')}
            className="h-6 w-6"
          />
        ),
        iconClassName: 'bg-green-50 text-green-600',
      },
    ],
    [statistics, t]
  );

  const handleSubmitSchedule = async (data: AttendanceScheduleFormData) => {
    if (!schoolBranchId) {
      showToast({ message: t('common.errorOccurred'), type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateWorkingHours(schoolBranchId, {
        workingHoursFrom: data.workingHoursFrom,
        workingHoursTo: data.workingHoursTo,
      });
      showToast({ message: t('attendance.scheduleUpdatedSuccess'), type: 'success' });
      setIsSchedulePopupOpen(false);
    } catch (error) {
      console.error('Failed to update working hours:', error);
      showToast({ message: t('attendance.scheduleUpdatedError'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: t('sidebar.humanResources') },
    { label: t('attendance.title') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="attendance.employeesTitle"
        hasHeaderControls={true}
        actions={[
          {
            label: 'attendance.addAttendanceSchedule',
            onClick: () => setIsSchedulePopupOpen(true),
            imgSrc: PlusIcon,
            imgClassName: 'w-[20px] h-[20px]',
          },
        ]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            percentage={metric.percentage}
            icon={metric.icon}
            iconClassName={metric.iconClassName}
          />
        ))}
      </div>

      <EmployeesAttendanceTab isActive={true} />

      <AddAttendanceSchedulePopup
        open={isSchedulePopupOpen}
        onClose={() => setIsSchedulePopupOpen(false)}
        onSubmit={handleSubmitSchedule}
        isLoading={isSubmitting}
      />
    </div>
  );
}
