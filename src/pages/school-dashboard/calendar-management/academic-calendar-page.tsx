import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import AcademicCalendarList from './components/AcademicCalendarList';

export default function AcademicCalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="academicCalendar.annualCalendar"
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
