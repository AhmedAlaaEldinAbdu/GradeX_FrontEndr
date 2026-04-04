import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
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
  const dispatch = useAppDispatch();

  // Check if coming from job-announcements
  const locationState = location.state as LocationState | null;
  const isFromJobAnnouncements = locationState?.comeFrom === 'job-announcements';

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
      content: <AttendanceTab teacherId={id || ''} isActive={activeTab === 'attendance'} />,
    },
    {
      id: 'educational-stages',
      label: t('teachers.details.educationalStagesAndClassrooms'),
      content: (
        <EducationalStagesTab teacherId={id || ''} isActive={activeTab === 'educational-stages'} />
      ),
    },
  ];

  if (isLoadingPersonalData && !teacherPersonalData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  // If coming from job-announcements, show only PersonalDataTab without tabs
  if (isFromJobAnnouncements) {
    return (
      <div>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Teacher Name Title */}
        <div className="mb-6">
          <h1 className="text-start text-2xl font-bold text-gray-900">
            {teacherPersonalData?.fullName || t('common.loading')}
          </h1>
        </div>

        {/* PersonalDataTab content only - no tabs */}
        <PersonalDataTab teacherId={id || ''} isActive={true} />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Teacher Name Title */}
      <div className="mb-6">
        <h1 className="text-start text-2xl font-bold text-gray-900">
          {teacherPersonalData?.fullName || t('common.loading')}
        </h1>
      </div>

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
