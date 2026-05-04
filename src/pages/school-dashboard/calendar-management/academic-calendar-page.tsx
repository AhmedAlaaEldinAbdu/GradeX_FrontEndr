import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import AcademicCalendarList from './components/AcademicCalendarList';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { useTranslation } from 'react-i18next';

export default function AcademicCalendarPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.academicCalendar') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="academicCalendar.title"
        actions={[
          {
            label: 'academicCalendar.addCalendarButton',
            to: '/calendar/academic/add-academic-calendar',
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
          },
        ]}
        hasHeaderControls={true}
      />

      <AcademicCalendarList />
    </div>
  );
}
