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
import Loading from '@/shared/components/Loading';

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

  // Check if coming from job-announcements
  const locationState = location.state as LocationState | null;
  const isFromJobAnnouncements = locationState?.comeFrom === 'job-announcements';
  const isFromCalendarTasks = locationState?.comeFrom === 'calendar-tasks';

  const teacherPersonalData = useAppSelector((state) => state.teachers.teacherPersonalData);
  const isLoadingPersonalData = useAppSelector((state) => state.teachers.isLoadingPersonalData);

  useEffect(() => {
    if (id) {
      dispatch(fetchTeacherPersonalData(id));
    }
  }, [dispatch, id]);

  const breadcrumbItems = isFromJobAnnouncements
    ? [
        { label: t('sidebar.teachingStaff') },
        { label: t('teachers.jobAnnouncements'), path: '/job-announcements' },
        { label: teacherPersonalData?.fullName || t('common.loading') },
      ]
    : isFromCalendarTasks
      ? [
          { label: t('sidebar.tasks'), path: '/calendar/tasks' },
          { label: teacherPersonalData?.fullName || t('common.loading') },
        ]
      : [
          { label: t('sidebar.teachingStaff') },
          { label: t('teachers.title'), path: '/teachers' },
          { label: teacherPersonalData?.fullName || t('common.loading') },
        ];

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'personal-data');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

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
      content: (
        <EducationalStagesTab teacherId={id || ''} isActive={activeTab === 'educational-stages'} />
      ),
    },
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

  const headerActions =
    activeTab === 'educational-stages'
      ? [
          {
            label: 'teachers.details.addClassroom',
            onClick: () => navigate(`/teachers/${id}/add-placement`),
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
          },
        ]
      : activeTab === 'attendance'
        ? [
            {
              label: 'teachers.details.recordAttendance',
              onClick: () => setShowRecordAttendancePopup(true),
              imgSrc: PlusIcon,
              imgClassName: 'w-[24px] h-[24px]',
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
        listClassName="flex w-[100%] md:w-[75%] lg:w-[50%] gap-2 mb-5 px-1 flex-wrap"
        lazy={true}
        searchParamKey="tab"
      />
    </div>
  );
}
