import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchDashboardMetrics } from '@/redux/features/control-panel/controlPanelSlice';
import Card from '@/shared/components/Card';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
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

type AttendanceFilter = 'day' | 'week' | 'month' | 'term';

const ATTENDANCE_MAX = 400;
const Y_TICKS = [400, 350, 300, 250, 200, 150, 100, 50, 0];

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dispatch = useAppDispatch();

  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('month');

  const dashboardMetrics = useAppSelector((state) => state.controlPanel.dashboardMetrics);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
  }, [dispatch]);

  const stats = {
    orders: dashboardMetrics?.totalStudentsRequests ?? 0,
    classrooms: dashboardMetrics?.totalClasses ?? 0,
    students: dashboardMetrics?.totalStudents ?? 0,
    teachers: dashboardMetrics?.totalTeachers ?? 0,
    incompleteData: dashboardMetrics?.totalStudentApplications.totalMissingData ?? 0,
    rejected: dashboardMetrics?.totalStudentApplications.totalRejection ?? 0,
    pending: dashboardMetrics?.totalStudentApplications.totalPending ?? 0,
    accepted: dashboardMetrics?.totalStudentApplications.totalAcceptance ?? 0,
    // Not yet exposed by the dashboard-metrics endpoint.
    attendanceChangePercent: 18,
  };

  // Ordered left-to-right; the chart renders LTR regardless of page direction.
  const stageBars = [
    { key: 'kindergarten', value: 120 },
    { key: 'primary', value: 310 },
    { key: 'preparatory', value: 215 },
    { key: 'secondary', value: 385 },
  ];

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

  const filterTabs: AttendanceFilter[] = ['day', 'week', 'month', 'term'];

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
        statisticsClassName="!py-1.5 !font-medium !text-[#057746] !bg-[#039958]/10"
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
          iconClassName="bg-[#A353DD]/10"
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

          {stats.attendanceChangePercent > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-sm font-normal text-[#1A9F58]">
                %{stats.attendanceChangePercent}
                <CustomImage src={SupplyCurveIcon} alt="SupplyCurve" className="h-5 w-5" />
              </span>
              <span className="text-[#8C8C8C]">{t('schoolDashboard.vsLastMonth')}</span>
            </div>
          )}

          {/* Bar chart */}
          <div dir="ltr" className="flex gap-3">
            {/* Y axis — height matches the plot so "0" lines up with the bar baseline */}
            <div className="flex h-[280px] flex-col justify-between text-xs font-normal text-[#A9A7A7]">
              {Y_TICKS.map((tick) => (
                <span key={tick} className="-translate-y-1/2 leading-none">
                  {tick === ATTENDANCE_MAX ? `${tick}+` : tick}
                </span>
              ))}
            </div>

            {/* Plot */}
            <div className="flex-1">
              <div className="relative h-[280px]">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {Y_TICKS.map((tick) => (
                    <div key={tick} className="border-t border-dashed border-[#DDE0E0]" />
                  ))}
                </div>
                <div className="relative flex h-full items-end justify-around gap-4">
                  {stageBars.map((bar) => (
                    <div
                      key={bar.key}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <div
                        className="w-10 rounded-t-md bg-[#4D9E7B] transition-all"
                        style={{
                          height: `${Math.min(100, (bar.value / ATTENDANCE_MAX) * 100)}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-around gap-4">
                {stageBars.map((bar) => (
                  <span
                    key={bar.key}
                    className="flex-1 text-center text-sm font-normal text-[#0E1F1F]"
                  >
                    {t(`schoolDashboard.stages.${bar.key}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
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
            title={t('schoolDashboard.applications.accepted')}
            value={stats.accepted}
            icon={<CustomImage src={CheckCircleIcon} alt="Checkmark" className="h-5 w-5" />}
            iconClassName="bg-[#1A9F58]/10"
          />
          <MetricCard
            title={t('schoolDashboard.applications.pending')}
            value={stats.pending}
            icon={<CustomImage src={TimeEstimationYellowIcon} alt="Time" className="h-5 w-5" />}
            iconClassName="bg-[#F6CB3B]/10"
          />
          <MetricCard
            title={t('schoolDashboard.applications.rejected')}
            value={stats.rejected}
            icon={<CustomImage src={XmarkCircleRedIcon} alt="Xmark" className="h-5 w-5" />}
            iconClassName="bg-[#DD0417]/10"
          />
          <MetricCard
            title={t('schoolDashboard.applications.incompleteData')}
            value={stats.incompleteData}
            icon={<CustomImage src={FilesTealIcon} alt="Files" className="h-5 w-5" />}
            iconClassName="bg-[#25BDD7]/10"
          />
        </div>
      </div>
    </div>
  );
}
