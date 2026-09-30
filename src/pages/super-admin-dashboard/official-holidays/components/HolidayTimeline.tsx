import HolidayCard from './HolidayCard';
import type { OfficialHoliday } from '@/types/officialHolidays';

interface HolidayTimelineProps {
  holidays: OfficialHoliday[];
  isUpcomingHoliday: (dateString?: string) => boolean;
}

export default function HolidayTimeline({ holidays, isUpcomingHoliday }: HolidayTimelineProps) {
  const midpoint = Math.ceil(holidays.length / 2);
  const leftColumn = holidays.slice(0, midpoint);
  const rightColumn = holidays.slice(midpoint);
  const maxLength = Math.max(leftColumn.length, rightColumn.length);

  return (
    <div className="relative">
      {/* Timeline Container */}
      <div className="hidden lg:absolute lg:top-[20px] lg:left-1/2 lg:block lg:h-[calc(100%-40px)] lg:-translate-x-1/2"></div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-8">
        {Array.from({ length: maxLength }).map((_, rowIndex) => {
          const leftHoliday = leftColumn[rowIndex];
          const rightHoliday = rightColumn[rowIndex];

          return (
            <>
              {/* Left Column */}
              {leftHoliday && (
                <div key={`left-${leftHoliday.id}`} className="lg:col-start-1">
                  <HolidayCard
                    holiday={leftHoliday}
                    index={rowIndex + 1}
                    isUpcomingHoliday={isUpcomingHoliday}
                    showConnector={rowIndex < leftColumn.length - 1}
                  />
                </div>
              )}

              {/* Right Column */}
              {rightHoliday && (
                <div key={`right-${rightHoliday.id}`} className="lg:col-start-2">
                  <HolidayCard
                    holiday={rightHoliday}
                    index={midpoint + rowIndex + 1}
                    isUpcomingHoliday={isUpcomingHoliday}
                    showConnector={rowIndex < rightColumn.length - 1}
                  />
                </div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
}
