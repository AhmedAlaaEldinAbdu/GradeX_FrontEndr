import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchDashboardMetrics,
  fetchAttendanceStatistics,
} from '@/redux/features/control-panel/controlPanelSlice';
import { AttendanceFilterType } from '@/shared/enums/enums';
import Card from '@/shared/components/Card';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import BarChart from '@/shared/components/BarChart';
import TaskBlueIcon from '@gradex/assets/icons/TaskBlue.svg';
import SchoolPurpleIcon from '@gradex/assets/icons/SchoolPurple.svg';
import StudentYellowIcon from '@gradex/assets/icons/StudentYellow.svg';
import TeachersLightBlueIcon from '@gradex/assets/icons/TeachersLightBlue.svg';
import BusRouteIcon from '@gradex/assets/icons/BusRoute.svg';
import FilesTealIcon from '@gradex/assets/icons/FilesTeal.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import TimeEstimationYellowIcon from '@gradex/assets/icons/TimeEstimationYellow.svg';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import SupplyCurveIcon from '@gradex/assets/icons/SupplyCurve.svg';
import DecreaseRedIcon from '@gradex/assets/icons/DecreaseRed.svg';

// 'term' is hidden for now (not yet supported by the AttendanceStatistics endpoint).
type AttendanceFilter = 'day' | 'week' | 'month';

const ATTENDANCE_FILTER_MAP: Record<AttendanceFilter, number> = {
  day: AttendanceFilterType.Day,
  week: AttendanceFilterType.Week,
  month: AttendanceFilterType.Month,
};

