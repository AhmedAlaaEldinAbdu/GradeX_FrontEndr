import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchTeacherPersonalData } from '@/redux/features/teachers';
import PersonalDataTab from './components/PersonalDataTab';
import AttendanceTab from './components/AttendanceTab';
import EducationalStagesTab from './components/EducationalStagesTab';
import EducationalStagesTabAttendance from './components/EducationalStagesTabAttendance';
import LeavesTab from './components/LeavesTab';
import Loading from '@/shared/components/Loading';
import { teacherApiService } from '@/services/api/teachers/teachers.service';
import { getCurrentSchoolBranchId } from '@/lib/auth';

interface LocationState {
  comeFrom?: string;
}

export default function TeacherDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showRecordAttendancePopup, setShowRecordAttendancePopup] = useState(false);
  const [hasAssignment, setHasAssignment] = useState<boolean | null>(null);
  const [firstAssignmentId, setFirstAssignmentId] = useState<string | null>(null);
  const schoolBranchId = getCurrentSchoolBranchId();

  // Check if coming from job-announcements
  const locationState = location.state as LocationState | null;
  const isFromJobAnnouncements = locationState?.comeFrom === 'job-announcements';
  const isFromCalendarTasks = locationState?.comeFrom === 'calendar-tasks';

  const isFromAttendance = location.pathname.startsWith('/employees/attendance/teachers/');

  const teacherPersonalData = useAppSelector((state) => state.teachers.teacherPersonalData);
  const isLoadingPersonalData = useAppSelector((state) => state.teachers.isLoadingPersonalData);

  useEffect(() => {
    if (id) {
      dispatch(fetchTeacherPersonalData(id));
    }
  }, [dispatch, id]);

  // Fetch assignment list to check if teacher has placement
  useEffect(() => {
    if (!id || !schoolBranchId) return;
    let cancelled = false;
    teacherApiService
      .getTeacherAssignmentList({
        TeacherId: id,
        SchoolBranchesId: schoolBranchId,
        PageSize: 1,
      })
      .then((data) => {
        if (cancelled) return;
        const assignments = data?.teacherAssignmentDto ?? [];
        setHasAssignment(assignments.length > 0);
        if (assignments.length > 0) {
          setFirstAssignmentId(assignments[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasAssignment(false);
          setFirstAssignmentId(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, schoolBranchId]);

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'personal-data');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const tabLabel =
    activeTab === 'attendance'
      ? t('teachers.details.attendance')
      : activeTab === 'educational-stages'
        ? t('teachers.details.educationalStagesAndClassrooms')
        : activeTab === 'leaves'
          ? t('teachers.details.leaves')
          : t('teachers.details.personalData');

  const breadcrumbItems = isFromJobAnnouncements
    ? [
        { label: t('sidebar.humanResources') },
        { label: t('sidebar.teachingStaff') },
        { label: t('teachers.jobAnnouncements'), path: '/job-announcements' },
        { label: teacherPersonalData?.fullName || t('common.loading') },
      ]
    : isFromCalendarTasks
      ? [
          { label: t('sidebar.tasks'), path: '/calendar/tasks' },
          { label: teacherPersonalData?.fullName || t('common.loading') },
        ]
      : isFromAttendance
        ? [
            { label: t('sidebar.humanResources') },
            { label: t('attendance.title'), path: '/employees/attendance' },
            { label: teacherPersonalData?.fullName || t('common.loading') },
          ]
        : [
            { label: t('sidebar.humanResources') },
            { label: t('sidebar.teachingStaff') },
            { label: t('sidebar.staff'), path: '/teaching-staff?tab=teachers' },
            { label: teacherPersonalData?.fullName || t('common.loading') },
            { label: tabLabel },
          ];

  const tabItems: TabItem[] = [
    {
      id: 'personal-data',
      label: t('teachers.details.personalData'),
      content: <PersonalDataTab teacherId={id || ''} isActive={activeTab === 'personal-data'} />,
    },
    {
      id: 'attendance',
      label: t('teachers.details.attendance'),
      content: (
        <AttendanceTab
          teacherId={id || ''}
          isActive={activeTab === 'attendance'}
          showRecordAttendancePopup={showRecordAttendancePopup}
          setShowRecordAttendancePopup={setShowRecordAttendancePopup}
        />
      ),
    },
    {
      id: 'educational-stages',
      label: t('teachers.details.educationalStagesAndClassrooms'),
      content: isFromAttendance ? (
        <EducationalStagesTabAttendance
          teacherId={id || ''}
          isActive={activeTab === 'educational-stages'}
        />
      ) : (
        <EducationalStagesTab teacherId={id || ''} isActive={activeTab === 'educational-stages'} />
      ),
    },
    ...(isFromAttendance
      ? []
      : [
          {
            id: 'leaves',
            label: t('teachers.details.leaves'),
            content: <LeavesTab teacherId={id || ''} isActive={activeTab === 'leaves'} />,
          },
        ]),
  ];

  if (isLoadingPersonalData || !teacherPersonalData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  // If coming from job-announcements, show only PersonalDataTab without tabs
  if (isFromJobAnnouncements || isFromCalendarTasks) {
    return (
      <div>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <PageHeader title={teacherPersonalData.fullName} />

        {/* PersonalDataTab content only - no tabs */}
        <PersonalDataTab teacherId={id || ''} isActive={true} />
      </div>
    );
  }

  const handlePlacementClick = () => {
    if (hasAssignment && firstAssignmentId) {
      navigate(`/teaching-staff/teachers/${id}/edit-placement/${firstAssignmentId}`);
    } else {
      navigate(`/teachers/${id}/add-placement`);
    }
  };

  const headerActions =
    activeTab === 'educational-stages' && isFromAttendance
      ? [
          {
            label: 'teachers.details.addClassroom',
            onClick: () => navigate(`/teachers/${id}/add-placement`),
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]
      : activeTab === 'attendance'
        ? [
            {
              label: 'teachers.details.recordAttendance',
              onClick: () => setShowRecordAttendancePopup(true),
              imgSrc: PlusIcon,
              imgClassName: 'w-10 h-10',
              circle: true,
            },
          ]
        : activeTab === 'personal-data' && !isFromJobAnnouncements && !isFromCalendarTasks
          ? [
              {
                label: hasAssignment ? 'teachers.placement.editTitle' : 'teachers.placement.title',
                onClick: handlePlacementClick,
                variant: 'primary' as const,
              },
            ]
          : [];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title={teacherPersonalData.fullName}
        actions={headerActions}
        hasHeaderControls={true}
      />

      {/* Tabs */}
      <Tabs
        items={tabItems}
        value={activeTab}
        onChange={handleTabChange}
        variant="underline"
        listClassName="flex w-full md:w-[75%] lg:w-[50%] gap-2 mb-5 px-1 flex-wrap"
        lazy={true}
        searchParamKey="tab"
      />
    </div>
  );
}
