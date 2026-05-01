import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { studentAttendanceApiService } from '@/services/api/student-attendance/student-attendance.service';
import { StudentAttendanceStatus, type StudentAttendanceDto } from '@/types/studentAttendance';
import TeachersBlueIcon from '@gradex/assets/icons/TeachersBlue.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import ClockYellowBoldIcon from '@gradex/assets/icons/ClockYellowBold.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import AttendanceManagement from './AttendanceManagement';

interface StudentsAttendanceTabProps {
  filterComponent?: ReactNode;
  isActive?: boolean;
}

type StudentAttendanceStatistics = {
  totalAttendance: number;
  totalAbsences: number;
  totalTardiness: number;
  attendancePercentage: number;
};

const initialStatistics: StudentAttendanceStatistics = {
  totalAttendance: 0,
  totalAbsences: 0,
  totalTardiness: 0,
  attendancePercentage: 0,
};

export default function StudentsAttendanceTab({
  filterComponent,
  isActive,
}: StudentsAttendanceTabProps) {
  const { t } = useTranslation();
  const schoolBranchId = getCurrentSchoolBranchId();
  const [statistics, setStatistics] = useState<StudentAttendanceStatistics>(initialStatistics);

  useEffect(() => {
    if (!isActive) return;

    let isMounted = true;

    const loadStatistics = async () => {
      try {
        const response = await studentAttendanceApiService.getStudentAttendanceByBranch({
          SchoolBrancheId: schoolBranchId || '',
          PageIndex: 1,
          PageSize: 10000,
        });

        if (!isMounted) {
          return;
        }

        const records: StudentAttendanceDto[] = response.data?.studentsAttends ?? [];
        const totalAttendance = records.filter(
          (record) => record.status === StudentAttendanceStatus.Present
        ).length;
        const totalAbsences = records.filter(
          (record) => record.status === StudentAttendanceStatus.Absent
        ).length;
        const totalTardiness = records.filter(
          (record) => record.status === StudentAttendanceStatus.Late
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
  }, [isActive, schoolBranchId]);

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

  // Only render when active to optimize performance
  if (!isActive) return null;

  return (
    <div>
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

      {/* Render shared filter component if provided */}
      {filterComponent}

      {/* Students Attendance Table */}
      <AttendanceManagement />
    </div>
  );
}