// Bars show the present-student count per stage; the y-axis caps at 400+.
const ATTENDANCE_MAX = 400;
const Y_TICKS = [400, 350, 300, 250, 200, 150, 100, 50, 0];

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dispatch = useAppDispatch();

  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('month');

  const dashboardMetrics = useAppSelector((state) => state.controlPanel.dashboardMetrics);
  const attendanceStatistics = useAppSelector((state) => state.controlPanel.attendanceStatistics);
  const attendanceChangePercentage = useAppSelector(
    (state) => state.controlPanel.attendanceChangePercentage
  );
  const attendanceIsIncrease = useAppSelector((state) => state.controlPanel.attendanceIsIncrease);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAttendanceStatistics({ filterType: ATTENDANCE_FILTER_MAP[attendanceFilter] }));
  }, [dispatch, attendanceFilter]);

  const stats = {
    orders: dashboardMetrics?.totalStudentsRequests ?? 0,
    classrooms: dashboardMetrics?.totalClasses ?? 0,
    students: dashboardMetrics?.totalStudents ?? 0,
    teachers: dashboardMetrics?.totalTeachers ?? 0,
    incompleteData: dashboardMetrics?.totalStudentApplications.totalMissingData ?? 0,
    rejected: dashboardMetrics?.totalStudentApplications.totalRejection ?? 0,
    pending: dashboardMetrics?.totalStudentApplications.totalPending ?? 0,
    accepted: dashboardMetrics?.totalStudentApplications.totalAcceptance ?? 0,
  };

  // Ordered left-to-right; the chart renders LTR regardless of page direction.
  const stageBars = useMemo(
    () =>
      attendanceStatistics.map((stage) => ({
        key: stage.stageId,
        label: isAr ? stage.stageNameAr : stage.stageNameEn,
        value: stage.presentCount,
        presentCount: stage.presentCount,
        totalCount: stage.totalCount,
        attendancePercentage: stage.attendancePercentage,
      })),
    [attendanceStatistics, isAr]
  );

  const renderStageTooltip = (bar: (typeof stageBars)[number]) => (
    <>
      <p className="mb-1 font-semibold">{bar.label}</p>
      <p>
        {t('schoolDashboard.attendanceTooltip.present')}: {bar.presentCount}
      </p>
      <p>
        {t('schoolDashboard.attendanceTooltip.total')}: {bar.totalCount}
      </p>
      <p>
        {t('schoolDashboard.attendanceTooltip.percentage')}: {bar.attendancePercentage}%
      </p>
    </>
  );

  const todayLabel = useMemo(() => {
    const locale = isAr ? 'ar-EG-u-nu-latn' : 'en-US';
    return new Date().toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [isAr]);

  const academicYear = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    // School year flips in August (month index 7).
    return now.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
  }, []);

  const filterTabs: AttendanceFilter[] = ['day', 'week', 'month'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="schoolDashboard.title"
        subtitle={`${t('schoolDashboard.summaryPrefix')} ${todayLabel}`}
        statistics={{
          value: `${t('schoolDashboard.firstTerm')} • ${academicYear}`,
          label: '',
        }}
        statisticsClassName="py-1.5! font-medium! text-[#057746]! bg-[#039958]/10!"
      />

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('schoolDashboard.metrics.teachersCount')}
          value={stats.teachers}
          icon={<CustomImage src={TeachersLightBlueIcon} alt="Teachers" className="h-5 w-5" />}
          iconClassName="bg-[#25BDD7]/10"
        />
        <MetricCard
          title={t('schoolDashboard.metrics.studentsCount')}
          value={stats.students}
          icon={<CustomImage src={StudentYellowIcon} alt="Student" className="h-5 w-5" />}
          iconClassName="bg-[#F6CB3B]/10"
        />
        <MetricCard
          title={t('schoolDashboard.metrics.classroomsCount')}
          value={stats.classrooms}
          icon={<CustomImage src={SchoolPurpleIcon} alt="School" className="h-5 w-5" />}
          iconClassName="bg-purple-500/10"
        />
        <MetricCard
          title={t('schoolDashboard.metrics.ordersCount')}
          value={stats.orders}
          icon={<CustomImage src={TaskBlueIcon} alt="Task" className="h-5 w-5" />}
          iconClassName="bg-[#42ADFF]/10"
        />
      </div>

      {/* Attendance + Bus route */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Attendance rate */}
        <Card className="rounded-3xl" padding="md">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-medium text-[#3A3A3A]">
              {t('schoolDashboard.attendanceRate')}
            </h3>
            <div className="flex items-center gap-1 rounded-full border border-[#DDE0E0] p-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAttendanceFilter(tab)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    attendanceFilter === tab
                      ? 'bg-green-500 text-white'
                      : 'text-[#646969] hover:text-[#3A3A3A]'
                  }`}
                >
                  {t(`schoolDashboard.filters.${tab}`)}
                </button>
              ))}
            </div>
          </div>

          {attendanceChangePercentage != null && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <span
                className={`flex items-center gap-1 text-sm font-normal ${
                  attendanceIsIncrease === false ? 'text-red-500' : 'text-lightGreen-500'
                }`}
              >
                %{attendanceChangePercentage}
                <CustomImage
                  src={attendanceIsIncrease === false ? DecreaseRedIcon : SupplyCurveIcon}
                  alt={attendanceIsIncrease === false ? 'Decrease' : 'Increase'}
                  className="h-5 w-5"
                />
              </span>
              <span className="text-[#8C8C8C]">{t('schoolDashboard.vsLastMonth')}</span>
            </div>
          )}

          {/* Bar chart */}
          <BarChart
            data={stageBars.map((bar) => ({
              key: bar.key,
              label: bar.label,
              value: bar.value,
              tooltip: renderStageTooltip(bar),
            }))}
            yTicks={Y_TICKS}
            max={ATTENDANCE_MAX}
            renderTick={(tick) => (tick === ATTENDANCE_MAX ? `${tick}+` : tick)}
          />
        </Card>

        {/* Bus route */}
        <Card className="rounded-3xl" padding="md">
          <h3 className="mb-4 flex text-lg font-medium text-[#3A3A3A]">
            {t('schoolDashboard.busRoute')}
          </h3>
          <div className="relative h-[335px] overflow-hidden rounded-2xl">
            <CustomImage
              src={BusRouteIcon}
              alt={t('schoolDashboard.busRoute')}
              className="h-full w-full object-cover"
            />
          </div>
        </Card>
      </div>

      {/* Applications summary */}
      <div className="space-y-4">
        <h2 className="flex text-lg font-medium text-[#3A3A3A]">
          {t('schoolDashboard.applicationsSummary')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t('studentApplications.acceptedCount')}
            value={stats.accepted}
            icon={<CustomImage src={CheckCircleIcon} alt="Checkmark" className="h-5 w-5" />}
            iconClassName="bg-lightGreen-500/10"
          />
          <MetricCard
            title={t('studentApplications.status.underReview')}
            value={stats.pending}
            icon={<CustomImage src={TimeEstimationYellowIcon} alt="Time" className="h-5 w-5" />}
            iconClassName="bg-[#F6CB3B]/10"
          />
          <MetricCard
            title={t('studentApplications.notPassedCount')}
            value={stats.rejected}
            icon={<CustomImage src={XmarkCircleRedIcon} alt="Xmark" className="h-5 w-5" />}
            iconClassName="bg-red-500/10"
          />
          <MetricCard
            title={t('studentApplications.underEditCount')}
            value={stats.incompleteData}
            icon={<CustomImage src={FilesTealIcon} alt="Files" className="h-5 w-5" />}
            iconClassName="bg-[#25BDD7]/10"
          />
        </div>
      </div>
    </div>
  );
}
